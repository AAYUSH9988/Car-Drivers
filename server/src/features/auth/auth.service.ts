import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../../models/User.model';
import { ApiError } from '../../utils/ApiError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/token';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../utils/email';
import { env } from '../../config/env';
import { BCRYPT_ROUNDS } from '../../config/constants';
import type {
  RegisterInput, LoginInput, RefreshTokenInput,
  ForgotPasswordInput, ResetPasswordInput, UpdateProfileInput,
} from './auth.validator';

const PUBLIC_USER_FIELDS = '_id name email phone role isEmailVerified profilePhoto createdAt';

export const register = async (input: RegisterInput) => {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw ApiError.conflict('Email already registered');

  let role: 'user' | 'admin' = 'user';
  if (input.role === 'admin' && input.adminSecret === env.ADMIN_SECRET) {
    role = 'admin';
  }

  const hashedPassword       = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const verificationToken    = crypto.randomBytes(32).toString('hex');
  const verificationExpires  = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await User.create({
    name:     input.name,
    email:    input.email,
    password: hashedPassword,
    phone:    input.phone,
    role,
    emailVerificationToken:   verificationToken,
    emailVerificationExpires: verificationExpires,
  });

  sendVerificationEmail({ name: user.name, email: user.email }, verificationToken).catch(console.error);

  const token = generateAccessToken(user.id as string);
  return {
    token,
    data: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, isEmailVerified: user.isEmailVerified },
  };
};

export const login = async (input: LoginInput) => {
  const user = await User.findOne({ email: input.email }).select('+password +refreshToken');
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  const accessToken  = generateAccessToken(user.id as string);
  const refreshToken = generateRefreshToken(user.id as string);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    token: accessToken,
    refreshToken,
    data: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, isEmailVerified: user.isEmailVerified },
  };
};

export const refreshTokens = async (input: RefreshTokenInput) => {
  let payload: { id: string };
  try {
    payload = verifyRefreshToken(input.refreshToken) as { id: string };
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(payload.id).select('+refreshToken');
  if (!user || user.refreshToken !== input.refreshToken) {
    throw ApiError.unauthorized('Refresh token revoked');
  }

  const newAccess  = generateAccessToken(user.id as string);
  const newRefresh = generateRefreshToken(user.id as string);

  user.refreshToken = newRefresh;
  await user.save({ validateBeforeSave: false });

  return { token: newAccess, refreshToken: newRefresh };
};

export const logout = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

export const getMe = async (userId: string) => {
  const user = await User.findById(userId).select(PUBLIC_USER_FIELDS);
  if (!user) throw ApiError.notFound('User');
  return user;
};

export const updateProfile = async (userId: string, input: UpdateProfileInput) => {
  const user = await User.findByIdAndUpdate(userId, input, { new: true, runValidators: true })
    .select(PUBLIC_USER_FIELDS);
  if (!user) throw ApiError.notFound('User');
  return user;
};

export const verifyEmail = async (token: string): Promise<void> => {
  const user = await User.findOne({
    emailVerificationToken:   token,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) throw ApiError.badRequest('Invalid or expired verification link');

  user.isEmailVerified          = true;
  user.emailVerificationToken   = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });
};

export const forgotPassword = async (input: ForgotPasswordInput): Promise<void> => {
  const user = await User.findOne({ email: input.email });
  if (!user) return; // silent — never reveal if email exists

  const resetToken   = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

  await User.findByIdAndUpdate(user._id, {
    passwordResetToken:   resetToken,
    passwordResetExpires: resetExpires,
  });

  sendPasswordResetEmail({ name: user.name, email: user.email }, resetToken).catch(console.error);
};

export const resetPassword = async (token: string, input: ResetPasswordInput): Promise<void> => {
  const user = await User.findOne({
    passwordResetToken:   token,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) throw ApiError.badRequest('Invalid or expired reset token');

  user.password           = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  user.passwordResetToken   = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken         = undefined;
  await user.save({ validateBeforeSave: false });
};
