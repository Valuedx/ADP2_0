# apps.image_app/urls.py - Updated with new endpoints
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from .views import (
    GetDocumentByIdView, 
    UserDocumentView, 
    FilteredDocumentView,
    UploadAndProcessFileView,
    ProcessFullDocumentView
)
from .admin_views import (
    AdminUserReportView,
    AdminUserManagementView,
    UserUsageStatsView
)

urlpatterns = [
    # Existing endpoints
    path("upload/", UploadAndProcessFileView.as_view(), name="upload_file"),
    path('documents/', UserDocumentView.as_view(), name='user-documents'),
    path('document-filter/', FilteredDocumentView.as_view(), name='filtered-documents'),
    path('get-document/<path:doc_id>/', GetDocumentByIdView.as_view(), name='get-document-by-id'),
    
    # New endpoints
    path('process-full-document/', ProcessFullDocumentView.as_view(), name='process-full-document'),
    path('usage-stats/', UserUsageStatsView.as_view(), name='user-usage-stats'),
    
    # Admin endpoints
    path('admin/user-report/', AdminUserReportView.as_view(), name='admin-user-report'),
    path('admin/manage-user/', AdminUserManagementView.as_view(), name='admin-manage-user'),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


