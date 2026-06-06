import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import User from '../models/User.js';
import { uploadToImageKit } from '../utils/fileUpload.js';

const isDev = process.env.NODE_ENV === 'development';

// GET /api/drivers
export const getAllDrivers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, isAvailable, vehicleType, minRating, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (vehicleType) filter.vehicleTypes = { $in: [vehicleType] };
    if (minRating) filter.rating = { $gte: parseFloat(minRating) };

    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      filter.user = { $in: users.map(u => u._id) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [drivers, total] = await Promise.all([
      Driver.find(filter)
        .populate('user', 'name email phone')
        .skip(skip)
        .limit(parseInt(limit))
        .sort('-createdAt'),
      Driver.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: drivers,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to get drivers' });
  }
};

// GET /api/drivers/:id
export const getDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.status(200).json({ success: true, data: driver });
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to get driver' });
  }
};

// GET /api/drivers/search
export const searchDrivers = async (req, res) => {
  try {
    const { q, vehicleType, minRating } = req.query;

    const filter = { isAvailable: true, status: 'active' };

    if (q) {
      const users = await User.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ]
      }).select('_id');
      filter.user = { $in: users.map(u => u._id) };
    }

    if (vehicleType && vehicleType !== 'undefined') {
      filter.vehicleTypes = { $in: [vehicleType] };
    }

    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    const drivers = await Driver.find(filter)
      .populate('user', 'name email phone')
      .limit(20)
      .sort('-rating');

    res.status(200).json({ success: true, data: drivers });
  } catch (error) {
    console.error('Search drivers error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to search drivers' });
  }
};

// GET /api/drivers/available
export const getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ isAvailable: true, status: 'active' })
      .populate('user', 'name email phone')
      .sort('-rating');

    res.status(200).json({ success: true, data: drivers });
  } catch (error) {
    console.error('Get available drivers error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to get available drivers' });
  }
};

// GET /api/drivers/nearby
export const getNearbyDrivers = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 4000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const drivers = await Driver.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: parseFloat(maxDistance)
        }
      },
      isAvailable: true,
      status: 'active'
    })
      .populate('user', 'name email phone')
      .limit(10);

    res.status(200).json({ success: true, data: drivers });
  } catch (error) {
    console.error('Get nearby drivers error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to get nearby drivers' });
  }
};

// POST /api/drivers/register
export const registerDriver = async (req, res) => {
  try {
    const { licenseNumber, experience, vehicleTypes, hourlyRate, languages, certifications, preferredLocations, workingHours } = req.body;

    if (!licenseNumber || !experience || !vehicleTypes || !hourlyRate) {
      return res.status(400).json({
        success: false,
        message: 'licenseNumber, experience, vehicleTypes, and hourlyRate are required'
      });
    }

    const existing = await Driver.findOne({ user: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Driver profile already exists for this account' });
    }

    const licenseExists = await Driver.findOne({ licenseNumber: licenseNumber.trim().toUpperCase() });
    if (licenseExists) {
      return res.status(409).json({ success: false, message: 'License number already registered' });
    }

    const documents = { license: 'pending-upload' };
    if (req.files) {
      if (req.files.profilePhoto?.[0]) {
        const { url } = await uploadToImageKit(req.files.profilePhoto[0].buffer, req.files.profilePhoto[0].originalname, 'gopilot/profiles');
        documents.profilePhoto = url;
      }
      if (req.files.vehiclePhoto?.[0]) {
        const { url } = await uploadToImageKit(req.files.vehiclePhoto[0].buffer, req.files.vehiclePhoto[0].originalname, 'gopilot/vehicles');
        documents.vehiclePhoto = url;
      }
    }

    const driver = await Driver.create({
      user: req.user._id,
      licenseNumber: licenseNumber.trim().toUpperCase(),
      experience: parseInt(experience),
      vehicleTypes: Array.isArray(vehicleTypes) ? vehicleTypes : [vehicleTypes],
      hourlyRate: parseFloat(hourlyRate),
      languages: languages || [],
      certifications: certifications || [],
      preferredLocations: preferredLocations || [],
      workingHours: workingHours || { start: '09:00', end: '18:00' },
      documents,
      status: 'pending'
    });

    await User.findByIdAndUpdate(req.user._id, { role: 'driver' });

    const populated = await Driver.findById(driver._id).populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Driver profile created. Pending admin approval.',
      data: populated
    });
  } catch (error) {
    console.error('Register driver error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to register driver' });
  }
};

