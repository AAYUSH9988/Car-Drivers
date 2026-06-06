// filepath: src/services/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

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
    getMe: () => api.get('/auth/me'), // ✅ FIXED
  },

  // 👤 USERS
  users: {
    getProfile: () => api.get('/auth/me'), // ✅ FIXED (was wrong)
    updateProfile: (data) => api.put('/auth/profile', data), // adjust if needed
  },

  // 🚗 DRIVERS
  drivers: {
    getAll: (params) => api.get('/drivers', { params }),
    getById: (id) => api.get(`/drivers/${id}`),
  },

  // 📦 BOOKINGS
  bookings: {
    create: (data) => api.post('/bookings', data),
    getAll: () => api.get('/bookings'),
    getById: (id) => api.get(`/bookings/${id}`),
    update: (id, data) => api.put(`/bookings/${id}`, data),
    cancel: (id) => api.patch(`/bookings/${id}/cancel`),
    delete: (id) => api.delete(`/bookings/${id}`),
  }
};