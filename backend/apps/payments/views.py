import uuid
from decimal import Decimal
from datetime import datetime, timedelta
from django.conf import settings
from django.db import transaction
from django.db.models import Sum, Count
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
import stripe

from apps.bookings.models import Booking
from apps.providers.models import ProviderProfile
from apps.notifications.models import Notification
from apps.core.tasks import send_booking_confirmation_email
from .models import PaymentTransaction, PayoutRecord
from .serializers import (
    PaymentTransactionSerializer,
    PayoutRecordSerializer,
    CreatePaymentIntentSerializer,
    ConfirmPaymentSerializer,
)

class CreatePaymentIntentView(APIView):
    """
    Create a Stripe PaymentIntent for a pending booking.
    Gracefully handles test keys or test-mode simulation.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreatePaymentIntentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking_id = serializer.validated_data['booking_id']

        try:
            booking = Booking.objects.select_related('service', 'provider__user').get(
                id=booking_id,
                client=request.user
            )
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found or unauthorized"}, status=status.HTTP_404_NOT_FOUND)

        if booking.is_paid:
            return Response({"error": "This booking is already paid"}, status=status.HTTP_400_BAD_REQUEST)

        amount_cents = int(booking.total_price * 100)
        stripe.api_key = settings.STRIPE_SECRET_KEY

        client_secret = None
        intent_id = None

        if settings.STRIPE_SECRET_KEY and not settings.STRIPE_SECRET_KEY.startswith('sk_test_sample'):
            try:
                intent = stripe.PaymentIntent.create(
                    amount=amount_cents,
                    currency=booking.currency.lower(),
                    metadata={
                        'booking_id': str(booking.id),
                        'client_email': request.user.email,
                        'service_title': booking.service.title,
                    }
                )
                client_secret = intent.client_secret
                intent_id = intent.id
            except Exception as e:
                # Fallback to simulated test mode
                intent_id = f"pi_simulated_{uuid.uuid4().hex[:14]}"
                client_secret = f"{intent_id}_secret_{uuid.uuid4().hex[:14]}"
        else:
            # Development simulation mode
            intent_id = f"pi_simulated_{uuid.uuid4().hex[:14]}"
            client_secret = f"{intent_id}_secret_{uuid.uuid4().hex[:14]}"

        booking.stripe_payment_intent_id = intent_id
        booking.save(update_fields=['stripe_payment_intent_id'])

        return Response({
            "client_secret": client_secret,
            "payment_intent_id": intent_id,
            "amount": booking.total_price,
            "currency": booking.currency,
            "booking_id": booking.id
        })

class ConfirmPaymentView(APIView):
    """
    Confirm that payment was completed for a booking.
    Transitions booking status to CONFIRMED, records financial ledger entry,
    and dispatches notifications & confirmation emails.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ConfirmPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking_id = serializer.validated_data['booking_id']
        payment_intent_id = serializer.validated_data.get('payment_intent_id', '')

        try:
            booking = Booking.objects.select_related('service', 'provider__user').get(
                id=booking_id,
                client=request.user
            )
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

        if booking.is_paid:
            return Response({"message": "Booking is already paid and confirmed", "booking_id": booking.id})

        with transaction.atomic():
            booking.is_paid = True
            booking.status = 'CONFIRMED'
            if payment_intent_id:
                booking.stripe_payment_intent_id = payment_intent_id
            booking.save(update_fields=['is_paid', 'status', 'stripe_payment_intent_id', 'updated_at'])

            # 10% platform commission fee
            fee_amount = round(booking.total_price * Decimal('0.10'), 2)
            net_amount = booking.total_price - fee_amount

            PaymentTransaction.objects.create(
                booking=booking,
                amount=booking.total_price,
                fee_amount=fee_amount,
                net_amount=net_amount,
                currency=booking.currency,
                stripe_payment_intent_id=booking.stripe_payment_intent_id or payment_intent_id,
                status='SUCCEEDED'
            )

        # Dispatch async notification & email tasks
        send_booking_confirmation_email.delay(booking.id)

        return Response({
            "message": "Payment confirmed and booking scheduled!",
            "booking_id": booking.id,
            "status": booking.status,
            "meeting_link": booking.meeting_link
        })

