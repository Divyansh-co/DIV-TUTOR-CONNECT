import uuid
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.throttling import ScopedRateThrottle
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Login endpoint issuing JWT access and refresh tokens.
    Enriched with user role details and profile info.
    """
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

class RegisterView(generics.CreateAPIView):
    """
    Register a new user as a Client, Provider, or both.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Send welcome/verification email
        try:
            send_mail(
                subject='Welcome to TutorConnect - Verify your email',
                message=(
                    f"Hello {user.first_name or user.email},\n\n"
                    f"Thank you for joining TutorConnect!\n"
                    f"Please verify your email using this token: {user.verification_token}\n\n"
                    f"Or visit: {settings.FRONTEND_URL}/verify-email?token={user.verification_token}\n\n"
                    f"— Team TutorConnect\nBuilt by Divyansh Mishra"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response({
            "message": "User registered successfully. Please verify your email.",
            "user": {
                "id": user.id,
                "email": user.email,
                "is_client": user.is_client,
                "is_provider": user.is_provider,
            }
        }, status=status.HTTP_201_CREATED)

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the currently authenticated user's profile.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class VerifyEmailView(APIView):
    """
    Confirm email verification using the unique token.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(verification_token=token)
            user.email_verified = True
            user.save(update_fields=['email_verified'])
            return Response({"message": "Email verified successfully!"}, status=status.HTTP_200_OK)
        except (User.DoesNotExist, ValueError):
            return Response({"error": "Invalid verification token"}, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
    """
    Initiate a password reset email for an existing account.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
            user.password_reset_token = uuid.uuid4()
            user.password_reset_sent_at = timezone.now()
            user.save(update_fields=['password_reset_token', 'password_reset_sent_at'])

            send_mail(
                subject='TutorConnect - Password Reset Request',
                message=(
                    f"Hello {user.first_name or user.email},\n\n"
                    f"You requested a password reset. Use this token to reset your password:\n"
                    f"{user.password_reset_token}\n\n"
                    f"Or visit: {settings.FRONTEND_URL}/reset-password?token={user.password_reset_token}\n\n"
                    f"If you did not request this, please ignore this email.\n\n"
                    f"— Team TutorConnect\nBuilt by Divyansh Mishra"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except User.DoesNotExist:
            # Generic response to prevent user enumeration
            pass

        return Response({"message": "If this email is registered, password reset instructions have been sent."})

class PasswordResetConfirmView(APIView):
    """
    Set a new password given a valid reset token.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data['token']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(password_reset_token=token)
            # Token expiration: 24 hours
            if user.password_reset_sent_at and (timezone.now() - user.password_reset_sent_at).total_seconds() > 86400:
                return Response({"error": "Reset token has expired"}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(password)
            user.password_reset_token = None
            user.password_reset_sent_at = None
            user.save()
            return Response({"message": "Password has been successfully reset. You may now log in."})
        except User.DoesNotExist:
            return Response({"error": "Invalid reset token"}, status=status.HTTP_400_BAD_REQUEST)
