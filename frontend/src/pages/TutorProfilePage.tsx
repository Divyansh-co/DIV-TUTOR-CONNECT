import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Laptop,
  MessageSquare,
  Sparkles,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { ProviderProfile, ServiceListing, CalculatedSlot, Review } from '../types';
import { getProviderDetail, getProviderReviews } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StarRating } from '../components/ui/StarRating';
import { Skeleton } from '../components/ui/Skeleton';
import { InteractiveBookingCalendar } from '../components/booking/InteractiveBookingCalendar';
import { StripeTestCheckoutModal } from '../components/booking/StripeTestCheckoutModal';

export const TutorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [tutor, setTutor] = useState<ProviderProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking selection states
  const [selectedService, setSelectedService] = useState<ServiceListing | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<CalculatedSlot | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getProviderDetail(parseInt(id)), getProviderReviews(parseInt(id))])
      .then(([resProfile, resReviews]) => {
        setTutor(resProfile.data);
        setReviews(resReviews.data.results || resReviews.data || []);
        if (resProfile.data.services && resProfile.data.services.length > 0) {
          setSelectedService(resProfile.data.services[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBookNowClick = () => {
    if (!isAuthenticated) {
      navigate('/auth?tab=login');
      return;
    }
    if (selectedService && selectedSlot) {
      setIsCheckoutOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="mx-auto max-w-md text-center py-20">
        <h2 className="text-xl font-bold">Tutor Not Found</h2>
        <p className="text-xs text-zinc-500 mt-2">The requested tutor profile is currently unavailable.</p>
      </div>
    );
  }

  const tutorName = tutor.user?.display_name || tutor.name || 'Verified Tutor';
  const avatarUrl = tutor.user?.avatar_url_computed || tutor.avatar_url;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar src={avatarUrl} name={tutorName} size="xl" />

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white">
                {tutorName}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Tutor
              </span>
            </div>

            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {tutor.headline}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>{tutor.city}, {tutor.state}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <StarRating rating={parseFloat(tutor.rating_avg.toString())} size="sm" />
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {parseFloat(tutor.rating_avg.toString()).toFixed(1)}
                </span>
                <span>({tutor.reviews_count} reviews)</span>
              </div>
              {tutor.offers_online && (
                <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Online video tutoring available</span>
                </div>
              )}
            </div>
          </div>

          <div className="sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
            <span className="text-xs text-zinc-500">Base Rate</span>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              ${parseFloat(tutor.hourly_rate.toString()).toFixed(0)}
              <span className="text-xs font-normal text-zinc-500"> / hour</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Bio, Services, Reviews) / Right Column (Booking Engine) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Me / Bio */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              About {tutorName}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
              {tutor.bio || 'No detailed biography provided.'}
            </p>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Core Subjects & Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tutor.skills.map((s, idx) => (
                  <Badge key={idx} variant="neutral" size="md">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Service Packages Tabs */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Select a Tutoring Package
                </h2>
                <p className="text-xs text-zinc-500">Choose a service package to book a session</p>
              </div>
            </div>

            <div className="space-y-3">
              {(tutor.services || []).map((service) => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setSelectedSlot(null); // Reset slot if duration changes
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-500/20 dark:border-brand-400 dark:bg-brand-950/40'
                        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                          {service.category_display || service.category}
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1.5">
                          {service.title}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                          ${parseFloat(service.price.toString()).toFixed(2)}
                        </span>
                        <span className="text-[11px] text-zinc-500 block">
                          {service.duration_minutes} min
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                      {service.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Client Reviews Section */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  Client Reviews & Ratings
                </h2>
                <p className="text-xs text-zinc-500">Verified feedback from completed sessions</p>
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={parseFloat(tutor.rating_avg.toString())} size="md" />
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {parseFloat(tutor.rating_avg.toString()).toFixed(1)}
                </span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center italic">
                No reviews yet for this tutor. Be the first to book!
              </p>
            ) : (
              <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-800">
                {reviews.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {rev.client?.display_name || 'Client'}
                        </span>
                        <StarRating rating={rev.rating} size="sm" />
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {rev.service_title && (
                      <span className="text-[10px] text-zinc-400">
                        Lesson: {rev.service_title}
                      </span>
                    )}
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Column: Interactive Booking Calendar Widget */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Interactive Booking Engine
            </h3>

            {selectedService ? (
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Selected:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[150px]">
                    {selectedService.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Session Length:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {selectedService.duration_minutes} min
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">Session Fee:</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">
                    ${parseFloat(selectedService.price.toString()).toFixed(2)}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Interactive Calendar Component */}
            <InteractiveBookingCalendar
              providerId={tutor.id}
              durationMinutes={selectedService ? selectedService.duration_minutes : 60}
              selectedSlot={selectedSlot}
              onSlotSelected={(slot) => setSelectedSlot(slot)}
            />

            <Button
              variant="primary"
              size="lg"
              disabled={!selectedService || !selectedSlot}
              onClick={handleBookNowClick}
              className="w-full font-bold shadow-md shadow-brand-500/20"
            >
              {selectedSlot ? `Book ${selectedSlot.display_time} Session` : 'Select a Slot Above'}
            </Button>

            <p className="text-[11px] text-zinc-400 text-center">
              You won't be charged until test checkout confirmation.
            </p>
          </div>
        </div>
      </div>

      {/* Stripe Test Mode Checkout Modal */}
      {selectedService && selectedSlot && (
        <StripeTestCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          service={selectedService}
          provider={tutor}
          slot={selectedSlot}
          onSuccess={() => {
            // Success callback
          }}
        />
      )}
    </div>
  );
};
