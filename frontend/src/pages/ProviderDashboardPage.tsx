import React, { useState, useEffect } from 'react';
import {
  Inbox,
  DollarSign,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Video,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import {
  ProviderProfile,
  Booking,
  EarningsData,
  AvailabilitySlot,
  ServiceListing,
} from '../types';
import {
  getMyProviderProfile,
  getProviderBookings,
  getProviderEarnings,
  bookingAction,
  updateMyProviderProfile,
} from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EarningsChart } from '../components/dashboard/EarningsChart';
import { AvailabilityGrid } from '../components/dashboard/AvailabilityGrid';
import { ServiceListingManager } from '../components/dashboard/ServiceListingManager';
import { BookingChatModal } from '../components/booking/BookingChatModal';
import { VerifiedBadgeModal } from '../components/ui/VerifiedBadgeModal';

export const ProviderDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'earnings' | 'schedule' | 'services' | 'profile'>('inbox');
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatBooking, setChatBooking] = useState<Booking | null>(null);
  const [isVerifiedModalOpen, setIsVerifiedModalOpen] = useState(false);

  // Profile Edit form states
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('50.00');
  const [city, setCity] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveMsg, setProfileSaveMsg] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resProfile, resBookings, resEarnings] = await Promise.all([
        getMyProviderProfile(),
        getProviderBookings(),
        getProviderEarnings(),
      ]);
      setProfile(resProfile.data);
      setBookings(resBookings.data.results || resBookings.data || []);
      setEarnings(resEarnings.data);

      setHeadline(resProfile.data.headline || '');
      setBio(resProfile.data.bio || '');
      setHourlyRate(resProfile.data.hourly_rate?.toString() || '50.00');
      setCity(resProfile.data.city || '');
    } catch (err) {
      console.error('Provider fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleBookingAction = async (id: number, action: 'accept' | 'decline' | 'complete') => {
    try {
      await bookingAction(id, action);
      fetchAllData();
    } catch (err) {}
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSaveMsg(null);
    try {
      await updateMyProviderProfile({
        headline,
        bio,
        hourly_rate: parseFloat(hourlyRate),
        city,
      });
      setProfileSaveMsg('Profile updated successfully!');
      fetchAllData();
    } catch (err) {
      setProfileSaveMsg('Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Welcome Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Provider & Tutor Hub
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Manage your incoming student requests, schedule availability, and monitor Stripe earnings.
          </p>
        </div>

        {pendingBookings.length > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 text-xs font-semibold">
            <AlertCircle className="w-4 h-4" />
            <span>{pendingBookings.length} pending request(s) awaiting your action</span>
          </div>
        )}
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-xs font-medium w-fit">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'inbox'
              ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white font-semibold'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          Requests Inbox ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'earnings'
              ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white font-semibold'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Earnings & Payouts
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'schedule'
              ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white font-semibold'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Weekly Availability
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'services'
              ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white font-semibold'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Service Listings
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'profile'
              ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white font-semibold'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Profile Settings
        </button>
      </div>

      {/* Tab 1: Requests Inbox */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center text-zinc-500 text-xs">
              No booking requests received yet. Ensure your weekly availability and services are configured!
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : booking.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span className="text-xs text-zinc-400">Request #{booking.id}</span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {booking.service?.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                    <span>Client: <strong className="text-zinc-800 dark:text-zinc-200">{booking.client.display_name}</strong> ({booking.client.email})</span>
                    <span>Time: <strong>{new Date(booking.start_time).toLocaleString()}</strong></span>
                    <span>Amount: <strong>${parseFloat(booking.total_price.toString()).toFixed(2)}</strong></span>
                  </div>

                  {booking.notes && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 italic bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg">
                      Student note: "{booking.notes}"
                    </p>
                  )}
                </div>

                {/* Inbox actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setChatBooking({
                        ...booking,
                        client_name: booking.client.display_name,
                        service_title: booking.service?.title || 'Session',
                      })
                    }
                    className="gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-brand-500" />
                    Message Student
                  </Button>

                  {booking.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleBookingAction(booking.id, 'accept')}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBookingAction(booking.id, 'decline')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Decline
                      </Button>
                    </>
                  )}

                  {booking.status === 'CONFIRMED' && (
                    <>
                      {booking.meeting_link && (
                        <a href={booking.meeting_link} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="primary">
                            <Video className="w-3.5 h-3.5 mr-1" />
                            Start Meeting Room
                          </Button>
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBookingAction(booking.id, 'complete')}
                      >
                        Mark Completed
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Earnings & Payouts */}
      {activeTab === 'earnings' && earnings && (
        <EarningsChart earnings={earnings} onPayoutSuccess={fetchAllData} />
      )}

      {/* Tab 3: Availability Grid */}
      {activeTab === 'schedule' && profile && (
        <AvailabilityGrid
          slots={profile.availability_slots || []}
          onSlotsUpdated={fetchAllData}
        />
      )}

      {/* Tab 4: Service Listings Manager */}
      {activeTab === 'services' && profile && (
        <ServiceListingManager
          services={profile.services || []}
          onServicesUpdated={fetchAllData}
        />
      )}

      {/* Tab 5: Profile Settings */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Tutor Public Profile Settings
          </h3>

          {profileSaveMsg && (
            <div className="p-3 text-xs rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              {profileSaveMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Stanford PhD | Calculus & Linear Algebra Specialist"
              className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Base Hourly Rate ($/hr)
              </label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Primary City / Region
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. San Francisco"
                className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Detailed Bio & Teaching Background
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              required
            />
          </div>

          {/* Verification Center Card */}
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Trust & Credentials Verification Status: <span className="text-emerald-600 dark:text-emerald-400">Verified Tutor</span>
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Your government ID and academic credentials are active and prominently displayed with a verified badge.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsVerifiedModalOpen(true)}
              className="text-xs shrink-0"
            >
              View Verification Standards
            </Button>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md" isLoading={isSavingProfile}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      )}

      {/* In-App Chat Modal */}
      {chatBooking && (
        <BookingChatModal
          isOpen={!!chatBooking}
          onClose={() => setChatBooking(null)}
          booking={chatBooking}
          currentRole="provider"
        />
      )}

      {/* Verified Badge Details Modal */}
      <VerifiedBadgeModal
        isOpen={isVerifiedModalOpen}
        onClose={() => setIsVerifiedModalOpen(false)}
        tutorName={profile?.name || 'Your Profile'}
      />
    </div>
  );
};
