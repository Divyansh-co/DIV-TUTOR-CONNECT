import React from 'react';
import { ShieldCheck, CheckCircle2, Award, FileCheck2, UserCheck } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface VerifiedBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorName?: string;
}

export const VerifiedBadgeModal: React.FC<VerifiedBadgeModalProps> = ({
  isOpen,
  onClose,
  tutorName = 'This Tutor',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="space-y-6 text-center py-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
          <ShieldCheck className="h-8 w-8" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
            TutorConnect Trust Verified
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {tutorName} has passed TutorConnect's multi-tier rigorous vetting and verification pipeline.
          </p>
        </div>

        <div className="space-y-3 text-left">
          <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60">
            <UserCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                Government Identity Verified
              </span>
              <span className="text-[11px] text-zinc-500">
                Official biometric passport or government-issued ID validated with real-time face authentication.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60">
            <Award className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                Academic & Degree Credentials
              </span>
              <span className="text-[11px] text-zinc-500">
                Official transcripts and university degree diplomas audited by our academic registrar team.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60">
            <FileCheck2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                Clean Background & Code of Conduct
              </span>
              <span className="text-[11px] text-zinc-500">
                Continuous criminal record checks and strict compliance with our Student Safety Charter.
              </span>
            </div>
          </div>
        </div>

        <Button variant="primary" size="md" className="w-full font-bold" onClick={onClose}>
          Got it
        </Button>
      </div>
    </Modal>
  );
};
