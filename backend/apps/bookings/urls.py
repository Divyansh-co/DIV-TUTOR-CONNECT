from django.urls import path
from .views import (
    CreateBookingView,
    ClientBookingsListView,
    ProviderBookingsListView,
    BookingDetailView,
    BookingActionView,
    RescheduleBookingView,
    ProviderAvailableSlotsView,
)

urlpatterns = [
    path('', CreateBookingView.as_view(), name='booking-create'),
    path('client/', ClientBookingsListView.as_view(), name='client-bookings'),
    path('provider/', ProviderBookingsListView.as_view(), name='provider-bookings'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('<int:pk>/action/', BookingActionView.as_view(), name='booking-action'),
    path('<int:pk>/reschedule/', RescheduleBookingView.as_view(), name='booking-reschedule'),
    path('available-slots/<int:provider_id>/', ProviderAvailableSlotsView.as_view(), name='provider-available-slots'),
]
