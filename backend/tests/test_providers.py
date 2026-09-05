import pytest
from rest_framework import status

@pytest.mark.django_db
class TestProvidersAndSearch:
    def test_provider_list_endpoint(self, api_client, provider_user, service_listing):
        response = api_client.get('/api/v1/providers/')
        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        assert len(results) >= 1
        assert results[0]['name'] == 'Test Tutor'
        assert results[0]['hourly_rate'] == '50.00'

    def test_provider_detail_endpoint(self, api_client, provider_user, service_listing):
        _, profile = provider_user
        response = api_client.get(f'/api/v1/providers/{profile.id}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['headline'] == 'Expert Math Tutor'
        assert len(response.data['services']) == 1
        assert response.data['services'][0]['title'] == 'Intro Calculus Session'

    def test_marketplace_search_with_filter(self, api_client, provider_user, service_listing):
        response = api_client.get('/api/v1/search/?category=mathematics')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] >= 1
