from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.utils import timezone
from apps.notifications.models import Notification
from apps.core.tasks import send_booking_confirmation_email
from .models import Booking
from .serializers import (
    BookingSerializer,
    CreateBookingSerializer,
    BookingStatusActionSerializer,
    RescheduleBookingSerializer,
)
from .services import generate_available_slots

class ProviderAvailableSlotsView(APIView):
    """
    Public endpoint returning dynamic, collision-checked available slots
    for a tutor over a given week or date range.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, provider_id):
        start_date = request.query_params.get('start_date')
        days = int(request.query_params.get('days', 7))
        duration = int(request.query_params.get('duration', 60))

        slots = generate_available_slots(
            provider_id=provider_id,
            start_date=start_date,
            days_count=min(days, 30),
            slot_duration_minutes=duration
        )
        return Response({"provider_id": provider_id, "slots_by_date": slots})

class CreateBookingView(APIView):
    """
    Client creates a new booking request for a tutor's service slot.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data

        service = validated['service']
        provider = validated['provider']
        start_time = validated['start_time']
        end_time = validated['end_time']
        notes = validated.get('notes', '')

        with transaction.atomic():
            booking = Booking.objects.create(
                client=request.user,
                provider=provider,
                service=service,
                start_time=start_time,
                end_time=end_time,
                total_price=service.price,
                notes=notes,
                status='PENDING'
            )

            # In-app notification to provider
            Notification.objects.create(
                recipient=provider.user,
                title='New Booking Request',
                message=f'{request.user.display_name} requested a booking for "{service.title}" on {start_time.strftime("%b %d, %Y at %I:%M %p")}.',
                notification_type='booking_request',
                action_url='/dashboard/provider'
            )

        return Response(
            BookingSerializer(booking, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

class ClientBookingsListView(generics.ListAPIView):
    """
    List bookings for the logged-in client, optimized with select_related.
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Booking.objects.filter(client=self.request.user).select_related(
            'client', 'provider__user', 'service'
        )
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter.upper())
        return qs

class ProviderBookingsListView(generics.ListAPIView):
    """
    List bookings inbox for the logged-in provider.
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Booking.objects.filter(provider__user=self.request.user).select_related(
            'client', 'provider__user', 'service'
        )
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter.upper())
        return qs

class BookingDetailView(generics.RetrieveAPIView):
    """
    Retrieve single booking detail, enforcing authorization.
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Booking.objects.filter(
            client=user
        ) | Booking.objects.filter(
            provider__user=user
        ).select_related('client', 'provider__user', 'service')

class BookingActionView(APIView):
    """
    Perform lifecycle actions on a booking (accept, decline, cancel, complete).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.select_related('client', 'provider__user', 'service').get(id=pk)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = BookingStatusActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data['action']
        reason = serializer.validated_data.get('reason', '')

        is_client = booking.client == request.user
        is_provider = booking.provider.user == request.user

        if not (is_client or is_provider):
            return Response({"error": "You do not have permission to act on this booking"}, status=status.HTTP_403_FORBIDDEN)

        if action == 'accept':
            if not is_provider:
                return Response({"error": "Only the tutor can accept this booking request"}, status=status.HTTP_403_FORBIDDEN)
            booking.status = 'CONFIRMED'
            booking.save(update_fields=['status', 'updated_at'])

            Notification.objects.create(
                recipient=booking.client,
                title='Booking Accepted!',
                message=f'{booking.provider.user.display_name} accepted your booking for "{booking.service.title}".',
                notification_type='booking_confirmed',
                action_url='/dashboard/client'
            )
            # Trigger confirmation email
            send_booking_confirmation_email.delay(booking.id)

        elif action == 'decline':
            if not is_provider:
                return Response({"error": "Only the tutor can decline this request"}, status=status.HTTP_403_FORBIDDEN)
            booking.status = 'DECLINED'
            booking.cancellation_reason = reason
            booking.save(update_fields=['status', 'cancellation_reason', 'updated_at'])

            Notification.objects.create(
                recipient=booking.client,
                title='Booking Declined',
                message=f'{booking.provider.user.display_name} was unable to accept your booking request.',
                notification_type='general',
                action_url='/dashboard/client'
            )

        elif action == 'cancel':
            booking.status = 'CANCELLED'
            booking.cancellation_reason = reason
            booking.save(update_fields=['status', 'cancellation_reason', 'updated_at'])

            recipient = booking.provider.user if is_client else booking.client
            cancelled_by = "client" if is_client else "tutor"
            Notification.objects.create(
                recipient=recipient,
                title=f'Booking Cancelled by {cancelled_by}',
                message=f'The booking for "{booking.service.title}" on {booking.start_time.strftime("%b %d")} was cancelled. {reason}',
                notification_type='general',
                action_url='/dashboard'
            )

        elif action == 'complete':
            booking.status = 'COMPLETED'
            booking.save(update_fields=['status', 'updated_at'])

            # Prompt client for review
            Notification.objects.create(
                recipient=booking.client,
                title='Session Completed! Leave a Review',
                message=f'How was your session with {booking.provider.user.display_name}? Rate your experience.',
                notification_type='review_request',
                action_url='/dashboard/client'
            )

        return Response(BookingSerializer(booking, context={'request': request}).data)

class RescheduleBookingView(APIView):
    """
    Reschedule an existing booking to a new start time.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.select_related('client', 'provider__user', 'service').get(id=pk)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

        if not (booking.client == request.user or booking.provider.user == request.user):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        serializer = RescheduleBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_start = serializer.validated_data['new_start_time']
        duration = booking.service.duration_minutes
        new_end = new_start + timezone.timedelta(minutes=duration)

        # Check collision
        collision = Booking.objects.filter(
            provider=booking.provider,
            status__in=['PENDING', 'CONFIRMED'],
            start_time__lt=new_end,
            end_time__gt=new_start
        ).exclude(id=booking.id).exists()

        if collision:
            return Response({"error": "The new time slot has an existing booking conflict."}, status=status.HTTP_400_BAD_REQUEST)

        booking.start_time = new_start
        booking.end_time = new_end
        booking.status = 'CONFIRMED'
        booking.save(update_fields=['start_time', 'end_time', 'status', 'updated_at'])

        # Notify other party
        other_party = booking.provider.user if request.user == booking.client else booking.client
        Notification.objects.create(
            recipient=other_party,
            title='Session Rescheduled',
            message=f'Session for "{booking.service.title}" has been moved to {new_start.strftime("%b %d, %Y at %I:%M %p")}.',
            notification_type='general',
            action_url='/dashboard'
        )

        return Response(BookingSerializer(booking, context={'request': request}).data)
