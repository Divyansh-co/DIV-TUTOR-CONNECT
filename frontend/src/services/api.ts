import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token to outgoing requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh token on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/api/v1/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return apiClient(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('auth:logout'));
        }
      }
    }
    return Promise.reject(error);
  }
);

// Search & Providers API
export const searchProviders = (params: Record<string, any>) =>
  apiClient.get('/search/', { params });

export const getProviderDetail = (id: number) =>
  apiClient.get(`/providers/${id}/`);

export const getProviderAvailableSlots = (providerId: number, params?: { start_date?: string; days?: number; duration?: number }) =>
  apiClient.get(`/bookings/available-slots/${providerId}/`, { params });

// Bookings API
export const createBooking = (data: { service_id: number; start_time: string; notes?: string }) =>
  apiClient.post('/bookings/', data);

export const getClientBookings = (status?: string) =>
  apiClient.get('/bookings/client/', { params: status ? { status } : {} });

export const getProviderBookings = (status?: string) =>
  apiClient.get('/bookings/provider/', { params: status ? { status } : {} });

export const bookingAction = (id: number, action: 'accept' | 'decline' | 'cancel' | 'complete', reason?: string) =>
  apiClient.post(`/bookings/${id}/action/`, { action, reason });

export const rescheduleBooking = (id: number, new_start_time: string) =>
  apiClient.post(`/bookings/${id}/reschedule/`, { new_start_time });

// Payments API
export const createPaymentIntent = (booking_id: number) =>
  apiClient.post('/payments/create-intent/', { booking_id });

export const confirmPayment = (booking_id: number, payment_intent_id?: string) =>
  apiClient.post('/payments/confirm/', { booking_id, payment_intent_id });

export const getProviderEarnings = () =>
  apiClient.get('/payments/earnings/');

export const requestPayout = () =>
  apiClient.post('/payments/payout/');

// Reviews API
export const createReview = (data: { booking: number; rating: number; comment: string }) =>
  apiClient.post('/reviews/', data);

export const getProviderReviews = (providerId: number) =>
  apiClient.get(`/reviews/provider/${providerId}/`);

// Notifications API
export const getNotifications = () =>
  apiClient.get('/notifications/');

export const markNotificationRead = (id: number) =>
  apiClient.post(`/notifications/${id}/read/`);

export const markAllNotificationsRead = () =>
  apiClient.post('/notifications/read-all/');

// Provider Profile & Schedule Management API
export const getMyProviderProfile = () =>
  apiClient.get('/providers/me/');

export const updateMyProviderProfile = (data: any) =>
  apiClient.patch('/providers/me/', data);

export const createServiceListing = (data: any) =>
  apiClient.post('/providers/my-services/', data);

export const updateServiceListing = (id: number, data: any) =>
  apiClient.patch(`/providers/my-services/${id}/`, data);

export const deleteServiceListing = (id: number) =>
  apiClient.delete(`/providers/my-services/${id}/`);

export const createAvailabilitySlot = (data: any) =>
  apiClient.post('/providers/my-slots/', data);

export const deleteAvailabilitySlot = (id: number) =>
  apiClient.delete(`/providers/my-slots/${id}/`);
