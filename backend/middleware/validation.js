import { validateCoordinates, validateEmail, validatePassword, validatePhoneNumber } from '../utils/helpers.js';

// Validation middleware for user registration
export const validateUserRegistration = (req, res, next) => {
  const { name, email, password, phone } = req.body;
  const errors = [];

  // Required fields validation
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || !validateEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || !validatePassword(password)) {
    errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
  }

  if (!phone || !validatePhoneNumber(phone)) {
    errors.push('Valid phone number is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation middleware for driver registration
export const validateDriverRegistration = (req, res, next) => {
  const { licenseNumber, experience, vehicleTypes, hourlyRate } = req.body;
  const errors = [];

  if (!licenseNumber || licenseNumber.trim().length < 5) {
    errors.push('Valid license number is required (min 5 characters)');
  }
  if (experience === undefined || experience === null || isNaN(Number(experience)) || Number(experience) < 0) {
    errors.push('experience must be a non-negative number (years)');
  }
  if (!vehicleTypes) {
    errors.push('vehicleTypes is required');
  }
  if (hourlyRate === undefined || hourlyRate === null || isNaN(Number(hourlyRate)) || Number(hourlyRate) <= 0) {
    errors.push('hourlyRate must be a positive number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  next();
};

// Validation middleware for booking creation — matches bookingController field names
export const validateBookingCreation = (req, res, next) => {
  const { driverId, startTime, endTime, pickupLocation, totalAmount } = req.body;
  const errors = [];

  if (!driverId) errors.push('driverId is required');
  if (!pickupLocation || typeof pickupLocation !== 'string' || pickupLocation.trim().length < 3) {
    errors.push('pickupLocation must be a non-empty string');
  }
  if (!startTime) {
    errors.push('startTime is required');
  } else if (isNaN(new Date(startTime).getTime())) {
    errors.push('startTime must be a valid date');
  } else if (new Date(startTime) <= new Date()) {
    errors.push('startTime must be in the future');
  }
  if (!endTime) {
    errors.push('endTime is required');
  } else if (isNaN(new Date(endTime).getTime())) {
    errors.push('endTime must be a valid date');
  }
  if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
    errors.push('endTime must be after startTime');
  }
  if (totalAmount !== undefined && (isNaN(Number(totalAmount)) || Number(totalAmount) < 0)) {
    errors.push('totalAmount must be a non-negative number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  next();
};
