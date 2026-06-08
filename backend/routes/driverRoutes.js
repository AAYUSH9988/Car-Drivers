// filepath: d:\VS CODE\Car Driver\backend\routes\driverRoutes.js
import express from 'express';
import {
  deleteDriver,
  getAllDrivers,
  getAvailableDrivers,
  getDriver,
  getDriverAvailability,
  getDriverBookings,
  getDriverEarnings,
  getDriverRatings,
  getDriverStats,
  getNearbyDrivers,
  registerDriver,
  searchDrivers,
  toggleDriverAvailability,
  updateDriver,
  updateDriverLocation,
  updateDriverStatus,
  updateDriverVehicle,
  uploadDriverDocuments,
  verifyDriverDocuments
} from '../controllers/driverController.js';
import { protect } from '../middleware/auth.js';
import { validateDriverRegistration } from '../middleware/validation.js';
import upload from '../utils/fileUpload.js';

const router = express.Router();

// ✅ PUBLIC ROUTES - GET drivers
router.get('/', getAllDrivers);
router.get('/search', searchDrivers);
router.get('/available', getAvailableDrivers);
router.get('/nearby', getNearbyDrivers);

// ✅ PROTECTED ROUTES - POST/PUT/DELETE
router.post('/register', protect, upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'vehiclePhoto', maxCount: 1 }
]), validateDriverRegistration, registerDriver);

router.put('/:id', protect, updateDriver);
router.delete('/:id', protect, deleteDriver);
router.patch('/:id/location', protect, updateDriverLocation);
router.patch('/:id/status', protect, updateDriverStatus);
router.patch('/:id/availability', protect, toggleDriverAvailability);
router.put('/:id/vehicle', protect, updateDriverVehicle);

// ✅ PROTECTED ROUTES - Driver data
router.get('/:id/availability', protect, getDriverAvailability);
router.get('/:id/bookings', protect, getDriverBookings);
router.get('/:id/earnings', protect, getDriverEarnings);
router.get('/:id/ratings', protect, getDriverRatings);
router.get('/:id/stats', protect, getDriverStats);

// ✅ PROTECTED ROUTES - Documents
router.post('/:id/documents', protect, upload.single('document'), uploadDriverDocuments);
router.patch('/:id/documents/verify', protect, verifyDriverDocuments);

// ✅ PUBLIC ROUTE - single driver (must be LAST to avoid shadowing /:id/*)
router.get('/:id', getDriver);

export default router;