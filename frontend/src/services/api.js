// filepath: src/services/api.js
import axios from 'axios';
import { toast } from 'sonner';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
});

// ── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────────
let _refreshing = false;
let _refreshQueue = [];

const processQueue = (error, token = null) => {
  _refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  _refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Don't intercept 401 on login endpoint — Login.jsx will handle the error display
    const isLoginRequest = original.url === '/auth/login';

    if (error.response?.status === 401 && !original._retry && !isLoginRequest) {
      const refreshToken = localStorage.getItem('refreshToken');

      // If no refresh token, clear session and redirect
      if (!refreshToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Queue concurrent requests while refresh is in-flight
      if (_refreshing) {
        return new Promise((resolve, reject) => {
          _refreshQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      _refreshing = true;

      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const newToken = res.data?.token;
        if (!newToken) throw new Error('No token in refresh response');

        localStorage.setItem('token', newToken);
        if (res.data?.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        original.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        _refreshing = false;
      }
    }

    if (error.response) {
      const message = error.response.data?.message || 'Something went wrong';
      // Skip global toast for auth endpoints — Login/Register pages handle their own error display
      const isAuthRequest = original.url?.startsWith('/auth/');
      switch (error.response.status) {
        case 400:
        case 403:
        case 404:
        case 500:
          if (!isAuthRequest) toast.error(message);
          break;
        default:
          if (error.response.status !== 401 && !isAuthRequest) toast.error(message);
      }
    } else if (error.request) {
      const isAuthRequest = original.url?.startsWith('/auth/');
      if (!isAuthRequest) {
        toast.error('Server not responding. Check your connection.');
      }
    } else {
      const isAuthRequest = original.url?.startsWith('/auth/');
      if (!isAuthRequest) {
        toast.error(error.message);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ── API ENDPOINTS ─────────────────────────────────────────────────────────────
export const endpoints = {

  // 🔐 AUTH
  auth: {
    register:       (data)          => api.post('/auth/register', data),
    login:          (data)          => api.post('/auth/login', data),
    logout:         ()              => api.post('/auth/logout'),
    getMe:          ()              => api.get('/auth/me'),
    forgotPassword: (email)         => api.post('/auth/forgot-password', { email }),
    resetPassword:  (token, pass)   => api.put(`/auth/reset-password/${token}`, { password: pass }),
    refreshToken:   ()              => api.post('/auth/refresh'),
    verifyEmail:         (token) => api.get(`/auth/verify-email/${token}`),
    resendVerification:  ()      => api.post('/auth/resend-verification'),
    updateProfile:       (data)  => api.put('/auth/profile', data),
  },

  // 👤 USERS
  users: {
    getProfile:    ()         => api.get('/users/profile'),
    updateProfile: (data)     => api.put('/auth/profile', data),
    updatePassword:(data)     => api.put('/users/password', data),
    updatePhoto:   (formData) => api.put('/users/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getStats:      ()         => api.get('/users/stats'),
  },

  // 🚗 DRIVERS
  drivers: {
    getAll:           (params) => api.get('/drivers', { params }),
    getById:          (id)     => api.get(`/drivers/${id}`),
    getAvailability:  (id)     => api.get(`/drivers/${id}/availability`),
    getReviews:       (id, params) => api.get(`/drivers/${id}/reviews`, { params }),
    getMyEarnings:    ()       => api.get('/drivers/me/earnings'),
    getAvailable:     ()       => api.get('/drivers', { params: { isAvailable: 'true' } }),
    search:           (params) => api.get('/drivers', { params }),
  },

  // 📦 BOOKINGS
  bookings: {
    create:  (data) => api.post('/bookings', data),
    getAll:  ()     => api.get('/bookings'),
    getById: (id)   => api.get(`/bookings/${id}`),
    update:  (id, data) => api.put(`/bookings/${id}`, data),
    cancel:  (id)   => api.patch(`/bookings/${id}/cancel`),
    delete:  (id)   => api.delete(`/bookings/${id}`),
    review:  (id, data) => api.post(`/bookings/${id}/review`, data),
    track:   (ref)  => api.get(`/bookings/track/${ref}`),
  },

  // 💳 PAYMENTS
  payments: {
    createOrder: (data)      => api.post('/payments/create-order', data),
    verify:      (data)      => api.post('/payments/verify', data),
    refund:      (bookingId) => api.post(`/payments/refund/${bookingId}`),
  },
};
