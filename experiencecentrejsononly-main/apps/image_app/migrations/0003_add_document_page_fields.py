# Create this file: image_app/migrations/0003_add_document_page_fields.py

from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('image_app', '0002_add_metrics_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='pages_processed',
            field=models.IntegerField(default=1),
        ),
        migrations.AddField(
            model_name='document',
            name='is_full_document',
            field=models.BooleanField(default=False),
        ),
    ]
