// filepath: d:\VS CODE\Car Driver\backend\routes\bookingRoutes.js
import express from 'express';
import {
  addReview,
  cancelBooking,
  createBooking,
  deleteBooking,
  getBookingById,
  getBookings,
  updateBooking
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

// ✅ CRITICAL: Router MUST be created BEFORE use()
const router = express.Router();

// ✅ Apply authentication middleware to ALL routes
router.use(protect);

// ✅ Routes using correct syntax
router.route('/')
  .post(createBooking)
  .get(getBookings);

router.route('/:id')
  .get(getBookingById)
  .put(updateBooking)
  .delete(deleteBooking);

router.patch('/:id/cancel', cancelBooking);
router.post('/:id/review', addReview);

export default router;