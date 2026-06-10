import { Router } from 'express';
import { protect, authorize } from '../../middleware/auth.middleware';
import * as adminController from './admin.controller';

const router = Router();

router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Users — static routes MUST come before /:id
router.get('/users',                     adminController.getAllUsers);
router.post('/users',                    adminController.createUser);
router.patch('/users/bulk-update',       adminController.bulkUpdateUsers);
router.get('/users/:id/stats',           adminController.getUserStats);
router.get('/users/:id',                 adminController.getUser);
router.put('/users/:id',                 adminController.updateUser);
router.delete('/users/:id',              adminController.deleteUser);

// Drivers — same pattern
router.get('/drivers',                   adminController.getAllDrivers);
router.post('/drivers',                  adminController.createDriver);
router.patch('/drivers/bulk-update',     adminController.bulkUpdateDrivers);
router.get('/drivers/:id/stats',         adminController.getDriverStats);
router.get('/drivers/:id',               adminController.getDriverDetails);
router.put('/drivers/:id',               adminController.updateDriver);
router.delete('/drivers/:id',            adminController.deleteDriver);
router.patch('/drivers/:id/status',      adminController.updateDriverStatus);

// Bookings
router.get('/bookings',                  adminController.getAllBookings);
router.get('/bookings/:id',              adminController.getBookingById);
router.patch('/bookings/:id/status',     adminController.updateBookingStatus);

// Analytics
router.get('/analytics',                 adminController.getAnalytics);

// Settings
router.get('/settings',                  adminController.getSettings);
router.put('/settings',                  adminController.updateSettings);

// Export
router.post('/export',                   adminController.exportData);

// Notifications
router.post('/notifications/bulk',       adminController.sendBulkNotification);

export default router;
