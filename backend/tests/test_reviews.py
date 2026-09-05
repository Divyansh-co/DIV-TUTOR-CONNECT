import pytest
from datetime import timedelta
from django.utils import timezone
from rest_framework import status
from apps.bookings.models import Booking
from apps.reviews.models import Review

@pytest.mark.django_db
class TestReviews:
    def test_review_creation_updates_tutor_rollup(self, api_client, client_user, provider_user, service_listing):
        _, tutor_profile = provider_user
        past_time = timezone.now() - timedelta(days=2)
        booking = Booking.objects.create(
            client=client_user,
            provider=tutor_profile,
            service=service_listing,
            start_time=past_time,
            end_time=past_time + timedelta(hours=1),
            total_price=service_listing.price,
            status='COMPLETED'
        )

        api_client.force_authenticate(user=client_user)
        payload = {
            "booking": booking.id,
            "rating": 5,
            "comment": "Incredible tutor, everything made sense!"
        }
        response = api_client.post('/api/v1/reviews/', payload)
        assert response.status_code == status.HTTP_201_CREATED

        tutor_profile.refresh_from_db()
        assert tutor_profile.reviews_count == 1
        assert float(tutor_profile.rating_avg) == 5.0
