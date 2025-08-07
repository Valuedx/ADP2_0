# Create this file: apps/authentication/migrations/0002_add_user_types_and_usage.py

from django.db import migrations, models
import django.utils.timezone

class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),  # Adjust based on your last migration
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='user_type',
            field=models.CharField(
                max_length=20,
                choices=[
                    ('default', 'Default User'),
                    ('power', 'Power User'),
                    ('admin', 'Admin User'),
                ],
                default='default'
            ),
        ),
        migrations.AddField(
            model_name='customuser',
            name='documents_processed',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='customuser',
            name='total_pages_processed',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='customuser',
            name='max_documents_allowed',
            field=models.IntegerField(default=20),
        ),
        migrations.AddField(
            model_name='customuser',
            name='registration_datetime',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name='customuser',
            name='last_document_processed',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
