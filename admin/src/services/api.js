import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Create Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
    if (adminUser && adminUser.token) {
      config.headers['Authorization'] = `Bearer ${adminUser.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized responses (token expired, etc.)
    if (error.response && error.response.status === 401) {
      // Clear user data and redirect to login
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }
    
    return Promise.reject(error);
  }
);

// Auth endpoints — uses shared /auth/login (admin role is checked client-side)
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/admin/profile'),
};

// User endpoints
export const userAPI = {
  getAll:    (params) => api.get('/admin/users', { params }),
  getById:   (id) => api.get(`/admin/users/${id}`),
  getStats:  (id) => api.get(`/admin/users/${id}/stats`),
  create:    (userData) => api.post('/admin/users', userData),
  update:    (id, userData) => api.put(`/admin/users/${id}`, userData),
  delete:    (id) => api.delete(`/admin/users/${id}`),
  bulkUpdate: (userIds, updateData) => api.patch('/admin/users/bulk-update', { userIds, updateData }),
};

// Driver endpoints
export const driverAPI = {
  getAll:    (params) => api.get('/admin/drivers', { params }),
  getById:   (id) => api.get(`/admin/drivers/${id}`),
  getStats:  (id) => api.get(`/admin/drivers/${id}/stats`),
  create:    (driverData) => api.post('/admin/drivers', driverData),
  approve:   (id) => api.patch(`/admin/drivers/${id}/approve`),
  suspend:   (id, reason) => api.patch(`/admin/drivers/${id}/suspend`, { reason }),
  update:    (id, driverData) => api.put(`/admin/drivers/${id}`, driverData),
  delete:    (id) => api.delete(`/admin/drivers/${id}`),
  bulkUpdate: (driverIds, updateData) => api.patch('/admin/drivers/bulk-update', { driverIds, updateData }),
};

// Booking endpoints
export const bookingAPI = {
  getAll:       (params) => api.get('/admin/bookings', { params }),
  getById:      (id) => api.get(`/admin/bookings/${id}`),
  updateStatus: (id, status, note) => api.patch(`/admin/bookings/${id}/status`, { status, note }),
  delete:       (id) => api.delete(`/bookings/${id}`),
};

// Dashboard endpoints
export const dashboardAPI = {
  getSummary:      () => api.get('/admin/dashboard/stats'),
  getRecentBookings: (limit = 10) => api.get('/admin/bookings', { params: { limit, page: 1 } }),
  getAnalytics:    (type, period) => api.get('/admin/analytics', { params: { type, period } }),
};

// Reports & settings
export const reportAPI = {
  generate: (type, startDate, endDate) => api.post('/admin/reports/generate', { type, startDate, endDate }),
  export:   (type) => api.post('/admin/export', { type }, { responseType: 'blob' }),
};

export const settingsAPI = {
  getSystemInfo: () => api.get('/admin/system-info'),
  update:        (settings) => api.put('/admin/settings', { settings }),
};

export const profileAPI = {
  get:    () => api.get('/admin/profile'),
  update: (data) => api.put('/admin/profile', data),
};

// Export the full API instance as default
export default api;