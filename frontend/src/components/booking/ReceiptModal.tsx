import React, { useRef } from 'react';
import { Download, Printer, CheckCircle2, ShieldCheck, GraduationCap, Calendar, Clock, CreditCard } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Booking } from '../../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const priceNum = typeof booking.total_price === 'string' ? parseFloat(booking.total_price) : (booking.total_price || 0);
  const platformFee = Math.round(priceNum * 0.10 * 100) / 100;
  const tutorEarnings = Math.round((priceNum - platformFee) * 100) / 100;

  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(booking.id).padStart(5, '0')}`;
  const formattedDate = new Date(booking.start_time).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = new Date(booking.start_time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="space-y-6">
        {/* Printable receipt card */}
        <div
          ref={receiptRef}
          className="p-6 sm:p-8 rounded-2xl border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 shadow-sm"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white dark:bg-brand-500">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight text-zinc-950 dark:text-white">
                  Tutor<span className="text-brand-600 dark:text-brand-400">Connect</span>
                </h3>
                <p className="text-[11px] text-zinc-400">Official Payment Receipt & Tax Invoice</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Paid in Full
              </span>
              <p className="text-xs font-mono font-medium text-zinc-500 mt-1">{invoiceNumber}</p>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-zinc-100 dark:border-zinc-900 text-xs">
            <div>
              <span className="block text-zinc-400 text-[11px]">Billed To (Student)</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                {booking.client_name || 'Verified Student'}
              </span>
            </div>
            <div>
              <span className="block text-zinc-400 text-[11px]">Instructor</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                {booking.provider_name || 'Academic Tutor'}
              </span>
            </div>
            <div>
              <span className="block text-zinc-400 text-[11px]">Date & Time</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                {formattedDate} • {formattedTime}
              </span>
            </div>
            <div>
              <span className="block text-zinc-400 text-[11px]">Payment Reference</span>
              <span className="font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5 block truncate">
                {booking.stripe_payment_intent_id || 'pi_mock_98241038'}
              </span>
            </div>
          </div>

          {/* Line Item Table */}
          <div className="py-6 space-y-3">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Session Itemization
            </h4>
            <div className="rounded-xl border border-zinc-100 dark:border-zinc-900 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium text-center">Duration</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  <tr>
                    <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">
                      {booking.service_title}
                      <span className="block text-[11px] text-zinc-400 font-normal">
                        Private 1-on-1 tutoring session via TutorConnect Video
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400">
                      60 mins
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-white">
                      ${priceNum.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Totals Breakdown */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal (Session Fee)</span>
                <span>${priceNum.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Platform Tech Fee (10% - Covered)</span>
                <span className="text-emerald-600 dark:text-emerald-400">-$0.00</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-[11px] italic">
                <span>Tutor Payout (90%)</span>
                <span>${tutorEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-[11px] italic">
                <span>Platform Commission (10%)</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between font-bold text-sm text-zinc-900 dark:text-white">
                <span>Total Paid (USD)</span>
                <span className="text-brand-600 dark:text-brand-400">${priceNum.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Security & Watermark Footer */}
          <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 gap-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
              <span>Processed securely via Stripe Test Mode Payment Gateway</span>
            </div>
            <span>TutorConnect Inc. • Built by Divyansh Mishra</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};
