import mongoose, { Document, Model, Types } from 'mongoose';
import type { DriverStatus } from '../config/constants';

export interface IDriver {
  user: Types.ObjectId;
  licenseNumber: string;
  experience: number;
  vehicleTypes: string[];
  isAvailable: boolean;
  rating: number;
  totalRatings: number;
  totalTrips: number;
  hourlyRate: number;
  bio: string;
  specialties: string[];
  languages: string[];
  certifications: string[];
  workingDays: string[];
  documents: {
    profilePhoto: string;
    vehiclePhoto: string;
    license: string;
    insurance?: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  preferredLocations: string[];
  workingHours: { start: string; end: string };
  status: DriverStatus;
  earnings: { total: number; withdrawn: number; pending: number };
  bankDetails?: {
    accountHolder?: string;
    accountNumber?: string;
    bankName?: string;
    ifscCode?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IDriverDocument extends IDriver, Document {
  updateRating(newRating: number): Promise<void>;
}

const driverSchema = new mongoose.Schema<IDriverDocument>(
  {
    user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    licenseNumber: { type: String, required: true, unique: true },
    experience:    { type: Number, required: true, min: 0 },
    vehicleTypes:  [{ type: String, required: true }],
    isAvailable:   { type: Boolean, default: true },
    rating:        { type: Number, default: 0, min: 0, max: 5 },
    totalRatings:  { type: Number, default: 0 },
    totalTrips:    { type: Number, default: 0 },
    hourlyRate:    { type: Number, required: true, min: 0 },
    bio:           { type: String, default: '' },
    specialties:   [{ type: String }],
    languages:     [{ type: String }],
    certifications:[{ type: String }],
    workingDays:   [{ type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }],
    documents: {
      profilePhoto: { type: String, default: 'default-profile.jpg' },
      vehiclePhoto: { type: String, default: 'default-vehicle.jpg' },
      license:      { type: String, required: true },
      insurance:    { type: String },
    },
    location: {
      type:        { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    preferredLocations: [{ type: String }],
    workingHours: {
      start: { type: String, default: '09:00' },
      end:   { type: String, default: '18:00' },
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'inactive'],
      default: 'pending',
    },
    earnings: {
      total:     { type: Number, default: 0 },
      withdrawn: { type: Number, default: 0 },
      pending:   { type: Number, default: 0 },
    },
    bankDetails: {
      accountHolder: { type: String, select: false },
      accountNumber: { type: String, select: false },
      bankName:      { type: String, select: false },
      ifscCode:      { type: String, select: false },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

driverSchema.index({ location: '2dsphere' });
driverSchema.index({ user: 1 });
driverSchema.index({ licenseNumber: 1 });
driverSchema.index({ isAvailable: 1 });
driverSchema.index({ status: 1 });

driverSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'driver',
});

driverSchema.methods.updateRating = async function (newRating: number): Promise<void> {
  this.rating = (this.rating * this.totalRatings + newRating) / (this.totalRatings + 1);
  this.totalRatings += 1;
  await this.save();
};

const Driver: Model<IDriverDocument> = mongoose.model<IDriverDocument>('Driver', driverSchema);
export default Driver;
