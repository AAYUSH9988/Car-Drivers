import mongoose, { Document, Model } from 'mongoose';
import type { Role } from '../config/constants';

export interface IUser {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  isEmailVerified: boolean;
  profilePhoto: string | null;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    phone:    { type: String, required: true, trim: true },
    role:     { type: String, enum: ['user', 'driver', 'admin'], default: 'user' },
    isEmailVerified: { type: Boolean, default: false },
    profilePhoto:    { type: String, default: null },
    emailVerificationToken:   { type: String, select: false },
    emailVerificationExpires: { type: Date,   select: false },
    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: { type: Date,   select: false },
    refreshToken:         { type: String, select: false },
  },
  { timestamps: true, strict: true },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);
export default User;
