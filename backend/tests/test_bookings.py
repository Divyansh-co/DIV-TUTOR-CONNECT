import pytest
from datetime import timedelta
from django.utils import timezone
from rest_framework import status
from apps.bookings.models import Booking

@pytest.mark.django_db
class TestBookings:
    def test_create_booking_success(self, api_client, client_user, service_listing):
        api_client.force_authenticate(user=client_user)
        future_time = timezone.now() + timedelta(days=2)
        payload = {
            "service_id": service_listing.id,
            "start_time": future_time.isoformat(),
            "notes": "Looking forward to learning!"
        }
        response = api_client.post('/api/v1/bookings/', payload)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['status'] == 'PENDING'
        assert float(response.data['total_price']) == 50.00

    def test_provider_accept_booking(self, api_client, client_user, provider_user, service_listing):
        tutor_user, tutor_profile = provider_user
        future_time = timezone.now() + timedelta(days=2)
        booking = Booking.objects.create(
            client=client_user,
            provider=tutor_profile,
            service=service_listing,
            start_time=future_time,
            end_time=future_time + timedelta(hours=1),
            total_price=service_listing.price,
            status='PENDING'
        )

        api_client.force_authenticate(user=tutor_user)
        response = api_client.post(f'/api/v1/bookings/{booking.id}/action/', {'action': 'accept'})
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'CONFIRMED'

        booking.refresh_from_db()
        assert booking.status == 'CONFIRMED'
