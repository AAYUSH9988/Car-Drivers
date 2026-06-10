import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';

import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { errorMiddleware } from './middleware/error.middleware';

import authRoutes     from './features/auth/auth.routes';
import usersRoutes    from './features/users/users.routes';
import driversRoutes  from './features/drivers/drivers.routes';
import bookingsRoutes from './features/bookings/bookings.routes';
import paymentsRoutes from './features/payments/payments.routes';
import adminRoutes    from './features/admin/admin.routes';

const app = express();

// HTTPS redirect in production (Render sets x-forwarded-proto)
if (env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

app.use(helmet());
app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(cors({
  origin: [env.FRONTEND_URL, env.ADMIN_URL],
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge:         86400,
}));

app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(cookieParser());
app.use(mongoSanitize());

// Health check — used by Render and Docker HEALTHCHECK
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', apiLimiter);

app.use('/api/auth',     authRoutes);
app.use('/api/users',    usersRoutes);
app.use('/api/drivers',  driversRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin',    adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

app.use(errorMiddleware);

export default app;
