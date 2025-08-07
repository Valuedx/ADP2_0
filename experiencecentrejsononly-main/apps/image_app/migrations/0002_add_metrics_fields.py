from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('image_app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='api_response_time',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='document',
            name='db_save_time',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='document',
            name='llm_model_used',
            field=models.CharField(max_length=255, blank=True, null=True),
        ),
    ]
