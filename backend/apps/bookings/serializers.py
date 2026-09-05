from rest_framework import serializers
from django.utils import timezone
from apps.users.serializers import UserProfileSerializer
from apps.providers.serializers import ProviderProfileListSerializer, ServiceListingSerializer
from apps.providers.models import ServiceListing
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    client = UserProfileSerializer(read_only=True)
    provider = ProviderProfileListSerializer(read_only=True)
    service = ServiceListingSerializer(read_only=True)
    has_review = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'client', 'provider', 'service', 'start_time', 'end_time',
            'total_price', 'currency', 'status', 'notes', 'cancellation_reason',
            'meeting_link', 'stripe_payment_intent_id', 'is_paid', 'has_review',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'client', 'provider', 'service', 'total_price', 'currency', 'created_at']

    def get_has_review(self, obj):
        return hasattr(obj, 'review') and obj.review is not None

class CreateBookingSerializer(serializers.Serializer):
    service_id = serializers.IntegerField()
    start_time = serializers.DateTimeField()
    notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_start_time(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Booking start time must be in the future.")
        return value

    def validate(self, attrs):
        service_id = attrs.get('service_id')
        start_time = attrs.get('start_time')

        try:
            service = ServiceListing.objects.select_related('provider').get(id=service_id, is_paused=False)
        except ServiceListing.DoesNotExist:
            raise serializers.ValidationError({"service_id": "Selected service is invalid or unavailable."})

        attrs['service'] = service
        attrs['provider'] = service.provider

        # Calculate end_time based on duration
        duration_minutes = service.duration_minutes
        end_time = start_time + timezone.timedelta(minutes=duration_minutes)
        attrs['end_time'] = end_time

        # Check for conflicts
        conflicts = Booking.objects.filter(
            provider=service.provider,
            status__in=['PENDING', 'CONFIRMED'],
            start_time__lt=end_time,
            end_time__gt=start_time
        ).exists()

        if conflicts:
            raise serializers.ValidationError("This tutor already has a confirmed booking for the chosen time.")

        return attrs

class BookingStatusActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['accept', 'decline', 'cancel', 'complete'])
    reason = serializers.CharField(required=False, allow_blank=True, default='')

class RescheduleBookingSerializer(serializers.Serializer):
    new_start_time = serializers.DateTimeField()

    def validate_new_start_time(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Rescheduled time must be in the future.")
        return value
