import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
    unique: true,
    sparse: true
  },
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  startTime:      { type: Date,   required: true },
  endTime:        { type: Date,   required: true },
  pickupLocation: { type: String, required: true },
  dropLocation:   { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  platformFee:   { type: Number, default: 0 },
  driverEarning: { type: Number, default: 0 },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Razorpay', 'Wallet'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded', 'failed'],
    default: 'pending'
  },
  // Razorpay payment tracking
  razorpayOrderId:   { type: String, select: false },
  razorpayPaymentId: { type: String, select: false },
  razorpaySignature: { type: String, select: false },
  // Post-trip review
  review: reviewSchema,
  notes: { type: String, maxlength: 500 }
}, { timestamps: true });

// Auto-generate booking reference before first save
bookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    const ts   = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.bookingReference = `BK-${ts}-${rand}`;
  }
  next();
});

// Single-field indexes
bookingSchema.index({ user: 1 });
bookingSchema.index({ driver: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

// Compound indexes for common query patterns
bookingSchema.index({ user: 1,   status: 1 });
bookingSchema.index({ driver: 1, status: 1 });
bookingSchema.index({ driver: 1, startTime: 1 }); // time-slot conflict check
bookingSchema.index({ status: 1, createdAt: -1 }); // admin dashboard

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
