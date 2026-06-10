import { z } from 'zod';

export const registerDriverSchema = z.object({
  licenseNumber:      z.string().min(1, 'License number is required').trim(),
  experience:         z.coerce.number().min(0),
  vehicleTypes:       z.array(z.string().min(1)).min(1, 'At least one vehicle type required'),
  hourlyRate:         z.coerce.number().min(0, 'Hourly rate cannot be negative'),
  languages:          z.array(z.string()).optional().default([]),
  certifications:     z.array(z.string()).optional().default([]),
  preferredLocations: z.array(z.string()).optional().default([]),
  workingHours: z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    end:   z.string().regex(/^\d{2}:\d{2}$/).optional(),
  }).optional(),
});

export const updateDriverSchema = registerDriverSchema.partial();

export const driversQuerySchema = z.object({
  page:         z.coerce.number().min(1).default(1),
  limit:        z.coerce.number().min(1).max(50).default(12),
  vehicleType:  z.string().optional(),
  minRate:      z.coerce.number().optional(),
  maxRate:      z.coerce.number().optional(),
  language:     z.string().optional(),
  isAvailable:  z.enum(['true', 'false']).optional(),
  search:       z.string().optional(),
});

export type RegisterDriverInput = z.infer<typeof registerDriverSchema>;
export type UpdateDriverInput   = z.infer<typeof updateDriverSchema>;
export type DriversQuery        = z.infer<typeof driversQuerySchema>;
