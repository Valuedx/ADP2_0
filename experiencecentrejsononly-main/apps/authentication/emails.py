import logging

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags


logger = logging.getLogger(__name__)


def send_password_reset_email(request, user, uid, token):
    """Send password reset email to user."""
    subject = "Password Reset"
    frontend_url = getattr(settings, "FRONTEND_URL", "")
    if frontend_url:
        base_url = frontend_url.rstrip("/")
    else:
        # Fallback to request host
        protocol = 'https' if request.is_secure() else 'http'
        domain = request.get_host()
        base_url = f"{protocol}://{domain}"
        logger.warning(f"FRONTEND_URL not configured, using fallback: {base_url}")
    reset_link = f"{base_url}/password-reset-confirm?uid={uid}&token={token}"
    context = {
        "user": user,
        "reset_link": reset_link,
    }
    html_message = render_to_string("password_reset_email.html", context)
    message = strip_tags(html_message)
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=html_message,
    )
