import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.providers.models import ProviderProfile, ServiceListing, AvailabilitySlot

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def client_user(db):
    user = User.objects.create_user(
        email='testclient@example.com',
        password='TestPassword123!',
        first_name='Test',
        last_name='Client',
        is_client=True,
        email_verified=True
    )
    return user

@pytest.fixture
def provider_user(db):
    user = User.objects.create_user(
        email='testtutor@example.com',
        password='TestPassword123!',
        first_name='Test',
        last_name='Tutor',
        is_provider=True,
        email_verified=True
    )
    profile = ProviderProfile.objects.create(
        user=user,
        headline='Expert Math Tutor',
        bio='Experienced calculus and linear algebra tutor.',
        hourly_rate=Decimal('50.00'),
        city='San Francisco'
    )
    return user, profile

@pytest.fixture
def service_listing(db, provider_user):
    user, profile = provider_user
    service = ServiceListing.objects.create(
        provider=profile,
        title='Intro Calculus Session',
        price=Decimal('50.00'),
        duration_minutes=60,
        category='mathematics',
        description='Comprehensive 1-on-1 problem solving.'
    )
    return service
