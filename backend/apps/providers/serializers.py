from rest_framework import serializers
from apps.users.serializers import UserProfileSerializer
from .models import ProviderProfile, ServiceListing, AvailabilitySlot, AvailabilityBlock

class AvailabilitySlotSerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = AvailabilitySlot
        fields = ['id', 'day_of_week', 'day_name', 'start_time', 'end_time', 'is_active']

class AvailabilityBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilityBlock
        fields = ['id', 'date', 'start_time', 'end_time', 'all_day', 'reason']

class ServiceListingSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = ServiceListing
        fields = [
            'id', 'provider', 'title', 'description', 'category',
            'category_display', 'price', 'duration_minutes', 'is_paused', 'created_at'
        ]
        read_only_fields = ['id', 'provider', 'created_at']

class ProviderProfileListSerializer(serializers.ModelSerializer):
    """Optimized serializer for directory listing and search results."""
    name = serializers.CharField(source='user.display_name', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    avatar_url = serializers.SerializerMethodField()
    services_count = serializers.IntegerField(source='services.count', read_only=True)
    min_price = serializers.SerializerMethodField()

    class Meta:
        model = ProviderProfile
        fields = [
            'id', 'user_id', 'name', 'first_name', 'avatar_url', 'headline', 'bio',
            'hourly_rate', 'rating_avg', 'reviews_count', 'city', 'state', 'country',
            'travel_radius_km', 'offers_online', 'offers_in_person',
            'skills', 'languages', 'services_count', 'min_price', 'is_featured'
        ]

    def get_avatar_url(self, obj):
        if obj.user.avatar:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.user.avatar.url) if request else obj.user.avatar.url
        return obj.user.avatar_url or f"https://api.dicebear.com/7.x/initials/svg?seed={obj.user.display_name}"

    def get_min_price(self, obj):
        services = obj.services.filter(is_paused=False)
        if services.exists():
            return min(s.price for s in services)
        return obj.hourly_rate

class ProviderProfileDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer with nested services, availability slots, and reviews."""
    user = UserProfileSerializer(read_only=True)
    services = ServiceListingSerializer(many=True, read_only=True)
    availability_slots = AvailabilitySlotSerializer(many=True, read_only=True)
    availability_blocks = AvailabilityBlockSerializer(many=True, read_only=True)

    class Meta:
        model = ProviderProfile
        fields = [
            'id', 'user', 'headline', 'bio', 'hourly_rate', 'rating_avg',
            'reviews_count', 'city', 'state', 'country', 'latitude', 'longitude',
            'travel_radius_km', 'offers_online', 'offers_in_person',
            'skills', 'languages', 'portfolio_images', 'is_active', 'is_featured',
            'services', 'availability_slots', 'availability_blocks', 'created_at'
        ]

class ProviderProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderProfile
        fields = [
            'headline', 'bio', 'hourly_rate', 'city', 'state', 'country',
            'travel_radius_km', 'offers_online', 'offers_in_person',
            'skills', 'languages', 'portfolio_images', 'is_active'
        ]
