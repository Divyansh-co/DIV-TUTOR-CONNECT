from decimal import Decimal
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class ProviderProfile(models.Model):
    """
    Public profile for a tutor/service provider on TutorConnect.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='provider_profile'
    )
    headline = models.CharField(max_length=160, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    hourly_rate = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=Decimal('45.00'),
        validators=[MinValueValidator(Decimal('5.00'))]
    )
    rating_avg = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=Decimal('5.00'),
        validators=[MinValueValidator(Decimal('1.0')), MaxValueValidator(Decimal('5.0'))]
    )
    reviews_count = models.PositiveIntegerField(default=0)
    
    # Location & Mobility
    city = models.CharField(max_length=100, blank=True, default='San Francisco')
    state = models.CharField(max_length=50, blank=True, default='CA')
    country = models.CharField(max_length=50, blank=True, default='USA')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    travel_radius_km = models.PositiveIntegerField(default=25, help_text="Service radius in kilometers")
    offers_online = models.BooleanField(default=True)
    offers_in_person = models.BooleanField(default=True)

    # Skills, Languages & Media
    skills = models.JSONField(default=list, blank=True, help_text="List of subjects/skills strings")
    languages = models.JSONField(default=list, blank=True, help_text="Languages spoken")
    portfolio_images = models.JSONField(default=list, blank=True, help_text="List of image URLs or badges")
    
    # Marketplace status
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    stripe_account_id = models.CharField(max_length=100, blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-rating_avg', '-reviews_count']
        indexes = [
            models.Index(fields=['rating_avg', 'reviews_count']),
            models.Index(fields=['city', 'is_active']),
            models.Index(fields=['hourly_rate']),
        ]

    def __str__(self):
        return f"Tutor: {self.user.display_name} ({self.headline or self.user.email})"


class ServiceListing(models.Model):
    """
    Individual service offering or tutoring package created by a provider.
    """
    CATEGORY_CHOICES = (
        ('mathematics', 'Mathematics & Statistics'),
        ('computer_science', 'Computer Science & Coding'),
        ('sciences', 'Physics, Chemistry & Biology'),
        ('languages', 'Languages & Literature'),
        ('music', 'Music & Instruments'),
        ('test_prep', 'SAT, ACT & Standardized Tests'),
        ('business', 'Business, Economics & Finance'),
        ('other', 'Other Specialized Skills'),
    )

    provider = models.ForeignKey(
        ProviderProfile,
        on_delete=models.CASCADE,
        related_name='services'
    )
    title = models.CharField(max_length=140)
    description = models.TextField()
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES, default='mathematics')
    price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('5.00'))]
    )
    duration_minutes = models.PositiveIntegerField(default=60, help_text="Duration in minutes (e.g. 60, 90)")
    is_paused = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['price']
        indexes = [
            models.Index(fields=['category', 'is_paused']),
        ]

    def __str__(self):
        return f"{self.title} - ${self.price} ({self.provider.user.display_name})"


class AvailabilitySlot(models.Model):
    """
    Weekly recurring availability slots for a provider (e.g., Mondays 09:00 - 17:00).
    day_of_week: 0 = Monday, 6 = Sunday.
    """
    DAY_CHOICES = (
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    )

    provider = models.ForeignKey(
        ProviderProfile,
        on_delete=models.CASCADE,
        related_name='availability_slots'
    )
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['day_of_week', 'start_time']
        unique_together = ('provider', 'day_of_week', 'start_time', 'end_time')

    def __str__(self):
        return f"{self.get_day_of_week_display()}: {self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}"


class AvailabilityBlock(models.Model):
    """
    One-off date blocks / vacation / busy overrides for a provider.
    """
    provider = models.ForeignKey(
        ProviderProfile,
        on_delete=models.CASCADE,
        related_name='availability_blocks'
    )
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True, help_text="Leave blank if all-day block")
    end_time = models.TimeField(null=True, blank=True, help_text="Leave blank if all-day block")
    all_day = models.BooleanField(default=True)
    reason = models.CharField(max_length=200, blank=True, default='')

    class Meta:
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"Block on {self.date} for {self.provider.user.display_name} ({self.reason or 'Unavailable'})"
