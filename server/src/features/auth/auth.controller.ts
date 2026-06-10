import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../../utils/ApiResponse';
import * as authService from './auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  sendCreated(res, result.data, 'Registration successful! Please check your email to verify your account.');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  sendSuccess(res, result.data, 200, {
    message:      'Login successful',
    token:        result.token,
    refreshToken: result.refreshToken,
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.refreshTokens(req.body);
  sendSuccess(res, null, 200, result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user!.id as string);
  sendSuccess(res, null, 200, { message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.id as string);
  sendSuccess(res, user);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.updateProfile(req.user!.id as string, req.body);
  sendSuccess(res, user, 200, { message: 'Profile updated successfully' });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.params['token']!);
  sendSuccess(res, null, 200, { message: 'Email verified successfully' });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body);
  sendSuccess(res, null, 200, { message: 'If that email is registered, a reset link has been sent' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.params['token']!, req.body);
  sendSuccess(res, null, 200, { message: 'Password reset successfully. Please log in.' });
});
