from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
import uuid

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer enriching token response with user profile & roles."""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['is_client'] = user.is_client
        token['is_provider'] = user.is_provider
        token['email_verified'] = user.email_verified
        token['name'] = user.display_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'display_name': self.user.display_name,
            'is_client': self.user.is_client,
            'is_provider': self.user.is_provider,
            'email_verified': self.user.email_verified,
            'avatar_url': self.user.avatar.url if self.user.avatar else self.user.avatar_url,
        }
        return data

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'password', 'password_confirm',
            'is_client', 'is_provider', 'phone_number'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        
        # If user registers as provider, automatically initialize an empty provider profile
        if user.is_provider:
            from apps.providers.models import ProviderProfile
            ProviderProfile.objects.get_or_create(user=user)

        return user

class UserProfileSerializer(serializers.ModelSerializer):
    avatar_url_computed = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'display_name',
            'is_client', 'is_provider', 'phone_number', 'bio',
            'avatar', 'avatar_url', 'avatar_url_computed',
            'email_verified', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'email_verified', 'created_at']

    def get_avatar_url_computed(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return obj.avatar_url or f"https://api.dicebear.com/7.x/initials/svg?seed={obj.display_name}"

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs
