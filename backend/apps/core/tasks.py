import logging
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from celery import shared_task

logger = logging.getLogger(__name__)

@shared_task
def send_booking_confirmation_email(booking_id):
    """Send confirmation email to both client and tutor after successful booking."""
    from apps.bookings.models import Booking
    from apps.notifications.models import Notification

    try:
        booking = Booking.objects.select_related('client', 'provider__user', 'service').get(id=booking_id)
        client = booking.client
        tutor = booking.provider.user
        service = booking.service

        # In-app notifications
        Notification.objects.create(
            recipient=client,
            title='Booking Confirmed!',
            message=f'Your session for "{service.title}" on {booking.start_time.strftime("%b %d, %Y at %I:%M %p")} is confirmed.',
            notification_type='booking_confirmed',
            action_url=f'/dashboard/client'
        )

        Notification.objects.create(
            recipient=tutor,
            title='New Booking Received!',
            message=f'{client.get_full_name() or client.email} booked "{service.title}" on {booking.start_time.strftime("%b %d, %Y at %I:%M %p")}.',
            notification_type='booking_request',
            action_url=f'/dashboard/provider'
        )

        # Send email to client
        send_mail(
            subject=f'Booking Confirmation: {service.title} with {tutor.get_full_name() or tutor.email}',
            message=(
                f"Hello {client.first_name or client.email},\n\n"
                f"Your booking has been confirmed!\n\n"
                f"Service: {service.title}\n"
                f"Tutor: {tutor.get_full_name() or tutor.email}\n"
                f"Date & Time: {booking.start_time.strftime('%A, %B %d, %Y from %I:%M %p')} to {booking.end_time.strftime('%I:%M %p')}\n"
                f"Amount Paid: ${booking.total_price}\n\n"
                f"View your session details: {settings.FRONTEND_URL}/dashboard/client\n\n"
                f"— Team TutorConnect\nBuilt by Divyansh Mishra"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[client.email],
            fail_silently=True,
        )

        # Send email to provider
        send_mail(
            subject=f'New Session Booked: {service.title} by {client.get_full_name() or client.email}',
            message=(
                f"Hello {tutor.first_name or tutor.email},\n\n"
                f"You have a new confirmed booking!\n\n"
                f"Client: {client.get_full_name() or client.email}\n"
                f"Service: {service.title}\n"
                f"Time: {booking.start_time.strftime('%A, %B %d, %Y at %I:%M %p')}\n"
                f"Earnings: ${booking.total_price}\n\n"
                f"Manage your schedule: {settings.FRONTEND_URL}/dashboard/provider\n\n"
                f"— Team TutorConnect\nBuilt by Divyansh Mishra"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[tutor.email],
            fail_silently=True,
        )

        logger.info(f"Sent booking confirmation emails and notifications for booking {booking_id}")
        return True
    except Booking.DoesNotExist:
        logger.error(f"Booking {booking_id} not found for email dispatch")
        return False
    except Exception as e:
        logger.exception(f"Error sending booking confirmation for {booking_id}: {e}")
        return False

@shared_task
def send_upcoming_booking_reminders():
    """Periodic task checking for bookings occurring within the next 24 hours."""
    from apps.bookings.models import Booking
    from apps.notifications.models import Notification

    now = timezone.now()
    window_start = now + timedelta(hours=23)
    window_end = now + timedelta(hours=25)

    upcoming_bookings = Booking.objects.filter(
        status='CONFIRMED',
        start_time__gte=window_start,
        start_time__lte=window_end,
    ).select_related('client', 'provider__user', 'service')

    count = 0
    for booking in upcoming_bookings:
        client = booking.client
        Notification.objects.get_or_create(
            recipient=client,
            title='Reminder: Upcoming Session in ~24h',
            message=f'Your session for "{booking.service.title}" begins tomorrow at {booking.start_time.strftime("%I:%M %p")}.',
            notification_type='booking_reminder',
            action_url='/dashboard/client'
        )
        count += 1

    logger.info(f"Processed 24h reminders for {count} bookings")
    return count

@shared_task
def send_review_nudges():
    """Periodic task prompting clients to review completed sessions."""
    from apps.bookings.models import Booking
    from apps.notifications.models import Notification

    now = timezone.now()
    two_hours_ago = now - timedelta(hours=2)
    twenty_six_hours_ago = now - timedelta(hours=26)

    # Bookings that ended recently without a review
    completed_bookings = Booking.objects.filter(
        status='COMPLETED',
        end_time__gte=twenty_six_hours_ago,
        end_time__lte=two_hours_ago,
        review__isnull=True
    ).select_related('client', 'provider__user', 'service')

    count = 0
    for booking in completed_bookings:
        client = booking.client
        tutor_name = booking.provider.user.get_full_name() or "your tutor"
        Notification.objects.get_or_create(
            recipient=client,
            title=f'How was your session with {tutor_name}?',
            message=f'Leave a review for "{booking.service.title}" to help the community.',
            notification_type='review_request',
            action_url=f'/dashboard/client'
        )
        count += 1

    logger.info(f"Processed review nudges for {count} sessions")
    return count

@shared_task
def send_weekly_digest():
    """Send weekly summary email to providers with upcoming sessions & earnings."""
    from apps.providers.models import ProviderProfile
    from apps.bookings.models import Booking

    now = timezone.now()
    week_ahead = now + timedelta(days=7)
    providers = ProviderProfile.objects.filter(is_active=True).select_related('user')

    sent_count = 0
    for provider in providers:
        upcoming_count = Booking.objects.filter(
            provider=provider,
            status='CONFIRMED',
            start_time__gte=now,
            start_time__lte=week_ahead
        ).count()

        send_mail(
            subject='Your Weekly TutorConnect Digest',
            message=(
                f"Hello {provider.user.first_name or provider.user.email},\n\n"
                f"Here is your weekly summary:\n"
                f"- Upcoming sessions this week: {upcoming_count}\n"
                f"- Current Average Rating: {provider.rating_avg:.1f} ★ ({provider.reviews_count} reviews)\n\n"
                f"Keep your calendar up-to-date to maximize bookings: {settings.FRONTEND_URL}/dashboard/provider\n\n"
                f"— Team TutorConnect\nBuilt by Divyansh Mishra"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[provider.user.email],
            fail_silently=True
        )
        sent_count += 1

    logger.info(f"Sent weekly digests to {sent_count} providers")
    return sent_count
