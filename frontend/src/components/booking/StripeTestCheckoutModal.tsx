import React, { useState } from 'react';
import { CreditCard, Lock, ShieldCheck, CheckCircle2, Calendar, Clock, Download } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ServiceListing, ProviderProfile, CalculatedSlot } from '../../types';
import { createBooking, createPaymentIntent, confirmPayment } from '../../services/api';

interface StripeTestCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceListing;
  provider: ProviderProfile;
  slot: CalculatedSlot;
  onSuccess: (bookingId: number) => void;
}

export const StripeTestCheckoutModal: React.FC<StripeTestCheckoutModalProps> = ({
  isOpen,
  onClose,
  service,
  provider,
  slot,
  onSuccess,
}) => {
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [notes, setNotes] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const priceNum = typeof service.price === 'string' ? parseFloat(service.price) : service.price;
  const discountAmount = appliedPromo
    ? (appliedPromo.discount <= 1 ? priceNum * appliedPromo.discount : Math.min(appliedPromo.discount, priceNum))
    : 0;
  const totalAmount = Math.max(0, priceNum - discountAmount);

  const handleApplyPromo = (codeToApply?: string) => {
    const code = (codeToApply || promoCode).trim().toUpperCase();
    setPromoError(null);
    if (!code) return;

    if (code === 'TUTOR20') {
      setAppliedPromo({ code, discount: 0.20, label: '20% Off Launch Special' });
      setPromoCode('TUTOR20');
    } else if (code === 'DIVYANSH50') {
      setAppliedPromo({ code, discount: 0.50, label: '50% Off Recruiter Discount' });
      setPromoCode('DIVYANSH50');
    } else if (code === 'WELCOME10') {
      setAppliedPromo({ code, discount: 10.00, label: '$10 Off First Session' });
      setPromoCode('WELCOME10');
    } else {
      setPromoError('Invalid promo code. Try TUTOR20, DIVYANSH50, or WELCOME10.');
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Create booking in PENDING state
      const bookingRes = await createBooking({
        service_id: service.id,
        start_time: slot.start_time,
        notes,
      });
      const createdBooking = bookingRes.data;

      // 2. Initialize PaymentIntent
      const intentRes = await createPaymentIntent(createdBooking.id);
      const paymentIntentId = intentRes.data.payment_intent_id;

      // 3. Confirm payment in test mode
      const confirmRes = await confirmPayment(createdBooking.id, paymentIntentId);

      setConfirmedBooking({
        ...createdBooking,
        meeting_link: confirmRes.data.meeting_link,
      });
      onSuccess(createdBooking.id);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || 'Failed to complete booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadIcs = () => {
    if (!confirmedBooking) return;
    const startStr = new Date(slot.start_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endStr = new Date(slot.end_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:TutorConnect: ${service.title} with ${provider.name || 'Tutor'}`,
      `DESCRIPTION:Session link: ${confirmedBooking.meeting_link}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `session-${confirmedBooking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={confirmedBooking ? 'Booking Confirmed!' : 'Review & Checkout'}
      maxWidth="lg"
    >
      {confirmedBooking ? (
        <div className="text-center py-4 space-y-4 animate-fade-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              You are all set!
            </h4>
            <p className="text-xs text-zinc-500 mt-1">
              A confirmation email and calendar invite have been dispatched.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left dark:border-zinc-800 dark:bg-zinc-800/40 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Service:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{service.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Tutor:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{provider.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Scheduled Time:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {new Date(slot.start_time).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Video Meeting Room:</span>
              <a
                href={confirmedBooking.meeting_link}
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 dark:text-brand-400 underline font-medium truncate max-w-[200px]"
              >
                {confirmedBooking.meeting_link}
              </a>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={handleDownloadIcs}
            >
              <Download className="w-4 h-4 mr-1.5" />
              Download Calendar (.ics)
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handlePay} className="space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs text-red-700 bg-red-50 rounded-lg border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
              {errorMsg}
            </div>
          )}

          {/* Session Summary Box */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Service:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{service.title}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Tutor:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{provider.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Slot:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {new Date(slot.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {slot.display_time}
              </span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Promo ({appliedPromo.code} - {appliedPromo.label}):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs pt-2 border-t border-zinc-200 dark:border-zinc-700 font-bold">
              <span className="text-zinc-700 dark:text-zinc-300">Total Price:</span>
              <span className="text-base text-brand-600 dark:text-brand-400">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Promo Code Input & Quick Chips */}
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter Promo Code (e.g. TUTOR20)"
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 uppercase font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleApplyPromo()}
                className="text-xs shrink-0"
              >
                Apply
              </Button>
            </div>
            {promoError && (
              <p className="text-[11px] text-red-600 dark:text-red-400">{promoError}</p>
            )}
            {appliedPromo && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ {appliedPromo.label} applied successfully!
              </p>
            )}
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 pt-0.5">
              <span>Try test codes:</span>
              <button
                type="button"
                onClick={() => handleApplyPromo('TUTOR20')}
                className="underline hover:text-brand-600 dark:hover:text-brand-400 font-mono"
              >
                TUTOR20 (20% off)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleApplyPromo('DIVYANSH50')}
                className="underline hover:text-brand-600 dark:hover:text-brand-400 font-mono"
              >
                DIVYANSH50 (50% off)
              </button>
            </div>
          </div>

          {/* Note to tutor */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Add a note or topic goal for {provider.name} (optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Preparing for midterm, need help with integration by parts."
              className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-brand-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Stripe Test Mode Card Input */}
          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                <CreditCard className="w-4 h-4 text-brand-500" />
                <span>Payment Details (Stripe Test Mode)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                TEST MODE
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1">Card Number</label>
                <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-mono text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
                  <input
                    type="text"
                    value={cardNumber}
                    readOnly
                    className="w-full bg-transparent outline-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1">Expires</label>
                  <input
                    type="text"
                    value={expiry}
                    readOnly
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-mono text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1">CVC</label>
                  <input
                    type="text"
                    value={cvc}
                    readOnly
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-mono text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 outline-none"
                  />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight">
              Test mode preloaded with Stripe 4242 synthetic card. No actual charge will be incurred.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>256-bit SSL encrypted checkout & 100% money-back guarantee.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="md" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={loading}>
              Confirm & Pay ${totalAmount.toFixed(2)}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
