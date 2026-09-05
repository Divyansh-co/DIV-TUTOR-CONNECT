from django.urls import path
from .views import (
    CreatePaymentIntentView,
    ConfirmPaymentView,
    ProviderEarningsView,
    RequestPayoutView,
)

urlpatterns = [
    path('create-intent/', CreatePaymentIntentView.as_view(), name='create-payment-intent'),
    path('confirm/', ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('earnings/', ProviderEarningsView.as_view(), name='provider-earnings'),
    path('payout/', RequestPayoutView.as_view(), name='request-payout'),
]
