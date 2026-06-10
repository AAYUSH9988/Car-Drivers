import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { protect } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rateLimit.middleware';
import * as authController from './auth.controller';
import {
  registerSchema, loginSchema, refreshTokenSchema,
  forgotPasswordSchema, resetPasswordSchema, updateProfileSchema,
} from './auth.validator';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login',    authLimiter, validate(loginSchema),    authController.login);
router.post('/refresh',               validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout',  protect,                                authController.logout);
router.get( '/me',      protect,                                authController.getMe);
router.put( '/profile', protect, validate(updateProfileSchema), authController.updateProfile);

router.get( '/verify-email/:token',        authController.verifyEmail);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.put( '/reset-password/:token',      validate(resetPasswordSchema),   authController.resetPassword);

export default router;
