# Register # authentication/admin.py - Enhanced Django admin integration
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # Add custom fields to the admin interface
    list_display = (
        'username', 
        'email', 
        'user_type', 
        'documents_processed',
        'max_documents_allowed',
        'usage_percentage',
        'total_pages_processed',
        'registration_datetime',
        'last_document_processed',
        'is_active',
        'usage_status'
    )
    
    list_filter = (
        'user_type', 
        'is_active', 
        'is_staff', 
        'registration_datetime',
        'last_document_processed'
    )
    
    search_fields = ('username', 'email', 'phone_number')
    
    readonly_fields = (
        'registration_datetime', 
        'last_login', 
        'date_joined',
        'usage_percentage_display',
        'days_registered',
        'total_tokens_consumed'
    )
    
    # Organize fields in sections
    fieldsets = UserAdmin.fieldsets + (
        ('User Type & Limits', {
            'fields': (
                'user_type', 
                'max_documents_allowed',
                'documents_processed',
                'total_pages_processed'
            )
        }),
        ('Contact Information', {
            'fields': ('phone_number',)
        }),
        ('Usage Statistics', {
            'fields': (
                'registration_datetime',
                'last_document_processed',
                'usage_percentage_display',
                'days_registered',
            ),
            'classes': ('collapse',)
        }),
    )
    
    # Add fields to the add user form
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('email', 'phone_number', 'user_type', 'max_documents_allowed')
        }),
    )
    
    actions = ['make_power_user', 'make_default_user', 'reset_usage', 'increase_limit']
    
    def usage_percentage(self, obj):
        """Calculate and display usage percentage"""
        if obj.user_type == 'default' and obj.max_documents_allowed > 0:
            percentage = (obj.documents_processed / obj.max_documents_allowed) * 100
            color = 'red' if percentage >= 90 else 'orange' if percentage >= 75 else 'green'
            return format_html(
                '<span style="color: {};">{:.1f}%</span>',
                color,
                percentage
            )
        return 'Unlimited'
    
    usage_percentage.short_description = 'Usage %'
    usage_percentage.admin_order_field = 'documents_processed'
    
    def usage_percentage_display(self, obj):
        """Detailed usage percentage for readonly display"""
        if obj.user_type == 'default' and obj.max_documents_allowed > 0:
            percentage = (obj.documents_processed / obj.max_documents_allowed) * 100
            return f"{percentage:.1f}% ({obj.documents_processed}/{obj.max_documents_allowed})"
        return 'Unlimited usage'
    
    usage_percentage_display.short_description = 'Usage Percentage'
    
    def usage_status(self, obj):
        """Display if user is active or inactive"""
        if obj.last_document_processed:
            days_since = (timezone.now() - obj.last_document_processed).days
            if days_since <= 7:
                return format_html('<span style="color: green;">Very Active</span>')
            elif days_since <= 30:
                return format_html('<span style="color: orange;">Active</span>')
            else:
                return format_html('<span style="color: red;">Inactive</span>')
        return format_html('<span style="color: gray;">Never Used</span>')
    
    usage_status.short_description = 'Status'
    
    def days_registered(self, obj):
        """Calculate days since registration"""
        return (timezone.now() - obj.registration_datetime).days
    
    days_registered.short_description = 'Days Registered'
    
    def total_tokens_consumed(self, obj):
        """Calculate total tokens from all documents"""
        from apps.image_app.models import Document
        docs = Document.objects.filter(userid=obj)
        total_input = sum(doc.input_token or 0 for doc in docs)
        total_output = sum(doc.output_token or 0 for doc in docs)
        return f"Input: {total_input:,}, Output: {total_output:,}, Total: {total_input + total_output:,}"
    
    total_tokens_consumed.short_description = 'Token Usage'
    
    # Custom admin actions
    def make_power_user(self, request, queryset):
        """Convert selected users to power users"""
        updated = 0
        for user in queryset:
            if user.user_type != 'power':
                user.user_type = 'power'
                user.max_documents_allowed = 99999
                user.save()
                updated += 1
        
        self.message_user(
            request, 
            f'{updated} user(s) converted to Power User type.'
        )
    
    make_power_user.short_description = "Convert to Power User"
    
    def make_default_user(self, request, queryset):
        """Convert selected users to default users"""
        updated = 0
        for user in queryset:
            if user.user_type != 'default':
                user.user_type = 'default'
                user.max_documents_allowed = 20
                user.save()
                updated += 1
        
        self.message_user(
            request, 
            f'{updated} user(s) converted to Default User type.'
        )
    
    make_default_user.short_description = "Convert to Default User"
    
    def reset_usage(self, request, queryset):
        """Reset usage counters for selected users"""
        updated = 0
        for user in queryset:
            user.documents_processed = 0
            user.total_pages_processed = 0
            user.last_document_processed = None
            user.save()
            updated += 1
        
        self.message_user(
            request, 
            f'Usage reset for {updated} user(s).'
        )
    
    reset_usage.short_description = "Reset usage counters"
    
    def increase_limit(self, request, queryset):
        """Increase document limit by 10 for selected users"""
        updated = 0
        for user in queryset:
            if user.user_type == 'default':
                user.max_documents_allowed += 10
                user.save()
                updated += 1
        
        self.message_user(
            request, 
            f'Document limit increased by 10 for {updated} user(s).'
        )
    
    increase_limit.short_description = "Increase document limit (+10)"

# Also register the Document model for better admin experience
from apps.image_app.models import Document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'userid',
        'document_type',
        'pages_processed',
        'is_full_document',
        'entry_date',
        'input_token',
        'output_token',
        'api_response_time'
    )
    
    list_filter = (
        'document_type',
        'is_full_document',
        'entry_date',
        'userid__user_type'
    )
    
    search_fields = ('userid__username', 'userid__email', 'document_type')
    
    readonly_fields = (
        'entry_date',
        'api_response_time',
        'db_save_time',
        'llm_model_used'
    )
    
    def get_queryset(self, request):
        """Optimize queries by selecting related user data"""
        return super().get_queryset(request).select_related('userid')
