# Create new file: image_app/admin_views.py

from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)
CustomUser = get_user_model()

class AdminUserReportView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get comprehensive user report for admins"""
        user = request.user
        
        # Check if user is admin
        if user.user_type != 'admin':
            return Response(
                {"error": "Admin access required"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Get all users with their usage statistics
            users = CustomUser.objects.all().annotate(
                total_documents=Count('documents'),
                total_input_tokens=Sum('documents__input_token'),
                total_output_tokens=Sum('documents__output_token'),
                total_pages_from_docs=Sum('documents__pages_processed')
            ).order_by('-registration_datetime')
            
            user_reports = []
            for u in users:
                # Calculate usage statistics
                total_docs = u.total_documents or 0
                total_input = u.total_input_tokens or 0
                total_output = u.total_output_tokens or 0
                total_pages_docs = u.total_pages_from_docs or 0
                
                # Days since registration
                days_registered = (timezone.now() - u.registration_datetime).days
                
                # Usage status
                usage_status = "Active" if u.last_document_processed and \
                              (timezone.now() - u.last_document_processed).days <= 30 else "Inactive"
                
                # Calculate usage percentage for default users
                usage_percentage = 0
                if u.user_type == 'default' and u.max_documents_allowed > 0:
                    usage_percentage = (u.documents_processed / u.max_documents_allowed) * 100
                
                user_data = {
                    "id": u.id,
                    "username": u.username,
                    "email": u.email,
                    "phone_number": u.phone_number or "Not provided",
                    "user_type": u.user_type,
                    "registration_datetime": u.registration_datetime.strftime("%Y-%m-%d %H:%M:%S"),
                    "days_registered": days_registered,
                    "usage_status": usage_status,
                    "last_document_processed": u.last_document_processed.strftime("%Y-%m-%d %H:%M:%S") if u.last_document_processed else "Never",
                    
                    # Document statistics
                    "documents_processed": u.documents_processed,
                    "max_documents_allowed": u.max_documents_allowed if u.user_type == 'default' else "Unlimited",
                    "usage_percentage": round(usage_percentage, 1),
                    
                    # Page statistics
                    "total_pages_processed": u.total_pages_processed,
                    "pages_from_documents": total_pages_docs,
                    
                    # Token statistics
                    "total_input_tokens": total_input,
                    "total_output_tokens": total_output,
                    "total_tokens": total_input + total_output,
                    
                    # Additional metrics
                    "total_documents_in_db": total_docs,
                    "avg_pages_per_doc": round(total_pages_docs / total_docs, 1) if total_docs > 0 else 0,
                    "is_approaching_limit": usage_percentage > 80 if u.user_type == 'default' else False,
                    "is_at_limit": u.documents_processed >= u.max_documents_allowed if u.user_type == 'default' else False,
                }
                
                user_reports.append(user_data)
            
            # Overall statistics
            total_users = len(user_reports)
            active_users = len([u for u in user_reports if u['usage_status'] == 'Active'])
            users_at_limit = len([u for u in user_reports if u.get('is_at_limit', False)])
            users_approaching_limit = len([u for u in user_reports if u.get('is_approaching_limit', False)])
            
            # User type breakdown
            user_type_stats = {
                'default': len([u for u in user_reports if u['user_type'] == 'default']),
                'power': len([u for u in user_reports if u['user_type'] == 'power']),
                'admin': len([u for u in user_reports if u['user_type'] == 'admin'])
            }
            
            # Recent registrations (last 30 days)
            recent_registrations = len([u for u in user_reports if u['days_registered'] <= 30])
            
            summary = {
                "total_users": total_users,
                "active_users": active_users,
                "inactive_users": total_users - active_users,
                "users_at_limit": users_at_limit,
                "users_approaching_limit": users_approaching_limit,
                "recent_registrations_30d": recent_registrations,
                "user_type_breakdown": user_type_stats,
                "total_documents_processed": sum(u['total_documents_in_db'] for u in user_reports),
                "total_pages_processed": sum(u['total_pages_processed'] for u in user_reports),
                "total_tokens_consumed": sum(u['total_tokens'] for u in user_reports)
            }
            
            return Response({
                "status": "success",
                "summary": summary,
                "users": user_reports,
                "generated_at": timezone.now().strftime("%Y-%m-%d %H:%M:%S")
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error generating admin user report: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to generate user report"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdminUserManagementView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Update user type or limits"""
        user = request.user
        
        # Check if user is admin
        if user.user_type != 'admin':
            return Response(
                {"error": "Admin access required"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            user_id = request.data.get('user_id')
            action = request.data.get('action')  # 'change_type', 'update_limit', 'reset_usage'
            
            if not user_id or not action:
                return Response(
                    {"error": "user_id and action are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            target_user = CustomUser.objects.get(id=user_id)
            
            if action == 'change_type':
                new_type = request.data.get('new_type')
                if new_type not in ['default', 'power', 'admin']:
                    return Response(
                        {"error": "Invalid user type. Must be 'default', 'power', or 'admin'"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                old_type = target_user.user_type
                target_user.user_type = new_type
                
                # Set appropriate limits based on user type
                if new_type == 'default':
                    target_user.max_documents_allowed = 20
                elif new_type in ['power', 'admin']:
                    target_user.max_documents_allowed = 99999  # Effectively unlimited
                
                target_user.save()
                
                logger.info(f"Admin {user.username} changed user {target_user.username} type from {old_type} to {new_type}")
                
                return Response({
                    "status": "success",
                    "message": f"User type changed from {old_type} to {new_type}",
                    "user_info": {
                        "id": target_user.id,
                        "username": target_user.username,
                        "user_type": target_user.user_type,
                        "max_documents_allowed": target_user.max_documents_allowed
                    }
                }, status=status.HTTP_200_OK)
            
            elif action == 'update_limit':
                new_limit = request.data.get('new_limit')
                if not isinstance(new_limit, int) or new_limit < 0:
                    return Response(
                        {"error": "new_limit must be a positive integer"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                old_limit = target_user.max_documents_allowed
                target_user.max_documents_allowed = new_limit
                target_user.save()
                
                logger.info(f"Admin {user.username} changed user {target_user.username} document limit from {old_limit} to {new_limit}")
                
                return Response({
                    "status": "success",
                    "message": f"Document limit updated from {old_limit} to {new_limit}",
                    "user_info": {
                        "id": target_user.id,
                        "username": target_user.username,
                        "max_documents_allowed": target_user.max_documents_allowed,
                        "documents_processed": target_user.documents_processed
                    }
                }, status=status.HTTP_200_OK)
            
            elif action == 'reset_usage':
                old_docs = target_user.documents_processed
                old_pages = target_user.total_pages_processed
                
                target_user.documents_processed = 0
                target_user.total_pages_processed = 0
                target_user.last_document_processed = None
                target_user.save()
                
                logger.info(f"Admin {user.username} reset usage for user {target_user.username}")
                
                return Response({
                    "status": "success",
                    "message": f"Usage reset. Documents: {old_docs}→0, Pages: {old_pages}→0",
                    "user_info": {
                        "id": target_user.id,
                        "username": target_user.username,
                        "documents_processed": target_user.documents_processed,
                        "total_pages_processed": target_user.total_pages_processed
                    }
                }, status=status.HTTP_200_OK)
            
            else:
                return Response(
                    {"error": "Invalid action. Must be 'change_type', 'update_limit', or 'reset_usage'"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error in admin user management: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to update user"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserUsageStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current user's usage statistics"""
        user = request.user
        
        try:
            usage_info = user.get_usage_info()
            
            # Additional stats for the current user
            from .models import Document
            recent_documents = Document.objects.filter(
                userid=user,
                entry_date__gte=timezone.now() - timedelta(days=30)
            ).count()
            
            last_document = Document.objects.filter(userid=user).order_by('-entry_date').first()
            
            stats = {
                **usage_info,
                "recent_documents_30d": recent_documents,
                "last_document_date": last_document.entry_date.strftime("%Y-%m-%d") if last_document else None,
                "registration_date": user.registration_datetime.strftime("%Y-%m-%d"),
                "days_registered": (timezone.now() - user.registration_datetime).days,
            }
            
            # Add warnings for default users approaching limits
            if user.user_type == 'default':
                usage_percentage = (user.documents_processed / user.max_documents_allowed) * 100
                stats["usage_percentage"] = round(usage_percentage, 1)
                
                if usage_percentage >= 90:
                    stats["warning"] = "You're approaching your document limit. Contact plg@valuedx.com or plg@automationedge.com for an upgrade."
                elif usage_percentage >= 75:
                    stats["notice"] = "You've used most of your document allowance. Consider upgrading soon."
            
            return Response({
                "status": "success",
                "usage_stats": stats
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching user usage stats: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch usage statistics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
