from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProviderListView,
    ProviderDetailView,
    ProviderMeView,
    ServiceListingViewSet,
    AvailabilitySlotViewSet,
    AvailabilityBlockViewSet,
)

router = DefaultRouter()
router.register(r'my-services', ServiceListingViewSet, basename='my-services')
router.register(r'my-slots', AvailabilitySlotViewSet, basename='my-slots')
router.register(r'my-blocks', AvailabilityBlockViewSet, basename='my-blocks')

urlpatterns = [
    path('', ProviderListView.as_view(), name='provider-list'),
    path('me/', ProviderMeView.as_view(), name='provider-me'),
    path('<int:pk>/', ProviderDetailView.as_view(), name='provider-detail'),
    path('', include(router.urls)),
]
