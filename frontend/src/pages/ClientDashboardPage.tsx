import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  Star,
  Search,
  ExternalLink,
  Ban,
  CalendarCheck,
  MessageSquare,
  Receipt,
  ShieldAlert,
  Heart,
  Sparkles,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { Booking, ProviderProfile } from '../types';
import { getClientBookings, bookingAction, searchProviders } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { StarRating } from '../components/ui/StarRating';
import { ReviewModal } from '../components/booking/ReviewModal';
import { BookingChatModal } from '../components/booking/BookingChatModal';
import { ReceiptModal } from '../components/booking/ReceiptModal';
import { DisputeModal } from '../components/booking/DisputeModal';

export const ClientDashboardPage: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<'sessions' | 'saved_tutors'>('sessions');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Saved Tutors state
  const [savedTutors, setSavedTutors] = useState<ProviderProfile[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  // Modals
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [chatBooking, setChatBooking] = useState<Booking | null>(null);
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);
  const [disputeBooking, setDisputeBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getClientBookings();
      setBookings(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedTutors = async () => {
    setSavedLoading(true);
    try {
      const savedIds: number[] = JSON.parse(localStorage.getItem('tutorconnect_favorites') || '[]');
      if (savedIds.length === 0) {
        setSavedTutors([]);
        return;
      }
      const res = await searchProviders({});
      const all: ProviderProfile[] = res.data.results || [];
      const filtered = all.filter((t) => savedIds.includes(t.id));
      setSavedTutors(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setSavedLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (activeMainTab === 'saved_tutors') {
      fetchSavedTutors();
    }
  }, [activeMainTab]);

  const handleCancelBooking = async (id: number) => {
    const reason = window.prompt('Please enter a cancellation reason:');
    if (reason === null) return;
    try {
      await bookingAction(id, 'cancel', reason);
      toast.success('Session cancelled. Any eligible refund has been processed.');
      fetchBookings();
    } catch (err: any) {
      toast.error('Failed to cancel session.');
    }
  };

  const handleRemoveFavorite = (tutorId: number) => {
    const savedIds: number[] = JSON.parse(localStorage.getItem('tutorconnect_favorites') || '[]');
    const updated = savedIds.filter((id) => id !== tutorId);
    localStorage.setItem('tutorconnect_favorites', JSON.stringify(updated));
    setSavedTutors((prev) => prev.filter((t) => t.id !== tutorId));
    toast.info('Removed tutor from saved favorites.');
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'UPCOMING') return b.status === 'CONFIRMED' || b.status === 'PENDING';
    return b.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="success">Confirmed</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'COMPLETED':
        return <Badge variant="brand">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'DECLINED':
        return <Badge variant="danger">Declined</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Client Portal & Sessions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Manage your bookings, launch video rooms, message tutors, and view official payment receipts.
          </p>
        </div>
        <Link to="/tutors">
          <Button variant="primary" size="sm">
            <Search className="w-3.5 h-3.5 mr-1" />
            Find Another Tutor
          </Button>
        </Link>
      </div>

      {/* Main Mode Navigation Tabs (Sessions vs Saved Tutors) */}
      <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 text-sm">
        <button
          type="button"
          onClick={() => setActiveMainTab('sessions')}
          className={`pb-3 font-semibold border-b-2 transition-colors ${
            activeMainTab === 'sessions'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          My Sessions ({bookings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('saved_tutors')}
          className={`pb-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeMainTab === 'saved_tutors'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          Saved Tutors
        </button>
      </div>

      {activeMainTab === 'saved_tutors' ? (
        /* Saved Tutors Section */
        <div className="space-y-4">
          {savedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : savedTutors.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/60 dark:text-rose-400">
                <Heart className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  No saved tutors yet
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Click the heart icon on any tutor card while browsing to save them for quick 1-click booking!
                </p>
              </div>
              <Link to="/tutors">
                <Button size="md" variant="primary">
                  Explore Top Tutors
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="p-5 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 space-y-3 shadow-sm hover:border-brand-500 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar src={tutor.avatar_url} name={tutor.name || 'Tutor'} size="md" />
                      <div>
                        <Link to={`/tutors/${tutor.id}`}>
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:text-brand-600 dark:hover:text-brand-400">
                            {tutor.name}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <MapPin className="w-3 h-3 text-zinc-400" />
                          <span>{tutor.city}, {tutor.state}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFavorite(tutor.id)}
                      title="Remove from saved"
                      className="p-1.5 rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                    >
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {tutor.headline}
                  </p>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      ${parseFloat(tutor.hourly_rate.toString()).toFixed(0)}/hr
                    </span>
                    <Link to={`/tutors/${tutor.id}`}>
                      <Button size="sm" variant="primary">
                        Book Session
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Sessions Section */
        <div className="space-y-6">
          {/* Status Sub-Filters */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 w-fit text-xs">
            {[
              { id: 'ALL', label: 'All Sessions' },
              { id: 'UPCOMING', label: 'Upcoming' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'CANCELLED', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                <CalendarCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  No sessions found
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  You don't have any bookings matching this filter. Discover verified tutors to schedule your next session!
                </p>
              </div>
              <Link to="/tutors">
                <Button size="md" variant="primary">
                  Browse Available Tutors
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const isUpcoming = booking.status === 'CONFIRMED' || booking.status === 'PENDING';
                const isCompleted = booking.status === 'COMPLETED';

                // Cancellation policy computation (> 24h away is 100% refundable)
                const startTimeMs = new Date(booking.start_time).getTime();
                const hoursUntil = (startTimeMs - Date.now()) / (1000 * 60 * 60);
                const isFreeCancellation = hoursUntil > 24;

                const tutorName = booking.provider?.name || booking.provider_name || 'Academic Tutor';
                const serviceTitle = booking.service?.title || booking.service_title || 'Private 1-on-1 Tutoring';

                return (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
                  >
                    <div className="space-y-2.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(booking.status)}
                        <span className="text-xs font-mono text-zinc-400">#{booking.id}</span>

                        {/* Cancellation policy pill */}
                        {isUpcoming && (
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                              isFreeCancellation
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                            }`}
                          >
                            {isFreeCancellation ? '✓ Free Cancellation (100% Refundable)' : 'Late Cancellation Policy Applies (<24h)'}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {serviceTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-400">Instructor:</span>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {tutorName}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>
                            {new Date(booking.start_time).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>
                            {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          ${parseFloat(booking.total_price.toString()).toFixed(2)}
                        </div>
                      </div>

                      {booking.notes && (
                        <p className="text-xs text-zinc-500 italic bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 max-w-xl">
                          Goal: "{booking.notes}"
                        </p>
                      )}
                    </div>

                    {/* Action buttons on the right */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800 shrink-0">
                      {/* In-App Messaging Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setChatBooking({
                            ...booking,
                            provider_name: tutorName,
                            service_title: serviceTitle,
                          })
                        }
                        className="gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-brand-500" />
                        Message Tutor
                      </Button>

                      {/* Video Room Button */}
                      {isUpcoming && booking.meeting_link && (
                        <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="primary" className="gap-1.5">
                            <Video className="w-3.5 h-3.5" />
                            Join Video
                          </Button>
                        </a>
                      )}

                      {/* Official Receipt Button */}
                      {(isCompleted || booking.status === 'CONFIRMED') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setReceiptBooking({
                              ...booking,
                              provider_name: tutorName,
                              service_title: serviceTitle,
                            })
                          }
                          className="gap-1.5"
                        >
                          <Receipt className="w-3.5 h-3.5 text-zinc-500" />
                          Receipt
                        </Button>
                      )}

                      {/* Dispute / Report Issue Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setDisputeBooking({
                            ...booking,
                            provider_name: tutorName,
                            service_title: serviceTitle,
                          })
                        }
                        title="Report an issue with this session"
                        className="text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </Button>

                      {/* Cancellation Button */}
                      {isUpcoming && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          Cancel
                        </Button>
                      )}

                      {/* Review Button */}
                      {isCompleted && !booking.has_review && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            setReviewBooking({
                              ...booking,
                              provider_name: tutorName,
                              service_title: serviceTitle,
                            })
                          }
                          className="gap-1.5"
                        >
                          <Star className="w-3.5 h-3.5" />
                          Leave Review
                        </Button>
                      )}

                      {isCompleted && booking.has_review && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Reviewed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          isOpen={!!reviewBooking}
          onClose={() => setReviewBooking(null)}
          bookingId={reviewBooking.id}
          providerName={reviewBooking.provider_name || reviewBooking.provider?.name || 'Tutor'}
          serviceTitle={reviewBooking.service_title || reviewBooking.service?.title || 'Session'}
          onSuccess={() => {
            fetchBookings();
          }}
        />
      )}

      {/* In-App Chat Modal */}
      {chatBooking && (
        <BookingChatModal
          isOpen={!!chatBooking}
          onClose={() => setChatBooking(null)}
          booking={chatBooking}
          currentRole="client"
        />
      )}

      {/* Official Tax Invoice & Receipt Modal */}
      {receiptBooking && (
        <ReceiptModal
          isOpen={!!receiptBooking}
          onClose={() => setReceiptBooking(null)}
          booking={receiptBooking}
        />
      )}

      {/* Dispute & Safety Report Modal */}
      {disputeBooking && (
        <DisputeModal
          isOpen={!!disputeBooking}
          onClose={() => setDisputeBooking(null)}
          booking={disputeBooking}
        />
      )}
    </div>
  );
};
