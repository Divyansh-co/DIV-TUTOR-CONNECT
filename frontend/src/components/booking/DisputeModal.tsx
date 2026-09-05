import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, FileText, Send } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Booking } from '../../types';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const [reason, setReason] = useState('no_show');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const ticketId = `DISP-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedTicket(ticketId);
    }, 800);
  };

  const handleResetAndClose = () => {
    setSubmittedTicket(null);
    setDescription('');
    setReason('no_show');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleResetAndClose} title="Report Session Issue or Dispute" size="md">
      {submittedTicket ? (
        <div className="text-center py-6 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
              Dispute Ticket Opened
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Your report has been received by the TutorConnect Trust & Safety moderation team.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-xs">
            <span className="block text-zinc-400">Reference Case Number</span>
            <span className="font-mono text-sm font-bold text-brand-600 dark:text-brand-400">
              #{submittedTicket}
            </span>
            <p className="mt-2 text-[11px] text-zinc-500">
              Our safety officers review disputes within 24 hours. If a refund or penalty applies, your payment method will be updated automatically.
            </p>
          </div>

          <Button variant="primary" size="md" className="w-full" onClick={handleResetAndClose}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">TutorConnect 100% Satisfaction Policy</span>
              If your instructor failed to attend or the lesson experienced severe technical issues, you are entitled to a full session credit or refund.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Reason for Dispute
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="no_show">Tutor did not attend (No-show)</option>
              <option value="technical_difficulties">Technical / video connectivity failure</option>
              <option value="inaccurate_service">Session did not match service description</option>
              <option value="unprofessional_conduct">Unprofessional or inappropriate behavior</option>
              <option value="billing_error">Billing or charge discrepancy</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Detailed Explanation
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred during the scheduled session time..."
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={loading}
              className="gap-1.5 font-semibold"
            >
              <ShieldAlert className="w-4 h-4" />
              Submit Formal Dispute
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
