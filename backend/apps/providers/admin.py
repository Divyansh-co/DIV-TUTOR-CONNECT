from django.contrib import admin
from .models import ProviderProfile, ServiceListing, AvailabilitySlot, AvailabilityBlock

class ServiceListingInline(admin.TabularInline):
    model = ServiceListing
    extra = 1

class AvailabilitySlotInline(admin.TabularInline):
    model = AvailabilitySlot
    extra = 1

class AvailabilityBlockInline(admin.TabularInline):
    model = AvailabilityBlock
    extra = 0

@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'headline', 'hourly_rate', 'rating_avg', 'reviews_count', 'city', 'is_active', 'is_featured')
    list_filter = ('is_active', 'is_featured', 'city', 'offers_online', 'offers_in_person')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'headline', 'bio', 'city')
    inlines = [ServiceListingInline, AvailabilitySlotInline, AvailabilityBlockInline]

@admin.register(ServiceListing)
class ServiceListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'provider', 'category', 'price', 'duration_minutes', 'is_paused')
    list_filter = ('category', 'is_paused')
    search_fields = ('title', 'description', 'provider__user__email')

@admin.register(AvailabilitySlot)
class AvailabilitySlotAdmin(admin.ModelAdmin):
    list_display = ('provider', 'day_of_week', 'start_time', 'end_time', 'is_active')
    list_filter = ('day_of_week', 'is_active')

@admin.register(AvailabilityBlock)
class AvailabilityBlockAdmin(admin.ModelAdmin):
    list_display = ('provider', 'date', 'start_time', 'end_time', 'all_day', 'reason')
    list_filter = ('date', 'all_day')
