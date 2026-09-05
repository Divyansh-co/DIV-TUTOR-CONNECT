import hashlib
import json
from django.core.cache import cache
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from apps.providers.models import ProviderProfile
from apps.providers.serializers import ProviderProfileListSerializer

class MarketplaceSearchView(APIView):
    """
    Search & faceted filtering endpoint for tutors and services.
    Rate-limited and backed by Redis caching with automatic cache-key hashing.
    N+1 queries eliminated via select_related and prefetch_related.
    """
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'search'

    def get(self, request):
        params = request.query_params.dict()
        # Create deterministic MD5 cache key
        serialized_params = json.dumps(params, sort_keys=True)
        cache_key = f"tutor_search_{hashlib.md5(serialized_params.encode('utf-8')).hexdigest()}"

        cached_response = cache.get(cache_key)
        if cached_response is not None:
            response = Response(cached_response)
            response['X-Cache'] = 'HIT'
            return response

        # Query optimization: pre-join User and pre-fetch Services
        qs = ProviderProfile.objects.filter(is_active=True).select_related('user').prefetch_related('services')

        q = params.get('q', '').strip()
        if q:
            qs = qs.filter(
                Q(user__first_name__icontains=q) |
                Q(user__last_name__icontains=q) |
                Q(headline__icontains=q) |
                Q(bio__icontains=q) |
                Q(services__title__icontains=q) |
                Q(services__description__icontains=q) |
                Q(skills__icontains=q)
            ).distinct()

        category = params.get('category')
        if category:
            qs = qs.filter(services__category=category, services__is_paused=False).distinct()

        min_rating = params.get('min_rating')
        if min_rating:
            try:
                qs = qs.filter(rating_avg__gte=float(min_rating))
            except ValueError:
                pass

        min_price = params.get('min_price')
        if min_price:
            try:
                qs = qs.filter(hourly_rate__gte=float(min_price))
            except ValueError:
                pass

        max_price = params.get('max_price')
        if max_price:
            try:
                qs = qs.filter(hourly_rate__lte=float(max_price))
            except ValueError:
                pass

        city = params.get('city')
        if city:
            qs = qs.filter(city__icontains=city)

        online_only = params.get('online')
        if online_only and online_only.lower() in ['true', '1']:
            qs = qs.filter(offers_online=True)

        in_person = params.get('in_person')
        if in_person and in_person.lower() in ['true', '1']:
            qs = qs.filter(offers_in_person=True)

        sort = params.get('sort', 'rating')
        if sort == 'price_asc':
            qs = qs.order_by('hourly_rate')
        elif sort == 'price_desc':
            qs = qs.order_by('-hourly_rate')
        elif sort == 'reviews':
            qs = qs.order_by('-reviews_count')
        else:
            qs = qs.order_by('-rating_avg', '-reviews_count')

        serializer = ProviderProfileListSerializer(qs[:50], many=True, context={'request': request})
        result_data = {
            'count': qs.count(),
            'query': q,
            'filters': params,
            'results': serializer.data
        }

        # Cache for 300 seconds (5 minutes)
        cache.set(cache_key, result_data, timeout=300)

        response = Response(result_data)
        response['X-Cache'] = 'MISS'
        return response
