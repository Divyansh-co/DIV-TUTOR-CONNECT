import pytest
from rest_framework import status

@pytest.mark.django_db
class TestAuthentication:
    def test_user_registration_success(self, api_client):
        payload = {
            "email": "newuser@example.com",
            "password": "StrongPassword123!",
            "password_confirm": "StrongPassword123!",
            "first_name": "Jane",
            "last_name": "Doe",
            "is_client": True,
            "is_provider": False
        }
        response = api_client.post('/api/v1/auth/register/', payload)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['user']['email'] == "newuser@example.com"
        assert response.data['user']['is_client'] is True

    def test_user_registration_password_mismatch(self, api_client):
        payload = {
            "email": "mismatch@example.com",
            "password": "StrongPassword123!",
            "password_confirm": "DifferentPassword123!",
            "first_name": "Jane",
            "last_name": "Doe"
        }
        response = api_client.post('/api/v1/auth/register/', payload)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_jwt_login_success(self, api_client, client_user):
        payload = {
            "email": "testclient@example.com",
            "password": "TestPassword123!"
        }
        response = api_client.post('/api/v1/auth/login/', payload)
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data
        assert response.data['user']['email'] == "testclient@example.com"

    def test_jwt_login_invalid_password(self, api_client, client_user):
        payload = {
            "email": "testclient@example.com",
            "password": "WrongPassword!"
        }
        response = api_client.post('/api/v1/auth/login/', payload)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
