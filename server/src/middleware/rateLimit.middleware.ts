import rateLimit from 'express-rate-limit';

const limitOptions = (max: number, windowMinutes: number, message: string) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    message:  { success: false, message },
    standardHeaders: true,
    legacyHeaders:   false,
  });

export const apiLimiter = limitOptions(
  100, 15,
  'Too many requests from this IP. Please try again after 15 minutes.',
);

export const authLimiter = limitOptions(
  10, 15,
  'Too many authentication attempts. Please try again after 15 minutes.',
);
