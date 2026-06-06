import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../utils/email.js';
import generateToken from '../utils/generateToken.js';

const BCRYPT_ROUNDS = 12;
const isDev = process.env.NODE_ENV === 'development';

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and phone'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Email verification token
    const verificationToken   = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await User.create({
      name:  name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
      role: 'user',
      emailVerificationToken:   verificationToken,
      emailVerificationExpires: verificationExpires
    });

    // Send verification email (non-blocking — don't fail registration if email fails)
    sendVerificationEmail(user, verificationToken).catch(err =>
      console.error('Verification email failed:', err.message)
    );

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      token,
      data: {
        _id:             user._id,
        name:            user.name,
        email:           user.email,
        phone:           user.phone,
        role:            user.role,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    return res.status(500).json({
      success: false,
      message: isDev ? error.message : 'Registration failed'
    });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password +refreshToken');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token        = generateToken(user._id);
    const newRefresh   = generateRefreshToken(user._id);

    // Persist refresh token hash
    user.refreshToken = newRefresh;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      refreshToken: newRefresh,
      data: {
        _id:             user._id,
        name:            user.name,
        email:           user.email,
        phone:           user.phone,
        role:            user.role,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: isDev ? error.message : 'Login failed'
    });
  }
};

// POST /api/auth/refresh
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh');
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(payload.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Refresh token revoked' });
    }

    const newAccessToken  = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ success: false, message: isDev ? error.message : 'Token refresh failed' });
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    // Revoke refresh token
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
    res.clearCookie('token');
    return res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, message: isDev ? error.message : 'Logout failed' });
  }
};

// GET /api/auth/me
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id:             user._id,
        name:            user.name,
        email:           user.email,
        phone:           user.phone,
        role:            user.role,
        isEmailVerified: user.isEmailVerified,
        profilePhoto:    user.profilePhoto,
        createdAt:       user.createdAt
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ success: false, message: isDev ? error.message : 'Error fetching user profile' });
  }
};

// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = {};
    if (name)  updates.name  = name.trim();
    if (phone) updates.phone = phone.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
        role:  user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: isDev ? error.message : 'Error updating profile' });
  }
};

// GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken:   req.params.token,
      emailVerificationExpires: { $gt: Date.now() }
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });
    }

    user.isEmailVerified           = true;
    user.emailVerificationToken    = undefined;
    user.emailVerificationExpires  = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).json({ success: false, message: isDev ? error.message : 'Email verification failed' });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return 200 — never confirm whether an email exists (prevents user enumeration)
    if (!user) {
      return res.status(200).json({ success: true, message: 'If that email is registered, a reset link has been sent' });
    }

    const resetToken   = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await User.findByIdAndUpdate(user._id, {
      passwordResetToken:   resetToken,
      passwordResetExpires: resetExpires
    });

    sendPasswordResetEmail(user, resetToken).catch(err =>
      console.error('Password reset email failed:', err.message)
    );

    return res.status(200).json({ success: true, message: 'If that email is registered, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: isDev ? error.message : 'Password reset request failed' });
  }
};

// PUT /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      passwordResetToken:   req.params.token,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password             = await bcrypt.hash(password, BCRYPT_ROUNDS);
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken         = undefined; // revoke all sessions
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: isDev ? error.message : 'Password reset failed' });
  }
};

// Internal helper — not exported as route handler
const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
    { expiresIn: '30d' }
  );
};
