import { z } from 'zod';

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8, 'New password must be at least 8 characters'),
});

export const updatePhotoSchema = z.object({
  profilePhoto: z.string().url('Must be a valid URL'),
});

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
