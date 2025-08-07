from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    filename = serializers.SerializerMethodField()  # ✅ Custom field

    class Meta:
        model = Document
        fields = '__all__'

    def get_filename(self, obj):
        return obj.file.name.split('/')[-1] if obj.file else None
