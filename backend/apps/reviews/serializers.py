from rest_framework import serializers
from apps.users.serializers import UserProfileSerializer
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    client = UserProfileSerializer(read_only=True)
    service_title = serializers.CharField(source='booking.service.title', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'booking', 'client', 'provider', 'rating', 'comment',
            'service_title', 'created_at'
        ]
        read_only_fields = ['id', 'client', 'provider', 'created_at']

class CreateReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['booking', 'rating', 'comment']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate_booking(self, booking):
        user = self.context['request'].user
        if booking.client != user:
            raise serializers.ValidationError("You can only review sessions you personally booked.")
        if booking.status != 'COMPLETED':
            raise serializers.ValidationError("Reviews can only be submitted for completed sessions.")
        if hasattr(booking, 'review') and booking.review is not None:
            raise serializers.ValidationError("A review has already been submitted for this booking.")
        return booking

    def create(self, validated_data):
        booking = validated_data['booking']
        review = Review.objects.create(
            booking=booking,
            client=self.context['request'].user,
            provider=booking.provider,
            rating=validated_data['rating'],
            comment=validated_data['comment']
        )
        return review
