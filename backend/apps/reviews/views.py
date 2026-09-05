from rest_framework import generics, permissions, status
from rest_framework.response import Response
from apps.notifications.models import Notification
from .models import Review
from .serializers import ReviewSerializer, CreateReviewSerializer

class CreateReviewView(generics.CreateAPIView):
    """
    Submit a star rating & review for a completed booking.
    """
    serializer_class = CreateReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        review = serializer.save()
        # In-app notification to tutor
        Notification.objects.create(
            recipient=review.provider.user,
            title=f'New {review.rating}★ Review Received!',
            message=f'{review.client.display_name} reviewed your session: "{review.comment[:60]}..."',
            notification_type='general',
            action_url='/dashboard/provider'
        )

class ProviderReviewsListView(generics.ListAPIView):
    """
    Public list of reviews left for a specific provider profile.
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        provider_id = self.kwargs['provider_id']
        return Review.objects.filter(provider_id=provider_id).select_related('client', 'booking__service')
