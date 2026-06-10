import bcrypt from 'bcryptjs';
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