// PUT /api/drivers/:id
export const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const isOwner = driver.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this driver' });
    }

    const { experience, vehicleTypes, hourlyRate, languages, certifications, preferredLocations, workingHours } = req.body;
    const updates = {};
    if (experience !== undefined) updates.experience = parseInt(experience);
    if (vehicleTypes !== undefined) updates.vehicleTypes = Array.isArray(vehicleTypes) ? vehicleTypes : [vehicleTypes];
    if (hourlyRate !== undefined) updates.hourlyRate = parseFloat(hourlyRate);
    if (languages !== undefined) updates.languages = languages;
    if (certifications !== undefined) updates.certifications = certifications;
    if (preferredLocations !== undefined) updates.preferredLocations = preferredLocations;
    if (workingHours !== undefined) updates.workingHours = workingHours;

    const updated = await Driver.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('user', 'name email phone');

    res.status(200).json({ success: true, message: 'Driver updated successfully', data: updated });
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to update driver' });
  }
};

// DELETE /api/drivers/:id
export const deleteDriver = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can delete drivers' });
    }

    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    await User.findByIdAndUpdate(driver.user, { role: 'user' });

    res.status(200).json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to delete driver' });
  }
};

// PATCH /api/drivers/:id/location
export const updateDriverLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    if (driver.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    driver.location = { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] };
    await driver.save();

    res.status(200).json({ success: true, message: 'Location updated', data: { location: driver.location } });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to update location' });
  }
};

// PATCH /api/drivers/:id/status
export const updateDriverStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can update driver status' });
    }

    const validStatuses = ['pending', 'active', 'suspended', 'inactive'];
    const { status } = req.body;

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const driver = await Driver.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('user', 'name email phone');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.status(200).json({ success: true, message: 'Driver status updated', data: driver });
  } catch (error) {
    console.error('Update driver status error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to update status' });
  }
};

// PATCH /api/drivers/:id/availability
export const toggleDriverAvailability = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    if (driver.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    driver.isAvailable = !driver.isAvailable;
    await driver.save();

    res.status(200).json({
      success: true,
      message: `Driver is now ${driver.isAvailable ? 'available' : 'unavailable'}`,
      data: { isAvailable: driver.isAvailable }
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to toggle availability' });
  }
};

// PUT /api/drivers/:id/vehicle
export const updateDriverVehicle = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    if (driver.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { vehicleTypes } = req.body;
    if (!vehicleTypes || !Array.isArray(vehicleTypes) || vehicleTypes.length === 0) {
      return res.status(400).json({ success: false, message: 'vehicleTypes must be a non-empty array' });
    }

    driver.vehicleTypes = vehicleTypes;
    await driver.save();

    res.status(200).json({ success: true, message: 'Vehicle types updated', data: { vehicleTypes: driver.vehicleTypes } });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to update vehicle' });
  }
};

// GET /api/drivers/:id/bookings
export const getDriverBookings = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    if (driver.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const query = { driver: req.params.id };
    if (req.query.status) query.status = req.query.status;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email phone')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit),
      Booking.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get driver bookings error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to get bookings' });
  }
};

