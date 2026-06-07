// filepath: src/services/api.js
import axios from 'axios';
import { toast } from 'sonner';

// ✅ Base URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// ✅ Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

// ✅ REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response) {
      const message = error.response.data?.message || 'Something went wrong';

      switch (error.response.status) {
        case 400:
        case 403:
        case 404:
        case 500:
          toast.error(message);
          break;

        case 401:
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
          break;

        default:
          toast.error(message);
      }

    } else if (error.request) {
      toast.error('Server not responding. Check backend.');
    } else {
      toast.error(error.message);
    }

    return Promise.reject(error);
  }
);

export default api;

// ✅ API ENDPOINTS
export const endpoints = {

  // 🔐 AUTH
  auth: {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
    refreshToken: () => api.post('/auth/refresh'),
    verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  },

  // 👤 USERS
  users: {
    getProfile: () => api.get('/users/profile/me'),
    updateProfile: (data) => api.put('/users/profile/me', data),
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    deleteUser: (id) => api.delete(`/users/${id}`),
    updatePassword: (id, data) => api.put(`/users/${id}/password`, data),
    updatePhoto: (id, formData) => api.put(`/users/${id}/photo`, formData),
    getBookings: (id) => api.get(`/users/${id}/bookings`),
    getStats: (id) => api.get(`/users/${id}/stats`),
  },

  // 🚗 DRIVERS
  drivers: {
    getAll: (params) => api.get('/drivers', { params }),
    getById: (id) => api.get(`/drivers/${id}`),
    getAvailable: () => api.get('/drivers/available'),
  },

  // 📦 BOOKINGS
  bookings: {
    create: (data) => api.post('/bookings', data),
    getAll: () => api.get('/bookings'),
    getById: (id) => api.get(`/bookings/${id}`),
    update: (id, data) => api.put(`/bookings/${id}`, data),
    cancel: (id) => api.patch(`/bookings/${id}/cancel`),
    delete: (id) => api.delete(`/bookings/${id}`),
  },

  // 💳 PAYMENTS
  payments: {
    createOrder: (data) => api.post('/payments/create-order', data),
    verify: (data) => api.post('/payments/verify', data),
    refund: (bookingId) => api.post(`/payments/refund/${bookingId}`),
  }
};
