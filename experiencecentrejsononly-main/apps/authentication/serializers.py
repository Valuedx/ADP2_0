from rest_framework import serializers
from .models import CustomUser


class LoginSerializer(serializers.ModelSerializer):
    #email = serializers.EmailField()
    username =  serializers.CharField()
    password = serializers.CharField()
    class Meta:
        model = CustomUser
        fields = ('username', 'password')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password','phone_number']
        extra_kwargs = {'password': {'write_only': True}}


class ProfileSerializer(serializers.ModelSerializer):
   
    class Meta:
        model = CustomUser
        fields = ('id' ,'username', 'email')


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting a password reset."""
    username_or_email = serializers.CharField()

    def validate_username_or_email(self, value):
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Please enter a valid email or username")
        return value.strip()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming a password reset."""
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
