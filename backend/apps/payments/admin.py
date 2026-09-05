from django.contrib import admin
from .models import PaymentTransaction, PayoutRecord

@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'amount', 'fee_amount', 'net_amount', 'status', 'created_at')
    list_filter = ('status', 'currency', 'created_at')
    search_fields = ('booking__id', 'stripe_payment_intent_id')

@admin.register(PayoutRecord)
class PayoutRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'provider', 'amount', 'status', 'payout_method', 'reference_code', 'created_at')
    list_filter = ('status', 'payout_method')
    search_fields = ('provider__user__email', 'reference_code')
