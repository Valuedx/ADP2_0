from .settings import *
import types
import sys

# Provide a lightweight stub for vertex_model to avoid external dependencies in tests
sys.modules.setdefault(
    "apps.image_app.vertex_model",
    types.SimpleNamespace(
        call_gemini_api_with_streaming=lambda *args, **kwargs: None,
        MODEL_ID="test-model",
    ),
)

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}
