import mongoose, { Document, Model, Types } from 'mongoose';

export interface ISettings {
  key: string;
  bookingFeePercent: number;
  maxBookingDays: number;
  minHourlyRate: number;
  maxHourlyRate: number;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  updatedBy?: Types.ObjectId;
}

export interface ISettingsDocument extends ISettings, Document {}

const settingsSchema = new mongoose.Schema<ISettingsDocument>(
  {
    key:                  { type: String, required: true, unique: true, default: 'global' },
    bookingFeePercent:    { type: Number, default: 10, min: 0, max: 100 },
    maxBookingDays:       { type: Number, default: 30, min: 1 },
    minHourlyRate:        { type: Number, default: 100, min: 0 },
    maxHourlyRate:        { type: Number, default: 5000, min: 0 },
    maintenanceMode:      { type: Boolean, default: false },
    allowNewRegistrations:{ type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

const Settings: Model<ISettingsDocument> = mongoose.model<ISettingsDocument>('Settings', settingsSchema);
export default Settings;
