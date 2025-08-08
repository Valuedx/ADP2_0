from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView,
    CreateUserAPIView,
    ProfileDetailsView,
    UserListView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

urlpatterns = [
    path('IDA/login/', LoginView.as_view(), name='login'),
    # Add other URL patterns for different functionalities
    path('IDA/create_user/', CreateUserAPIView.as_view(), name='create_user'),
    path('profile/', ProfileDetailsView.as_view(), name='profile'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('IDA/password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('IDA/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('IDA/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]