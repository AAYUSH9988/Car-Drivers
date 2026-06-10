import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/ApiResponse';
import { uploadToImageKit } from '../../utils/fileUpload';
import { ApiError } from '../../utils/ApiError';
import * as usersService from './users.service';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.getProfile(req.user!.id as string);
  sendSuccess(res, user);
});

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  await usersService.updatePassword(req.user!.id as string, req.body);
  sendSuccess(res, null, 200, { message: 'Password updated successfully' });
});

export const uploadProfilePhoto = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');

  const { url } = await uploadToImageKit(req.file.buffer, req.file.originalname, 'gopilot/profiles');
  const user    = await usersService.updateProfilePhoto(req.user!.id as string, url);
  sendSuccess(res, user, 200, { message: 'Profile photo updated' });
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await usersService.getStats(req.user!.id as string);
  sendSuccess(res, stats);
});
