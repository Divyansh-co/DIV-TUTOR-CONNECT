import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Star,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Sparkles,
  Award,
  BookOpen,
  Code,
  Atom,
  Languages,
  Music,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { StarRating } from '../components/ui/StarRating';
import { ProviderProfile } from '../types';
import { searchProviders } from '../services/api';

const CATEGORIES = [
  { id: 'mathematics', label: 'Mathematics', icon: BookOpen, count: '30+ Tutors' },
  { id: 'computer_science', label: 'Computer Science', icon: Code, count: '45+ Tutors' },
  { id: 'sciences', label: 'Sciences', icon: Atom, count: '28+ Tutors' },
  { id: 'languages', label: 'Languages', icon: Languages, count: '35+ Tutors' },
  { id: 'test_prep', label: 'Digital SAT / ACT', icon: GraduationCap, count: '20+ Tutors' },
  { id: 'music', label: 'Music & Piano', icon: Music, count: '18+ Tutors' },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredTutors, setFeaturedTutors] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState<'client' | 'provider' | null>(null);

  const handleQuickLogin = async (role: 'client' | 'provider') => {
    setDemoLoading(role);
    try {
      if (role === 'client') {
        await login({ email: 'client@tutorconnect.com', password: 'Password123!' });
        navigate('/dashboard/client');
      } else {
        await login({ email: 'tutor@tutorconnect.com', password: 'Password123!' });
        navigate('/dashboard/provider');
      }
    } catch (err) {
      navigate('/auth');
    } finally {
      setDemoLoading(null);
    }
  };

  useEffect(() => {
    searchProviders({ sort: 'rating' })
      .then((res) => {
        const results = res.data.results || [];
        setFeaturedTutors(results.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tutors?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/tutors');
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none dark:bg-brand-500/15" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3.5 py-1 text-xs font-semibold text-zinc-800 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-200">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Over 1,200+ Verified Academic Experts & Mentors</span>
            </div>

            {/* Quick 1-Click Recruiter Demo Access */}
            <div className="inline-flex items-center gap-1.5 p-1 rounded-full border border-brand-500/30 bg-brand-500/10 backdrop-blur-md text-xs font-medium">
              <span className="px-2 text-[11px] font-bold text-brand-700 dark:text-brand-300">
                🚀 Recruiter 1-Click:
              </span>
              <button
                type="button"
                disabled={!!demoLoading}
                onClick={() => handleQuickLogin('client')}
                className="px-2.5 py-0.5 rounded-full bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:text-brand-600 dark:hover:text-brand-400 font-semibold shadow-xs text-[11px] transition-colors"
              >
                {demoLoading === 'client' ? 'Entering...' : 'Demo as Student'}
              </button>
              <button
                type="button"
                disabled={!!demoLoading}
                onClick={() => handleQuickLogin('provider')}
                className="px-2.5 py-0.5 rounded-full bg-brand-600 text-white hover:bg-brand-700 font-semibold shadow-xs text-[11px] transition-colors"
              >
                {demoLoading === 'provider' ? 'Entering...' : 'Demo as Tutor'}
              </button>
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.1]">
            Learn faster with world-class <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-violet-400">
              private tutors on demand.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Connect with vetted tutors from Stanford, MIT, and leading tech firms.
            Book interactive 1-on-1 sessions with instant calendar sync and transparent pricing.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="mx-auto max-w-2xl flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none transition-all"
          >
            <div className="flex-1 flex items-center gap-3 px-3 py-1.5 w-full">
              <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to learn? (e.g. Calculus, Python, SAT, French)"
                className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder-zinc-600"
              />
            </div>
            <Button type="submit" size="md" variant="primary" className="w-full sm:w-auto px-6 font-semibold">
              Search Tutors
            </Button>
          </form>

          {/* Value points badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400 pt-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-500" />
              <span>100% Verified Credentials</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              <span>Satisfaction Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-500" />
              <span>Real-Time Calendar Booking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Browse by Subject
            </h2>
            <p className="text-xs text-zinc-500">Explore top tutoring specialties</p>
          </div>
          <Link
            to="/tutors"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 inline-flex items-center gap-1"
          >
            View all categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`/tutors?category=${cat.id}`}
                className="group flex flex-col p-4 rounded-xl border border-zinc-200 bg-white hover:border-brand-300 hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors dark:bg-brand-950/60 dark:text-brand-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {cat.label}
                </h3>
                <span className="text-[10px] text-zinc-400 mt-0.5">{cat.count}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Tutors Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Top Rated Tutors
            </h2>
            <p className="text-xs text-zinc-500">Highest rated mentors available this week</p>
          </div>
          <Link
            to="/tutors"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 inline-flex items-center gap-1"
          >
            See all mentors <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredTutors.map((tutor) => (
            <Card
              key={tutor.id}
              className="flex flex-col justify-between hover:border-brand-400/80 hover:shadow-lg transition-all dark:hover:border-brand-500/60 group"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={tutor.avatar_url}
                    name={tutor.name || 'Tutor'}
                    size="lg"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {tutor.name}
                    </h3>
                    <p className="text-xs text-zinc-500">{tutor.city}, {tutor.state}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <StarRating rating={parseFloat(tutor.rating_avg.toString())} size="sm" />
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {parseFloat(tutor.rating_avg.toString()).toFixed(1)}
                      </span>
                      <span className="text-[11px] text-zinc-400">({tutor.reviews_count})</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {tutor.headline}
                </p>

                {/* Skills badges */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {tutor.skills.slice(0, 3).map((skill, idx) => (
                    <Badge key={idx} variant="neutral" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                    ${parseFloat(tutor.hourly_rate.toString()).toFixed(0)}
                  </span>
                  <span className="text-xs text-zinc-500"> / hour</span>
                </div>
                <Link to={`/tutors/${tutor.id}`}>
                  <Button size="sm" variant="primary">
                    Book Slot
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <div className="rounded-3xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50/50 p-8 sm:p-12 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              How TutorConnect Works
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500">
              Book your next breakthrough session in three seamless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white font-bold text-lg shadow-md shadow-brand-500/20">
                1
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Find Your Ideal Mentor
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Filter by subject, hourly budget, student rating, and verified credentials to find the exact match for your learning goals.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white font-bold text-lg shadow-md shadow-brand-500/20">
                2
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Pick a Real-Time Slot
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                View the tutor's live weekly availability calendar. Select an open slot that fits your schedule with zero back-and-forth messaging.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white font-bold text-lg shadow-md shadow-brand-500/20">
                3
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Learn & Excel 1-on-1
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Join your private video meeting room, work through practice problems together, and leave a verified review when completed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tutor Call-To-Action Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-6 py-12 sm:px-12 sm:py-16 text-white dark:bg-brand-700">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Are you an expert tutor or educator?
            </h2>
            <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
              Join the TutorConnect network. Set your own hourly rates, manage your recurring calendar, and reach thousands of motivated students.
            </p>
            <div className="pt-2">
              <Link to="/auth?tab=register&role=provider">
                <Button size="lg" className="bg-white text-brand-700 hover:bg-zinc-100 font-bold border-none shadow-lg">
                  Apply as a Tutor Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
