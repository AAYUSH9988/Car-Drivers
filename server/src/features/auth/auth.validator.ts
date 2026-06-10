import { z } from 'zod';

export const registerSchema = z.object({
  name:        z.string().min(2).max(60).trim(),
  email:       z.string().email().toLowerCase().trim(),
  password:    z.string().min(8, 'Password must be at least 8 characters'),
  phone:       z.string().min(7).max(15).trim(),
  role:        z.enum(['user', 'admin']).optional(),
  adminSecret: z.string().optional(),
});

export const loginSchema = z.object({
  email:    z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateProfileSchema = z.object({
  name:  z.string().min(2).max(60).trim().optional(),
  phone: z.string().min(7).max(15).trim().optional(),
}).refine((d) => d.name || d.phone, { message: 'Provide at least one field to update' });

export type RegisterInput       = z.infer<typeof registerSchema>;
export type LoginInput          = z.infer<typeof loginSchema>;
export type RefreshTokenInput   = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput  = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput  = z.infer<typeof updateProfileSchema>;
