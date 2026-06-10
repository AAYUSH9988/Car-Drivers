import mongoose from 'mongoose';
import Driver from '../../models/Driver.model';
import { ApiError } from '../../utils/ApiError';
import { sendBookingConfirmationEmail, sendBookingCancellationEmail } from '../../utils/email';
import * as bookingsRepo from './bookings.repository';
import type { CreateBookingInput, UpdateBookingInput, ReviewInput } from './bookings.validator';

export const createBooking = async (userId: string, input: CreateBookingInput) => {
  if (!mongoose.isValidObjectId(input.driverId)) throw ApiError.badRequest('Invalid driver ID');

  const driver = await Driver.findById(input.driverId).populate<{ user: { name: string; email: string } }>('user', 'name email');
  if (!driver)               throw ApiError.notFound('Driver');
  if (driver.status !== 'active') throw ApiError.badRequest('Driver is not active');
  if (!driver.isAvailable)        throw ApiError.badRequest('Driver is not available');

  const startDate = new Date(input.startTime);
  const endDate   = new Date(input.endTime);

  const conflict = await bookingsRepo.checkConflict(input.driverId, startDate, endDate);
  if (conflict) throw ApiError.badRequest('Driver is not available for this time slot');

  driver.isAvailable = false;
  driver.totalTrips  = (driver.totalTrips ?? 0) + 1;
  await driver.save();

  const booking = await bookingsRepo.create({
    user:           userId,
    driver:         input.driverId,
    startTime:      startDate,
    endTime:        endDate,
    pickupLocation: input.pickupLocation,
    dropLocation:   input.dropLocation,
    totalAmount:    input.totalAmount ?? 0,
    notes:          input.notes,
  });

  const populated = await bookingsRepo.findById(booking.id as string);

  // Fetch user details for email (non-blocking)
  import('../../models/User.model').then(({ default: User }) => {
    User.findById(userId).then((user) => {
      if (user && populated) {
        sendBookingConfirmationEmail(
          { name: user.name, email: user.email },
          {
            bookingReference: populated.bookingReference,
            pickupLocation:   populated.pickupLocation,
            dropLocation:     populated.dropLocation,
            startTime:        populated.startTime,
            totalAmount:      populated.totalAmount,
          },
          driver.user.name,
        ).catch(console.error);
      }
    });
  });

  return populated;
};

export const getMyBookings = (userId: string) =>
  bookingsRepo.findByUser(userId);

export const getBookingById = async (bookingId: string, userId: string, isAdmin: boolean) => {
  const booking = await bookingsRepo.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking');

  const ownerId = (booking.user as { _id: { toString(): string } })._id?.toString() ?? booking.user.toString();
  if (!isAdmin && ownerId !== userId) throw ApiError.forbidden();

  return booking;
};

export const updateBooking = async (bookingId: string, userId: string, input: UpdateBookingInput) => {
  const booking = await bookingsRepo.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking');

  const ownerId = (booking.user as { _id: { toString(): string } })._id?.toString() ?? booking.user.toString();
  if (ownerId !== userId) throw ApiError.forbidden();
  if (booking.status !== 'pending') throw ApiError.badRequest('Only pending bookings can be updated');

  if (input.startTime || input.endTime) {
    const newStart = new Date(input.startTime ?? booking.startTime);
    const newEnd   = new Date(input.endTime   ?? booking.endTime);
    const conflict = await bookingsRepo.checkConflict(booking.driver.toString(), newStart, newEnd, bookingId);
    if (conflict) throw ApiError.badRequest('Driver is not available for this time slot');
  }

  const updates: Record<string, unknown> = {};
  if (input.pickupLocation) updates['pickupLocation'] = input.pickupLocation;
  if (input.dropLocation)   updates['dropLocation']   = input.dropLocation;
  if (input.startTime)      updates['startTime']      = new Date(input.startTime);
  if (input.endTime)        updates['endTime']        = new Date(input.endTime);

  return bookingsRepo.updateById(bookingId, updates);
};

export const cancelBooking = async (bookingId: string, userId: string, isAdmin: boolean) => {
  const booking = await bookingsRepo.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking');

  const ownerId = (booking.user as { _id: { toString(): string } })._id?.toString() ?? booking.user.toString();
  if (!isAdmin && ownerId !== userId) throw ApiError.forbidden();
  if (!['pending', 'confirmed'].includes(booking.status)) {
    throw ApiError.badRequest('Only pending or confirmed bookings can be cancelled');
  }

  booking.status = 'cancelled';
  await booking.save();

  const active = await bookingsRepo.countActiveByDriver(booking.driver.toString(), bookingId);
  if (active === 0) {
    await Driver.findByIdAndUpdate(booking.driver, { isAvailable: true });
  }

  const user = booking.user as unknown as { name: string; email: string };
  sendBookingCancellationEmail({ name: user.name, email: user.email }, booking.bookingReference).catch(console.error);

  return booking;
};

export const addReview = async (bookingId: string, userId: string, input: ReviewInput) => {
  const booking = await bookingsRepo.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking');

  const ownerId = (booking.user as { _id: { toString(): string } })._id?.toString() ?? booking.user.toString();
  if (ownerId !== userId) throw ApiError.forbidden('Only the booking owner can leave a review');
  if (booking.status !== 'completed') throw ApiError.badRequest('Can only review completed bookings');
  if (booking.review) throw ApiError.badRequest('Booking already has a review');

  booking.review = { rating: input.rating, comment: input.comment, createdAt: new Date() };
  await booking.save();

  const driver = await Driver.findById(booking.driver);
  if (driver) await driver.updateRating(input.rating);

  return booking.review;
};

export const deleteBooking = async (bookingId: string, userId: string, isAdmin: boolean) => {
  const booking = await bookingsRepo.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking');

  const ownerId = (booking.user as { _id: { toString(): string } })._id?.toString() ?? booking.user.toString();
  if (!isAdmin && ownerId !== userId) throw ApiError.forbidden();

  await bookingsRepo.deleteById(bookingId);
};
