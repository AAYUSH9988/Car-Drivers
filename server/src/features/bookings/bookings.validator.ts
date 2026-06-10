import { z } from 'zod';

export const createBookingSchema = z.object({
  driverId:       z.string().min(1, 'driverId is required'),
  startTime:      z.string().datetime({ message: 'startTime must be a valid ISO datetime' }),
  endTime:        z.string().datetime({ message: 'endTime must be a valid ISO datetime' }),
  pickupLocation: z.string().min(1, 'pickupLocation is required').trim(),
  dropLocation:   z.string().min(1, 'dropLocation is required').trim(),
  totalAmount:    z.coerce.number().min(0).optional(),
  notes:          z.string().max(500).optional(),
}).refine((d) => new Date(d.endTime) > new Date(d.startTime), {
  message: 'endTime must be after startTime',
  path:    ['endTime'],
});

export const updateBookingSchema = z.object({
  pickupLocation: z.string().min(1).trim().optional(),
  dropLocation:   z.string().min(1).trim().optional(),
  startTime:      z.string().datetime().optional(),
  endTime:        z.string().datetime().optional(),
}).refine(
  (d) => !d.startTime || !d.endTime || new Date(d.endTime) > new Date(d.startTime),
  { message: 'endTime must be after startTime', path: ['endTime'] },
);

export const reviewSchema = z.object({
  rating:  z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type ReviewInput        = z.infer<typeof reviewSchema>;
