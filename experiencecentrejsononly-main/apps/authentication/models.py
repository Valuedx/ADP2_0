from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = [
        ('default', 'Default User'),
        ('power', 'Power User'),
        ('admin', 'Admin User'),
    ]
    
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='default')
    documents_processed = models.IntegerField(default=0)
    total_pages_processed = models.IntegerField(default=0)
    max_documents_allowed = models.IntegerField(default=20)
    registration_datetime = models.DateTimeField(default=timezone.now)
    last_document_processed = models.DateTimeField(null=True, blank=True)
    
    def can_process_document(self):
        """Check if user can process another document"""
        if self.user_type in ['power', 'admin']:
            return True, None

        max_allowed = self.max_documents_allowed
        if max_allowed <= 0:
            max_allowed = self._meta.get_field('max_documents_allowed').default

        if self.documents_processed >= max_allowed:
            return False, f"Document limit reached ({self.documents_processed}/{max_allowed}). Please contact plg@valuedx.com or plg@automationedge.com for upgrade."

        return True, None
    
    def get_usage_info(self):
        """Get current usage information"""
        return {
            'documents_processed': self.documents_processed,
            'max_documents_allowed': self.max_documents_allowed,
            'total_pages_processed': self.total_pages_processed,
            'user_type': self.user_type,
            'can_process_more': self.can_process_document()[0]
        }
    
    def increment_usage(self, pages_processed=1):
        """Increment usage counters"""
        self.documents_processed += 1
        self.total_pages_processed += pages_processed
        self.last_document_processed = timezone.now()
        self.save(update_fields=['documents_processed', 'total_pages_processed', 'last_document_processed'])

