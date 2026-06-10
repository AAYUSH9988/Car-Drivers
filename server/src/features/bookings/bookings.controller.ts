import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/ApiResponse';
import * as bookingsService from './bookings.service';

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingsService.createBooking(req.user!.id as string, req.body);
  sendCreated(res, booking, 'Booking created successfully');
});

export const getMyBookings = asyncHandler(async (req: Request, res: Response) => {
  const bookings = await bookingsService.getMyBookings(req.user!.id as string);
  sendSuccess(res, bookings);
});

export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  const booking = await bookingsService.getBookingById(req.params['id']!, req.user!.id as string, isAdmin);
  sendSuccess(res, booking);
});

export const updateBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingsService.updateBooking(req.params['id']!, req.user!.id as string, req.body);
  sendSuccess(res, booking, 200, { message: 'Booking updated successfully' });
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  const booking = await bookingsService.cancelBooking(req.params['id']!, req.user!.id as string, isAdmin);
  sendSuccess(res, booking, 200, { message: 'Booking cancelled successfully' });
});

export const addReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await bookingsService.addReview(req.params['id']!, req.user!.id as string, req.body);
  sendCreated(res, review, 'Review submitted successfully');
});

export const deleteBooking = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  await bookingsService.deleteBooking(req.params['id']!, req.user!.id as string, isAdmin);
  sendNoContent(res);
});