// GET /api/drivers/:id/earnings
export const getDriverEarnings = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    if (driver.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const [summary, monthly] = await Promise.all([
      Booking.aggregate([
        { $match: { driver: driver._id, status: 'completed' } },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$totalAmount' },
            totalTrips: { $sum: 1 },
            averagePerTrip: { $avg: '$totalAmount' }
          }
        }
      ]),
      Booking.aggregate([
        { $match: { driver: driver._id, status: 'completed' } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            earnings: { $sum: '$totalAmount' },
            trips: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: summary[0] || { totalEarnings: 0, totalTrips: 0, averagePerTrip: 0 },
        monthly: monthly.reverse()
      }
    });
  } catch (error) {
    console.error('Get driver earnings error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to get earnings' });
  }
};

// GET /api/drivers/:id/ratings
export const getDriverRatings = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).select('rating totalRatings');
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        averageRating: driver.totalRatings > 0 ? parseFloat(driver.rating.toFixed(2)) : 0,
        totalRatings: driver.totalRatings
      }
    });
  } catch (error) {
    console.error('Get driver ratings error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to get ratings' });
  }
};

// GET /api/drivers/:id/stats  (also used in admin routes)
export const getDriverStats = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('user', 'name email');
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    if (driver.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const [stats, recentBookings] = await Promise.all([
      Booking.aggregate([
        { $match: { driver: driver._id } },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalEarnings: { $sum: '$totalAmount' },
            completedBookings: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            cancelledBookings: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
          }
        }
      ]),
      Booking.find({ driver: req.params.id })
        .populate('user', 'name email')
        .sort('-createdAt')
        .limit(5)
    ]);

    res.status(200).json({
      success: true,
      data: {
        driver,
        stats: stats[0] || { totalBookings: 0, totalEarnings: 0, completedBookings: 0, cancelledBookings: 0 },
        recentBookings
      }
    });
  } catch (error) {
    console.error('Get driver stats error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to get stats' });
  }
};

// POST /api/drivers/:id/documents
export const uploadDriverDocuments = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    if (driver.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No document file provided' });
    }

    const validDocTypes = ['license', 'insurance', 'profilePhoto', 'vehiclePhoto'];
    const { docType } = req.body;
    if (!docType || !validDocTypes.includes(docType)) {
      return res.status(400).json({ success: false, message: `docType must be one of: ${validDocTypes.join(', ')}` });
    }

    const { url } = await uploadToImageKit(
      req.file.buffer,
      req.file.originalname,
      'gopilot/driver-docs'
    );

    driver.documents[docType] = url;
    await driver.save();

    res.status(200).json({ success: true, message: 'Document uploaded', data: { documents: driver.documents } });
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to upload document' });
  }
};

// PATCH /api/drivers/:id/documents/verify
export const verifyDriverDocuments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can verify documents' });
    }

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    ).populate('user', 'name email phone');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.status(200).json({ success: true, message: 'Documents verified. Driver is now active.', data: driver });
  } catch (error) {
    console.error('Verify documents error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Verification failed' });
  }
};

// GET /api/drivers/:id/availability?startTime=...&endTime=...
export const getDriverAvailability = async (req, res) => {
  try {
    const { startTime, endTime } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'startTime and endTime are required' });
    }

    const start = new Date(startTime);
    const end   = new Date(endTime);

    if (isNaN(start) || isNaN(end) || start >= end) {
      return res.status(400).json({ success: false, message: 'Invalid time range' });
    }

    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    if (driver.status !== 'active') {
      return res.status(200).json({ success: true, data: { available: false, reason: 'Driver is not active' } });
    }

    const conflict = await Booking.findOne({
      driver:    req.params.id,
      status:    { $in: ['pending', 'confirmed', 'in-progress'] },
      startTime: { $lt: end },
      endTime:   { $gt: start }
    });

    res.status(200).json({
      success: true,
      data: {
        available: !conflict,
        reason:    conflict ? 'Driver has a conflicting booking' : null,
        driver: {
          _id:         driver._id,
          isAvailable: driver.isAvailable,
          hourlyRate:  driver.hourlyRate,
          workingHours: driver.workingHours
        }
      }
    });
  } catch (error) {
    console.error('Driver availability error:', error);
    res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to check availability' });
  }
};
