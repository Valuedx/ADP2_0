# Create your models here.
from django.db import models
from django.conf import settings
from django.utils import timezone

class Document(models.Model):
    userid = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    file_path = models.CharField(max_length=255, blank=True)
    file = models.FileField(upload_to='uploads/')
    json_data = models.JSONField(blank=True, null=True)
    entry_date = models.DateField(default=timezone.now)
    document_type = models.TextField(blank=True, null=True)
    input_token =  models.IntegerField(blank=True, null=True)
    output_token =  models.IntegerField(blank=True, null=True)
    api_response_time = models.FloatField(blank=True, null=True)
    db_save_time = models.FloatField(blank=True, null=True)
    llm_model_used = models.CharField(max_length=255, blank=True, null=True)
    pages_processed = models.IntegerField(default=1)  # New field
    is_full_document = models.BooleanField(default=False)  # New field for power users
 
    def __str__(self):
        return f"Document {self.id} for {self.userid.username}"


