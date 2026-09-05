import time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from django.core.cache import cache

class HealthCheckView(APIView):
    """
    Health check endpoint returning system status:
    Database connection, Redis cache responsiveness, and server timestamp.
    """
    permission_classes = []
    authentication_classes = []

    def get(self, request):
        health_data = {
            'status': 'ok',
            'timestamp': int(time.time()),
            'services': {
                'database': 'unknown',
                'cache': 'unknown',
            }
        }
        status_code = status.HTTP_200_OK

        # Check DB
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                cursor.fetchone()
            health_data['services']['database'] = 'healthy'
        except Exception as e:
            health_data['services']['database'] = f'unhealthy: {str(e)}'
            health_data['status'] = 'degraded'
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE

        # Check Redis Cache
        try:
            test_key = f'healthcheck_{int(time.time())}'
            cache.set(test_key, 'ok', timeout=10)
            if cache.get(test_key) == 'ok':
                health_data['services']['cache'] = 'healthy'
            else:
                health_data['services']['cache'] = 'degraded'
        except Exception as e:
            health_data['services']['cache'] = f'unhealthy: {str(e)}'
            # In local dev without Redis running, we don't necessarily fail the app
            if health_data['status'] == 'ok':
                health_data['status'] = 'partial'

        return Response(health_data, status=status_code)
