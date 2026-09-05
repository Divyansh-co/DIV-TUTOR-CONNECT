from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import ProviderProfile, ServiceListing, AvailabilitySlot, AvailabilityBlock
from .serializers import (
    ProviderProfileListSerializer,
    ProviderProfileDetailSerializer,
    ProviderProfileUpdateSerializer,
    ServiceListingSerializer,
    AvailabilitySlotSerializer,
    AvailabilityBlockSerializer,
)
from .permissions import IsProvider, IsProviderOwnerOrReadOnly

class ProviderListView(generics.ListAPIView):
    """
    Public marketplace endpoint to browse tutors.
    Pre-optimizes database queries to prevent N+1 query bottlenecks.
    Supports filtering by category, search text, max price, and min rating.
    """
    serializer_class = ProviderProfileListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Prevent N+1 queries by selecting related User and prefetching Services
        queryset = ProviderProfile.objects.filter(is_active=True).select_related('user').prefetch_related('services')

        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(services__category=category, services__is_paused=False).distinct()

        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            try:
                queryset = queryset.filter(rating_avg__gte=float(min_rating))
            except ValueError:
                pass

        max_price = self.request.query_params.get('max_price')
        if max_price:
            try:
                queryset = queryset.filter(hourly_rate__lte=float(max_price))
            except ValueError:
                pass

        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__icontains=city)

        online_only = self.request.query_params.get('online')
        if online_only and online_only.lower() in ['true', '1']:
            queryset = queryset.filter(offers_online=True)

        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(
                Q(user__first_name__icontains=q) |
                Q(user__last_name__icontains=q) |
                Q(headline__icontains=q) |
                Q(bio__icontains=q) |
                Q(services__title__icontains=q) |
                Q(skills__icontains=q)
            ).distinct()

        sort_by = self.request.query_params.get('sort', 'rating')
        if sort_by == 'price_asc':
            queryset = queryset.order_by('hourly_rate')
        elif sort_by == 'price_desc':
            queryset = queryset.order_by('-hourly_rate')
        elif sort_by == 'reviews':
            queryset = queryset.order_by('-reviews_count')
        else:
            queryset = queryset.order_by('-rating_avg', '-reviews_count')

        return queryset

class ProviderDetailView(generics.RetrieveAPIView):
    """
    Detailed public profile for a single tutor.
    Prefetches all services, availability slots, and blocks in a single query batch.
    """
    queryset = ProviderProfile.objects.select_related('user').prefetch_related(
        'services', 'availability_slots', 'availability_blocks'
    )
    serializer_class = ProviderProfileDetailSerializer
    permission_classes = [permissions.AllowAny]

class ProviderMeView(APIView):
    """
    Provider self-management endpoint for viewing and updating their own profile.
    """
    permission_classes = [permissions.IsAuthenticated, IsProvider]

    def get(self, request):
        profile, _ = ProviderProfile.objects.get_or_create(user=request.user)
        serializer = ProviderProfileDetailSerializer(profile, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        profile, _ = ProviderProfile.objects.get_or_create(user=request.user)
        serializer = ProviderProfileUpdateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ProviderProfileDetailSerializer(profile, context={'request': request}).data)

class ServiceListingViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoint for services/packages offered by the logged-in provider.
    """
    serializer_class = ServiceListingSerializer
    permission_classes = [permissions.IsAuthenticated, IsProvider, IsProviderOwnerOrReadOnly]

    def get_queryset(self):
        return ServiceListing.objects.filter(provider__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = ProviderProfile.objects.get_or_create(user=self.request.user)
        serializer.save(provider=profile)

class AvailabilitySlotViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoint for weekly recurring availability slots.
    """
    serializer_class = AvailabilitySlotSerializer
    permission_classes = [permissions.IsAuthenticated, IsProvider, IsProviderOwnerOrReadOnly]

    def get_queryset(self):
        return AvailabilitySlot.objects.filter(provider__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = ProviderProfile.objects.get_or_create(user=self.request.user)
        serializer.save(provider=profile)

class AvailabilityBlockViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoint for specific calendar blocks/vacation dates.
    """
    serializer_class = AvailabilityBlockSerializer
    permission_classes = [permissions.IsAuthenticated, IsProvider, IsProviderOwnerOrReadOnly]

    def get_queryset(self):
        return AvailabilityBlock.objects.filter(provider__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = ProviderProfile.objects.get_or_create(user=self.request.user)
        serializer.save(provider=profile)
