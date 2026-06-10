import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV:    z.enum(['development', 'production', 'test']).default('development'),
  PORT:        z.coerce.number().default(4000),
  MONGO_URI:   z.string().min(1, 'MONGO_URI is required'),

  JWT_SECRET:         z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRE:         z.string().default('7d'),
  JWT_REFRESH_EXPIRE: z.string().default('30d'),

  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  ADMIN_URL:    z.string().url().default('http://localhost:5174'),

  IMAGEKIT_PUBLIC_KEY:   z.string().optional(),
  IMAGEKIT_PRIVATE_KEY:  z.string().optional(),
  IMAGEKIT_URL_ENDPOINT: z.string().optional(),

  BREVO_API_KEY:    z.string().optional(),
  BREVO_FROM_EMAIL: z.string().email().default('noreply@gopilot.app'),

  RAZORPAY_KEY_ID:     z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),

  ADMIN_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  parsed.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
