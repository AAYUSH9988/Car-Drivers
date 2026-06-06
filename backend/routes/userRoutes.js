import express from 'express';
import {
    deleteUser,
    getAllUsers,
    getProfile,
    getUser,
    getUserBookings,
    getUserStats,
    searchUsers,
    updatePassword,
    updateProfile,
    updateProfilePhoto,
    updateUser
} from '../controllers/userController.js';
import { authorize, protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import upload from '../utils/fileUpload.js';

const router = express.Router();

// Protected routes - profile (must be BEFORE /:id to avoid route masking)
router.get('/profile/me', protect, getProfile);
router.put('/profile/me', protect, updateProfile);

// Admin-only routes - list/search users
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/search', protect, authorize('admin'), searchUsers);

// Protected routes - user management
router.get('/:id', protect, getUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.put('/:id/password', protect, authLimiter, updatePassword);
router.put('/:id/photo', protect, upload.single('profilePhoto'), updateProfilePhoto);

// Protected routes - user data
router.get('/:id/bookings', protect, getUserBookings);
router.get('/:id/stats', protect, getUserStats);

export default router;