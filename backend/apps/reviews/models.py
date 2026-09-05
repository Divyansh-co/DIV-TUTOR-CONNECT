from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.providers.models import ProviderProfile
from apps.bookings.models import Booking

class Review(models.Model):
    """
    Verified review left by a client after a completed booking.
    One review per booking enforced by OneToOneField.
    """
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='review'
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_reviews'
    )
    provider = models.ForeignKey(
        ProviderProfile,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Star rating from 1 to 5"
    )
    comment = models.TextField(help_text="Detailed feedback")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['provider', 'rating']),
            models.Index(fields=['client']),
        ]

    def __str__(self):
        return f"Review by {self.client.display_name} for {self.provider.user.display_name} ({self.rating}★)"