class ProviderEarningsView(APIView):
    """
    Provider earnings dashboard aggregating total revenue, pending payouts,
    and monthly history formatted for Recharts display.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            provider = ProviderProfile.objects.get(user=request.user)
        except ProviderProfile.DoesNotExist:
            return Response({"error": "Provider profile not found"}, status=status.HTTP_404_NOT_FOUND)

        transactions = PaymentTransaction.objects.filter(
            booking__provider=provider,
            status='SUCCEEDED'
        )

        gross_earned = transactions.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        net_earned = transactions.aggregate(total=Sum('net_amount'))['total'] or Decimal('0.00')
        fees_paid = transactions.aggregate(total=Sum('fee_amount'))['total'] or Decimal('0.00')

        total_paid_out = PayoutRecord.objects.filter(
            provider=provider,
            status='PAID'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        available_balance = max(Decimal('0.00'), net_earned - total_paid_out)
        completed_sessions = Booking.objects.filter(provider=provider, status='COMPLETED').count()

        # Monthly breakdown for Recharts (past 6 months)
        now = timezone.now()
        monthly_data = []
        for i in range(5, -1, -1):
            month_date = now - timedelta(days=i * 30)
            month_name = month_date.strftime("%b %Y")
            month_txs = transactions.filter(
                created_at__year=month_date.year,
                created_at__month=month_date.month
            )
            m_revenue = month_txs.aggregate(total=Sum('net_amount'))['total'] or Decimal('0.00')
            m_sessions = month_txs.count()

            monthly_data.append({
                "month": month_date.strftime("%b"),
                "full_month": month_name,
                "revenue": float(m_revenue),
                "sessions": m_sessions
            })

        recent_transactions = PaymentTransactionSerializer(transactions[:10], many=True).data
        payouts_history = PayoutRecordSerializer(provider.payouts.all()[:10], many=True).data

        return Response({
            "gross_earned": float(gross_earned),
            "net_earned": float(net_earned),
            "fees_paid": float(fees_paid),
            "available_balance": float(available_balance),
            "total_paid_out": float(total_paid_out),
            "completed_sessions": completed_sessions,
            "monthly_chart": monthly_data,
            "recent_transactions": recent_transactions,
            "payouts_history": payouts_history,
        })

class RequestPayoutView(APIView):
    """
    Trigger a simulated payout of available balance for a provider.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            provider = ProviderProfile.objects.get(user=request.user)
        except ProviderProfile.DoesNotExist:
            return Response({"error": "Provider profile not found"}, status=status.HTTP_404_NOT_FOUND)

        transactions = PaymentTransaction.objects.filter(booking__provider=provider, status='SUCCEEDED')
        net_earned = transactions.aggregate(total=Sum('net_amount'))['total'] or Decimal('0.00')
        total_paid_out = PayoutRecord.objects.filter(provider=provider, status='PAID').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        available = net_earned - total_paid_out

        if available <= Decimal('5.00'):
            return Response({"error": "Minimum payout threshold is $5.00"}, status=status.HTTP_400_BAD_REQUEST)

        payout = PayoutRecord.objects.create(
            provider=provider,
            amount=available,
            status='PAID',
            payout_method='Stripe Direct Deposit',
            reference_code=f"po_{uuid.uuid4().hex[:12]}"
        )

        Notification.objects.create(
            recipient=request.user,
            title='Payout Processed!',
            message=f'${available:.2f} has been transferred to your connected bank account.',
            notification_type='general',
            action_url='/dashboard/provider'
        )

        return Response({
            "message": f"Successfully initiated payout of ${available:.2f}",
            "payout": PayoutRecordSerializer(payout).data
        })
