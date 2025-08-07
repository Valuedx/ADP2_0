import logging
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    LoginSerializer,
    UserSerializer,
    ProfileSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from apps.image_app.logger import log_exception
from .emails import send_password_reset_email


logger = logging.getLogger(__name__)


CustomUser = get_user_model()
class CreateUserAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logger.info("User registration request received.")
        try:
            serializer = UserSerializer(data=request.data)

            if not serializer.is_valid():
                logger.warning("Invalid user data received during registration.")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            email = serializer.validated_data['email']
            username = serializer.validated_data['username']

            # Check for duplicate email
            if CustomUser.objects.filter(email=email).exists():
                logger.warning(f"Email already registered: {email}")
                return Response({'message': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

            # Check for duplicate username
            if CustomUser.objects.filter(username=username).exists():
                logger.warning(f"Username already taken: {username}")
                return Response({'message': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)

            password = serializer.validated_data['password']
            phone_number = serializer.validated_data['phone_number']

            # Create the user
            user = CustomUser.objects.create_user(username=username, email=email, password=password)
            user.phone_number = phone_number
            user.save()

            token = get_tokens_for_user(user)
            logger.info(f"User created successfully: {username} (Email: {email})")

            return Response({
                'token': token,
                'message': 'User created successfully'
            }, status=status.HTTP_201_CREATED)

        except Exception:
            logger.error("Error occurred during user registration.", exc_info=True)
            log_exception(logger)
            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer



#Generate token manually
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


from rest_framework.permissions import IsAuthenticated
class ProfileDetailsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        serializer = ProfileSerializer(request.user)
        
        return Response(serializer.data)
        
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logger.info("Login attempt received.")

        try:
            serializer = LoginSerializer(data=request.data)

            if not serializer.is_valid():
                logger.warning("Login failed: invalid data.")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            user = authenticate(request, username=username, password=password)

            if user is not None:
                refresh = RefreshToken.for_user(user)

                logger.info(f"Login successful for user: {username}")
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'username': username,
                    'id': user.id,
                    # Use camelCase to match frontend expectations
                    'userType': user.user_type,
                    'message': 'Login successful'
                }, status=status.HTTP_200_OK)
            else:
                logger.warning(f"Login failed for username: {username} — invalid credentials.")
                return Response({'message': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

        except Exception:
            logger.error("Unexpected error occurred during login.", exc_info=True)
            log_exception(logger)
            return Response(
                {'message': 'An unexpected error occurred during login. Please try again later.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PasswordResetRequestView(APIView):
    """Generate a password reset token for a user."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username_or_email = serializer.validated_data["username_or_email"]
        try:
            # Support both email and username lookup
            if "@" in username_or_email:
                user = CustomUser.objects.get(email=username_or_email)
            else:
                user = CustomUser.objects.get(username=username_or_email)
        except CustomUser.DoesNotExist:
            # Same response for security (don't reveal if user exists)
            return Response({"message": "If the email/username is registered, a reset token has been sent."})

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        logger.info(f"Password reset token generated for user {user.username}")

        # Send password reset email
        try:
            send_password_reset_email(request, user, uid, token)
        except Exception:
            logger.error("Error sending password reset email", exc_info=True)
            log_exception(logger)
            return Response({"message": "Failed to send reset email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "If the email/username is registered, a reset token has been sent."})


class PasswordResetConfirmView(APIView):
    """Reset a user's password using the provided token."""
    permission_classes = [AllowAny]

    def get(self, request):
        """Handle GET requests from email links - redirect to frontend with params"""
        uid = request.GET.get('uid')
        token = request.GET.get('token')

        if not uid or not token:
            return Response(
                {"message": "Invalid reset link - missing parameters"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk=user_id)

            if not default_token_generator.check_token(user, token):
                return Response(
                    {"message": "Invalid or expired reset link"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            frontend_url = getattr(settings, "FRONTEND_URL", "")
            if not frontend_url:
                protocol = 'https' if request.is_secure() else 'http'
                domain = request.get_host()
                frontend_url = f"{protocol}://{domain}"

            redirect_url = f"{frontend_url}/password-reset-confirm?uid={uid}&token={token}"

            from django.http import HttpResponseRedirect

            return HttpResponseRedirect(redirect_url)

        except (CustomUser.DoesNotExist, ValueError):
            return Response(
                {"message": "Invalid reset link"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = CustomUser.objects.get(pk=uid)
        except Exception:
            return Response({"message": "Invalid reset data"}, status=status.HTTP_400_BAD_REQUEST)

        token = serializer.validated_data["token"]
        if not default_token_generator.check_token(user, token):
            return Response({"message": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data["new_password"])
        user.save()
        logger.info(f"Password reset successful for user {user.username}")
        return Response({"message": "Password has been reset"})
