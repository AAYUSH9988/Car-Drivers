import express from 'express';
import {
    approveDriver,
    bulkUpdateDrivers,
    bulkUpdateUsers,
    createDriver,
    createUser,
    deleteDriver,
    deleteUser,
    exportData,
    generateReport,
    getAdminProfile,
    getAllBookings,
    getAllDrivers,
    getAllUsers,
    getAnalytics,
    getBookingDetails,
    getDashboardStats,
    getDriverDetails,
    getDriverStats,
    getSystemInfo,
    getUser,
    getUserStats,
    sendBulkNotification,
    suspendDriver,
    updateAdminProfile,
    updateBookingStatus,
    updateDriver,
    updateSystemSettings,
    updateUser
} from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard Routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/system-info', getSystemInfo);

// User Management Routes
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.patch('/users/bulk-update', bulkUpdateUsers);   // must be before /:id
router.get('/users/:id', getUser);
router.get('/users/:id/stats', getUserStats);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Booking Management Routes
router.get('/bookings', getAllBookings);
router.get('/bookings/:id', getBookingDetails);
router.patch('/bookings/:id/status', updateBookingStatus);

// Driver Management Routes
router.get('/drivers', getAllDrivers);
router.post('/drivers', createDriver);
router.patch('/drivers/bulk-update', bulkUpdateDrivers); // must be before /:id
router.get('/drivers/:id', getDriverDetails);
router.get('/drivers/:id/stats', getDriverStats);
router.put('/drivers/:id', updateDriver);
router.delete('/drivers/:id', deleteDriver);
router.patch('/drivers/:id/approve', approveDriver);
router.patch('/drivers/:id/suspend', suspendDriver);

// Admin Profile Routes
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);

// Reports and Analytics
router.post('/reports/generate', generateReport);
router.post('/export', exportData);

// System Management
router.put('/settings', updateSystemSettings);
router.post('/notifications/bulk', sendBulkNotification);

export default router;