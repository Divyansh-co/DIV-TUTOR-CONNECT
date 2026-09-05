from django.db import models
from django.conf import settings
from apps.providers.models import ProviderProfile, ServiceListing

class Booking(models.Model):
    """
    Core booking record connecting a Client with a Tutor for a scheduled session.
    """
    STATUS_CHOICES = (
        ('PENDING', 'Pending Confirmation / Payment'),
        ('CONFIRMED', 'Confirmed & Scheduled'),
        ('COMPLETED', 'Session Completed'),
        ('CANCELLED', 'Cancelled'),
        ('DECLINED', 'Declined by Tutor'),
    )

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_bookings'
    )
    provider = models.ForeignKey(
        ProviderProfile,
        on_delete=models.CASCADE,
        related_name='provider_bookings'
    )
    service = models.ForeignKey(
        ServiceListing,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    
    total_price = models.DecimalField(max_digits=8, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    notes = models.TextField(blank=True, default='')
    cancellation_reason = models.TextField(blank=True, default='')
    meeting_link = models.URLField(blank=True, default='')

    # Stripe tracking
    stripe_payment_intent_id = models.CharField(max_length=100, blank=True, default='')
    stripe_checkout_session_id = models.CharField(max_length=150, blank=True, default='')
    is_paid = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['client', 'status']),
            models.Index(fields=['provider', 'status']),
            models.Index(fields=['start_time', 'end_time']),
            models.Index(fields=['stripe_payment_intent_id']),
        ]

    def __str__(self):
        return f"Booking #{self.id}: {self.client.display_name} with {self.provider.user.display_name} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.meeting_link:
            self.meeting_link = f"https://meet.jit.si/tutorconnect-session-{self.provider.id}-{self.client.id}"
        super().save(*args, **kwargs)
