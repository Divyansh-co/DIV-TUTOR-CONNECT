export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  is_client: boolean;
  is_provider: boolean;
  email_verified: boolean;
  phone_number?: string;
  avatar_url?: string;
  avatar_url_computed?: string;
  bio?: string;
  created_at?: string;
}

export interface ServiceListing {
  id: number;
  provider?: number;
  title: string;
  description: string;
  category: string;
  category_display?: string;
  price: string | number;
  duration_minutes: number;
  is_paused: boolean;
  created_at?: string;
}

export interface AvailabilitySlot {
  id: number;
  day_of_week: number;
  day_name?: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface AvailabilityBlock {
  id: number;
  date: string;
  start_time?: string;
  end_time?: string;
  all_day: boolean;
  reason?: string;
}

export interface ProviderProfile {
  id: number;
  user_id?: number;
  user?: User;
  name?: string;
  first_name?: string;
  avatar_url?: string;
  headline: string;
  bio: string;
  hourly_rate: string | number;
  rating_avg: string | number;
  reviews_count: number;
  city: string;
  state: string;
  country: string;
  travel_radius_km: number;
  offers_online: boolean;
  offers_in_person: boolean;
  skills: string[];
  languages: string[];
  portfolio_images?: string[];
  is_featured?: boolean;
  services_count?: number;
  min_price?: string | number;
  services?: ServiceListing[];
  availability_slots?: AvailabilitySlot[];
  availability_blocks?: AvailabilityBlock[];
}

export interface Booking {
  id: number;
  client: User;
  provider: ProviderProfile;
  service: ServiceListing;
  start_time: string;
  end_time: string;
  total_price: string | number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'DECLINED';
  notes?: string;
  cancellation_reason?: string;
  meeting_link?: string;
  stripe_payment_intent_id?: string;
  is_paid: boolean;
  has_review?: boolean;
  client_name?: string;
  provider_name?: string;
  service_title?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  booking: number;
  client: User;
  provider?: number;
  rating: number;
  comment: string;
  service_title?: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: 'booking_request' | 'booking_confirmed' | 'booking_reminder' | 'review_request' | 'general';
  action_url: string;
  is_read: boolean;
  created_at: string;
}

export interface MonthlyChartPoint {
  month: string;
  full_month: string;
  revenue: number;
  sessions: number;
}

export interface EarningsData {
  gross_earned: number;
  net_earned: number;
  fees_paid: number;
  available_balance: number;
  total_paid_out: number;
  completed_sessions: number;
  monthly_chart: MonthlyChartPoint[];
  recent_transactions: any[];
  payouts_history: any[];
}

export interface CalculatedSlot {
  start_time: string;
  end_time: string;
  display_time: string;
  available: boolean;
}
