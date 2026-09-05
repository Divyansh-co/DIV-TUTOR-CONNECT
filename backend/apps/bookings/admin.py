from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'provider', 'service', 'start_time', 'total_price', 'status', 'is_paid')
    list_filter = ('status', 'is_paid', 'start_time')
    search_fields = ('client__email', 'provider__user__email', 'service__title', 'stripe_payment_intent_id')
    date_hierarchy = 'start_time'
