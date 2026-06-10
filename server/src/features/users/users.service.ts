import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Booking from '../../models/Booking.model';
import { ApiError } from '../../utils/ApiError';
import { BCRYPT_ROUNDS } from '../../config/constants';
import * as usersRepo from './users.repository';
import type { UpdatePasswordInput } from './users.validator';

export const getProfile = async (userId: string) => {
  const user = await usersRepo.findById(userId);
  if (!user) throw ApiError.notFound('User');
  return user;
};

export const updatePassword = async (userId: string, input: UpdatePasswordInput): Promise<void> => {
  const user = await usersRepo.findByIdWithPassword(userId);
  if (!user) throw ApiError.notFound('User');

  const valid = await bcrypt.compare(input.currentPassword, user.password);
  if (!valid) throw ApiError.badRequest('Current password is incorrect');

  user.password = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });
};

export const updateProfilePhoto = async (userId: string, url: string) => {
  const user = await usersRepo.updateById(userId, { profilePhoto: url });
  if (!user) throw ApiError.notFound('User');
  return user;
};

export const getStats = async (userId: string) => {
  const uid = new mongoose.Types.ObjectId(userId);
  const [bookings, completed, cancelled, revenueResult] = await Promise.all([
    Booking.countDocuments({ user: uid }),
    Booking.countDocuments({ user: uid, status: 'completed' }),
    Booking.countDocuments({ user: uid, status: 'cancelled' }),
    Booking.aggregate([
      { $match: { user: uid } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ]);
  return {
    totalBookings:     bookings,
    completedBookings: completed,
    cancelledBookings: cancelled,
    totalSpent:        (revenueResult[0] as { total?: number } | undefined)?.total ?? 0,
  };
};
