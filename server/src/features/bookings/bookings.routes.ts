import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import * as bookingsController from './bookings.controller';
import { createBookingSchema, updateBookingSchema, reviewSchema } from './bookings.validator';

const router = Router();

// Public — no auth required
router.get('/track/:ref', bookingsController.getBookingByRef);

router.use(protect);

router.post('/',         validate(createBookingSchema), bookingsController.createBooking);
router.get('/',                                         bookingsController.getMyBookings);
router.get('/:id',                                      bookingsController.getBookingById);
router.put('/:id',       validate(updateBookingSchema), bookingsController.updateBooking);
router.patch('/:id/cancel',                             bookingsController.cancelBooking);
router.post('/:id/review', validate(reviewSchema),      bookingsController.addReview);
router.delete('/:id',                                   bookingsController.deleteBooking);

export default router;
