import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    sparse: true
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required']
  },
  vehicleTypes: [{
    type: String,
    required: [true, 'Vehicle type is required']
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  totalTrips: {
    type: Number,
    default: 0
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: 0
  },
  languages: [{ type: String }],
  certifications: [{ type: String }],
  documents: {
    profilePhoto: { type: String, default: 'default-profile.jpg' },
    vehiclePhoto: { type: String, default: 'default-vehicle.jpg' },
    license: { type: String, required: [true, 'License document is required'] },
    insurance: { type: String }
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  preferredLocations: [{ type: String }],
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' }
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'inactive'],
    default: 'pending'
  },
  earnings: {
    total: { type: Number, default: 0 },
    withdrawn: { type: Number, default: 0 },
    pending: { type: Number, default: 0 }
  },
  bankDetails: {
    accountHolder: { type: String, select: false },
    accountNumber: { type: String, select: false },
    bankName:      { type: String, select: false },
    ifscCode:      { type: String, select: false }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

driverSchema.index({ location: '2dsphere' });
driverSchema.index({ user: 1 });
driverSchema.index({ licenseNumber: 1 });
driverSchema.index({ isAvailable: 1 });
driverSchema.index({ status: 1 });

driverSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'driver'
});

driverSchema.methods.updateRating = async function(newRating) {
  this.rating = (this.rating * this.totalRatings + newRating) / (this.totalRatings + 1);
  this.totalRatings += 1;
  await this.save();
};

// Fixed: use next(err) instead of throw in async pre-save hook
driverSchema.pre('save', function(next) {
  if (this.hourlyRate < 0) {
    return next(new Error('Hourly rate cannot be negative'));
  }
  if (!this.location || !Array.isArray(this.location.coordinates) || this.location.coordinates.length !== 2) {
    return next(new Error('Invalid coordinates'));
  }
  next();
});

const Driver = mongoose.model('Driver', driverSchema);
export default Driver;
