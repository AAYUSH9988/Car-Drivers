import express from 'express';
import {
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
  updateProfile,
  verifyEmail
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validateUserRegistration } from '../middleware/validation.js';

const router = express.Router();

// Public
router.post('/register', authLimiter, validateUserRegistration, register);
router.post('/login', authLimiter, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:token', authLimiter, resetPassword);
router.post('/refresh', refreshToken);

// Protected
router.post('/logout', protect, logout);
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);

export default router;
