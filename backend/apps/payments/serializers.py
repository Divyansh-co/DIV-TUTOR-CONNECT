from rest_framework import serializers
from .models import PaymentTransaction, PayoutRecord

class PaymentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = [
            'id', 'booking', 'amount', 'fee_amount', 'net_amount',
            'currency', 'stripe_payment_intent_id', 'status', 'created_at'
        ]

class PayoutRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayoutRecord
        fields = ['id', 'amount', 'status', 'payout_method', 'reference_code', 'created_at']

class CreatePaymentIntentSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()

class ConfirmPaymentSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    payment_intent_id = serializers.CharField(required=False, default='')
