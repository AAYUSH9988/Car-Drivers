export const ROLES = {
  USER:   'user',
  DRIVER: 'driver',
  ADMIN:  'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const BOOKING_STATUS = {
  PENDING:     'pending',
  CONFIRMED:   'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED:   'completed',
  CANCELLED:   'cancelled',
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const PAYMENT_STATUS = {
  PENDING:   'pending',
  COMPLETED: 'completed',
  REFUNDED:  'refunded',
  FAILED:    'failed',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_METHOD = {
  COD:      'COD',
  RAZORPAY: 'Razorpay',
  WALLET:   'Wallet',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const DRIVER_STATUS = {
  PENDING:   'pending',
  ACTIVE:    'active',
  SUSPENDED: 'suspended',
  INACTIVE:  'inactive',
} as const;

export type DriverStatus = (typeof DRIVER_STATUS)[keyof typeof DRIVER_STATUS];

export const BCRYPT_ROUNDS = 12;
export const MAX_BULK_RECORDS = 100;
