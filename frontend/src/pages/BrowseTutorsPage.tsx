import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Star,
  MapPin,
  Sparkles,
  ArrowUpDown,
  Laptop,
  Users,
  Heart,
} from 'lucide-react';
import { toast } from 'sonner';
import { ProviderProfile } from '../types';
import { searchProviders } from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { StarRating } from '../components/ui/StarRating';
import { Skeleton } from '../components/ui/Skeleton';

const CATEGORIES = [
  { id: '', label: 'All Subjects' },
  { id: 'mathematics', label: 'Mathematics' },
  { id: 'computer_science', label: 'Computer Science' },
  { id: 'sciences', label: 'Sciences' },
  { id: 'languages', label: 'Languages' },
  { id: 'test_prep', label: 'Test Prep (SAT/ACT)' },
  { id: 'music', label: 'Music' },
  { id: 'business', label: 'Business & Finance' },
];

export const BrowseTutorsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search filter states
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [maxPrice, setMaxPrice] = useState<number>(150);
  const [minRating, setMinRating] = useState<string>('');
  const [city, setCity] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  const [tutors, setTutors] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('tutorconnect_favorites') || '[]');
    } catch {
      return [];
    }
  });

  const toggleFavorite = (tutorId: number, tutorName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let updated: number[];
    if (favorites.includes(tutorId)) {
      updated = favorites.filter((id) => id !== tutorId);
      toast.info(`Removed ${tutorName} from saved favorites.`);
    } else {
      updated = [...favorites, tutorId];
      toast.success(`Saved ${tutorName} to your favorites!`);
    }
    setFavorites(updated);
    localStorage.setItem('tutorconnect_favorites', JSON.stringify(updated));
  };

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        q: query || undefined,
        category: category || undefined,
        max_price: maxPrice < 150 ? maxPrice : undefined,
        min_rating: minRating || undefined,
        city: city || undefined,
        online: onlineOnly ? 'true' : undefined,
        sort: sortBy,
      };
      const res = await searchProviders(params);
      setTutors(res.data.results || []);
      setTotalCount(res.data.count || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, [category, maxPrice, minRating, city, onlineOnly, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTutors();
  };

  const handleClearFilters = () => {
    setQuery('');
    setCategory('');
    setMaxPrice(150);
    setMinRating('');
    setCity('');
    setOnlineOnly(false);
    setSortBy('rating');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Find Your Ideal Tutor
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Explore top-rated verified tutors ready for 1-on-1 private bookings.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by tutor name, topic, or skill (e.g. Calculus, LeetCode, Organic Chem)..."
            className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-brand-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        <Button type="submit" variant="primary" size="md">
          Search
        </Button>
      </form>

      {/* Main Layout: Filters Sidebar + Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-brand-500" />
              Filters
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
            >
              Reset
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              Category
            </label>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    category === cat.id
                      ? 'bg-brand-50 text-brand-700 font-semibold dark:bg-brand-950 dark:text-brand-300'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{cat.label}</span>
                  {category === cat.id && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Hourly Rate Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              <span>Max Hourly Rate</span>
              <span className="text-brand-600 dark:text-brand-400">
                {maxPrice >= 150 ? 'Any price' : `Up to $${maxPrice}/hr`}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>$20/hr</span>
              <span>$85/hr</span>
              <span>$150+/hr</span>
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              Minimum Rating
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { val: '', label: 'Any' },
                { val: '4.5', label: '4.5+ ★' },
                { val: '4.9', label: '4.9+ ★' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setMinRating(opt.val)}
                  className={`py-1.5 text-xs rounded-lg border text-center transition-all ${
                    minRating === opt.val
                      ? 'border-brand-600 bg-brand-50 text-brand-700 font-semibold dark:border-brand-400 dark:bg-brand-950 dark:text-brand-300'
                      : 'border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Mode Toggle */}
          <div>
            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              Session Format
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={onlineOnly}
                onChange={(e) => setOnlineOnly(e.target.checked)}
                className="rounded border-zinc-300 text-brand-600 focus:ring-brand-500 accent-brand-600"
              />
              <Laptop className="w-3.5 h-3.5 text-zinc-400" />
              <span>Offers Online Video Sessions</span>
            </label>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-xs">
            <span className="text-zinc-500">
              Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalCount}</span> verified tutor(s)
            </span>

            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="reviews">Most Reviews</option>
              </select>
            </div>
          </div>

          {/* Tutors Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-5 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : tutors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                No tutors found matching your criteria
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Try widening your price range or clearing subject filters to view more mentors.
              </p>
              <Button size="sm" variant="outline" onClick={handleClearFilters} className="mt-2">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutors.map((tutor) => (
                <Card
                  key={tutor.id}
                  className="flex flex-col justify-between hover:border-brand-400/80 hover:shadow-md transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={tutor.avatar_url}
                        name={tutor.name || 'Tutor'}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <Link to={`/tutors/${tutor.id}`} className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                              {tutor.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {tutor.is_featured && (
                              <Badge variant="brand" size="sm">Featured</Badge>
                            )}
                            <button
                              type="button"
                              onClick={(e) => toggleFavorite(tutor.id, tutor.name, e)}
                              title={favorites.includes(tutor.id) ? 'Remove from Saved' : 'Save Tutor'}
                              className={`p-1.5 rounded-full transition-all ${
                                favorites.includes(tutor.id)
                                  ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/50'
                                  : 'text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                              }`}
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  favorites.includes(tutor.id) ? 'fill-rose-500 text-rose-500' : ''
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-zinc-400" />
                          <span>{tutor.city}, {tutor.state}</span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1">
                          <StarRating rating={parseFloat(tutor.rating_avg.toString())} size="sm" />
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {parseFloat(tutor.rating_avg.toString()).toFixed(1)}
                          </span>
                          <span className="text-[11px] text-zinc-400">({tutor.reviews_count} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {tutor.headline}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {tutor.skills.slice(0, 4).map((skill, idx) => (
                        <Badge key={idx} variant="neutral" size="sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-500">Hourly Rate</span>
                      <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                        ${parseFloat(tutor.hourly_rate.toString()).toFixed(0)}
                        <span className="text-xs font-normal text-zinc-500"> / hr</span>
                      </div>
                    </div>
                    <Link to={`/tutors/${tutor.id}`}>
                      <Button size="sm" variant="primary">
                        View Profile & Slots
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
