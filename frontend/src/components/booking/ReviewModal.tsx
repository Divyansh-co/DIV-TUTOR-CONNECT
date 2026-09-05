import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StarRating } from '../ui/StarRating';
import { createReview } from '../../services/api';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  providerName: string;
  serviceTitle: string;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  providerName,
  serviceTitle,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Please write a short feedback comment.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    try {
      await createReview({
        booking: bookingId,
        rating,
        comment,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.comment || err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leave a Verified Review">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-xs text-zinc-500">
            Session with <span className="font-semibold text-zinc-800 dark:text-zinc-200">{providerName}</span> for{' '}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">"{serviceTitle}"</span>
          </p>
        </div>

        {errorMsg && (
          <div className="p-2.5 text-xs text-red-700 bg-red-50 rounded-lg border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            Overall Rating
          </span>
          <StarRating rating={rating} size="lg" interactive onRatingChange={(val) => setRating(val)} />
          <span className="text-xs text-zinc-500 mt-2 font-medium">
            {rating === 5 && 'Outstanding experience!'}
            {rating === 4 && 'Very good session'}
            {rating === 3 && 'Average'}
            {rating <= 2 && 'Needs improvement'}
          </span>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Your Feedback & Comments
          </label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What was most helpful about this session? How was the tutor's pace and explanation?"
            className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder-zinc-400 focus:border-brand-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={loading}>
            Post Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};
