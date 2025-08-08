from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    filename = serializers.SerializerMethodField()  # ✅ Custom field
    filePath = serializers.CharField(source="file_path", read_only=True)

    class Meta:
        model = Document
        fields = [
            "id",
            "userid",
            "filePath",
            "file",
            "json_data",
            "entry_date",
            "document_type",
            "input_token",
            "output_token",
            "api_response_time",
            "db_save_time",
            "llm_model_used",
            "pages_processed",
            "is_full_document",
            "filename",
        ]

    def get_filename(self, obj):
        return obj.file.name.split('/')[-1] if obj.file else None
