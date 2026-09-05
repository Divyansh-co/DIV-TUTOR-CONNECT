from django.urls import path
from .views import CreateReviewView, ProviderReviewsListView

urlpatterns = [
    path('', CreateReviewView.as_view(), name='review-create'),
    path('provider/<int:provider_id>/', ProviderReviewsListView.as_view(), name='provider-reviews'),
]
