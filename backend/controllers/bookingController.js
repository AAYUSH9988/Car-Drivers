import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';

const isDev = process.env.NODE_ENV === 'development';

// POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const { driverId, startTime, endTime, pickupLocation, dropLocation, totalAmount } = req.body;
    const userId = req.user._id;

    if (!driverId || !startTime || !endTime || !pickupLocation) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: driverId, startTime, endTime, pickupLocation'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ success: false, message: 'Invalid driver ID format' });
    }

    const driver = await Driver.findById(driverId).populate('user', 'name email');
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    if (driver.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Driver is not active' });
    }

    if (!driver.isAvailable) {
      return res.status(400).json({ success: false, message: 'Driver is not available' });
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (startDate >= endDate) {
      return res.status(400).json({ success: false, message: 'endTime must be after startTime' });
    }

    const conflict = await Booking.findOne({
      driver: driverId,
      status: { $in: ['pending', 'confirmed'] },
      startTime: { $lt: endDate },
      endTime: { $gt: startDate }
    });

    if (conflict) {
      return res.status(400).json({ success: false, message: 'Driver is not available for this time slot' });
    }

    driver.isAvailable = false;
    driver.totalTrips = (driver.totalTrips || 0) + 1;
    await driver.save();

    const booking = await Booking.create({
      user: userId,
      driver: driverId,
      startTime: startDate,
      endTime: endDate,
      pickupLocation,
      dropLocation: dropLocation || pickupLocation,
      totalAmount: parseFloat(totalAmount) || 0,
      status: 'pending',
      paymentMethod: 'COD',
      paymentStatus: 'pending'
    });

    const populated = await Booking.findById(booking._id)
      .populate('user', 'name email phone')
      .populate({ path: 'driver', populate: { path: 'user', select: 'name email phone' } });

    res.status(201).json({ success: true, message: 'Booking created successfully', data: populated });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to create booking' });
  }
};

// GET /api/bookings
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('user', 'name email phone')
      .populate({ path: 'driver', populate: { path: 'user', select: 'name email phone' } })
      .sort('-createdAt');

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to get bookings' });
  }
};

// GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate({ path: 'driver', populate: { path: 'user', select: 'name email phone' } });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to get booking' });
  }
};

// PUT /api/bookings/:id
export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending bookings can be updated' });
    }

    // Whitelist editable fields
    const { pickupLocation, dropLocation, startTime, endTime } = req.body;

    // If rescheduling, check for driver conflicts
    if ((startTime || endTime) && booking.driver) {
      const newStart = new Date(startTime || booking.startTime);
      const newEnd = new Date(endTime || booking.endTime);

      if (newStart >= newEnd) {
        return res.status(400).json({ success: false, message: 'endTime must be after startTime' });
      }

      const conflict = await Booking.findOne({
        _id: { $ne: booking._id },
        driver: booking.driver,
        status: { $in: ['pending', 'confirmed'] },
        startTime: { $lt: newEnd },
        endTime: { $gt: newStart }
      });

      if (conflict) {
        return res.status(400).json({ success: false, message: 'Driver is not available for this time slot' });
      }
    }

    const updates = {};
    if (pickupLocation) updates.pickupLocation = pickupLocation;
    if (dropLocation) updates.dropLocation = dropLocation;
    if (startTime) updates.startTime = new Date(startTime);
    if (endTime) updates.endTime = new Date(endTime);

    const updated = await Booking.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate({ path: 'driver', populate: { path: 'user', select: 'name email phone' } });

    res.status(200).json({ success: true, message: 'Booking updated successfully', data: updated });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to update booking' });
  }
};

// PATCH /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Only pending or confirmed bookings can be cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Release driver availability only if no other active bookings remain
    if (booking.driver) {
      const driver = await Driver.findById(booking.driver);
      if (driver) {
        const activeBookings = await Booking.countDocuments({
          driver: booking.driver,
          _id: { $ne: booking._id },
          status: { $in: ['pending', 'confirmed', 'in-progress'] }
        });
        if (activeBookings === 0) {
          driver.isAvailable = true;
          await driver.save();
        }
      }
    }

    res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to cancel booking' });
  }
};

// POST /api/bookings/:id/review
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the booking owner can leave a review' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }

    if (booking.review) {
      return res.status(400).json({ success: false, message: 'Booking already has a review' });
    }

    booking.review = { rating: Number(rating), comment: comment?.trim() };
    await booking.save();

    // Update driver's aggregate rating
    const driver = await Driver.findById(booking.driver);
    if (driver) {
      await driver.updateRating(Number(rating));
    }

    res.status(201).json({ success: true, message: 'Review submitted successfully', data: booking.review });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to submit review' });
  }
};

// DELETE /api/bookings/:id
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Owner or admin can delete
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this booking' });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to delete booking' });
  }
};
