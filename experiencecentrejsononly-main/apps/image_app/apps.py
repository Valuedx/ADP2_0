from django.apps import AppConfig


class ImageAppConfig(AppConfig):
    """Configuration for the image extraction app."""

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.image_app'

    def ready(self):
        from .logger import setup_logging

        setup_logging()

