// filepath: d:\VS CODE\Car Driver\frontend\src\services\driverService.js
import pilot1Photo from '../assets/images/pilots/pilot1.jpg';
import pilot2Photo from '../assets/images/pilots/pilot2.jpg';
import pilot3Photo from '../assets/images/pilots/pilot3.jpg';
import pilot4Photo from '../assets/images/pilots/pilot4.jpg';
import pilot5Photo from '../assets/images/pilots/pilot5.jpg';
import api from './api.js';

// ✅ Mock data for fallback
const mockDrivers = [
  {
    _id: 'mock-1',
    name: 'John Mitchell',
    rating: 4.9,
    experience: 8,
    profilePhoto: pilot1Photo,
    hourlyRate: 45,
    isAvailable: true,
    vehicleTypes: ['Sedan', 'Luxury'],
    languages: ['English', 'Spanish'],
    documents: { profilePhoto: pilot1Photo },
    certifications: ['Advanced Driving', 'Defensive Driving'],
    locations: ['New York', 'New Jersey'],
    contactInfo: {
      phone: '+1 (555) 123-4567',
      email: 'john@example.com'
    }
  },
  {
    _id: 'mock-2',
    name: 'Sarah Johnson',
    rating: 4.8,
    experience: 6,
    profilePhoto: pilot2Photo,
    hourlyRate: 40,
    isAvailable: true,
    vehicleTypes: ['Sedan', 'SUV'],
    languages: ['English', 'French'],
    documents: { profilePhoto: pilot2Photo },
    certifications: ['Advanced Driving'],
    locations: ['Los Angeles', 'Orange County'],
    contactInfo: {
      phone: '+1 (555) 234-5678',
      email: 'sarah@example.com'
    }
  },
  {
    _id: 'mock-3',
    name: 'Michael Chen',
    rating: 4.7,
    experience: 10,
    profilePhoto: pilot3Photo,
    hourlyRate: 50,
    isAvailable: true,
    vehicleTypes: ['Luxury', 'SUV', 'Van'],
    languages: ['English', 'Mandarin', 'Spanish'],
    documents: { profilePhoto: pilot3Photo },
    certifications: ['Advanced Driving', 'Defensive Driving', 'Executive Driver'],
    locations: ['Chicago', 'Suburbs'],
    contactInfo: {
      phone: '+1 (555) 345-6789',
      email: 'michael@example.com'
    }
  },
  {
    _id: 'mock-4',
    name: 'Emma Wilson',
    rating: 4.6,
    experience: 5,
    profilePhoto: pilot4Photo,
    hourlyRate: 35,
    isAvailable: true,
    vehicleTypes: ['Sedan', 'Compact'],
    languages: ['English', 'Italian'],
    documents: { profilePhoto: pilot4Photo },
    certifications: ['Advanced Driving'],
    locations: ['Boston', 'Cambridge'],
    contactInfo: {
      phone: '+1 (555) 456-7890',
      email: 'emma@example.com'
    }
  },
  {
    _id: 'mock-5',
    name: 'David Rodriguez',
    rating: 4.5,
    experience: 7,
    profilePhoto: pilot5Photo,
    hourlyRate: 42,
    isAvailable: true,
    vehicleTypes: ['Sedan', 'SUV'],
    languages: ['English', 'Spanish', 'Portuguese'],
    documents: { profilePhoto: pilot5Photo },
    certifications: ['Advanced Driving'],
    locations: ['Miami', 'Fort Lauderdale'],
    contactInfo: {
      phone: '+1 (555) 567-8901',
      email: 'david@example.com'
    }
  }
];

const mockPhotos = [pilot1Photo, pilot2Photo, pilot3Photo, pilot4Photo, pilot5Photo];

const getRandomPhoto = () => mockPhotos[Math.floor(Math.random() * mockPhotos.length)];

const driverService = {
  // ✅ GET AVAILABLE DRIVERS
  getAvailableDrivers: async () => {
    try {
      const response = await api.get('/drivers/available');

      if (!response.data?.data) {
        return mockDrivers.filter(d => d.isAvailable);
      }

      return response.data.data.map(driver => ({
        ...driver,
        profilePhoto: driver.documents?.profilePhoto || driver.profilePhoto || getRandomPhoto(),
        name: driver.user?.name || driver.name || 'Unknown Driver'
      }));
    } catch {
      return mockDrivers.filter(d => d.isAvailable);
    }
  },

  // ✅ GET ALL DRIVERS
  getAllDrivers: async (filters = {}) => {
    try {
      const response = await api.get('/drivers', { params: filters });

      if (!response.data?.data) {
        return mockDrivers;
      }

      const drivers = response.data.data.map(driver => ({
        ...driver,
        profilePhoto: driver.documents?.profilePhoto || driver.profilePhoto || getRandomPhoto(),
        name: driver.user?.name || driver.name || 'Unknown Driver'
      }));

      return drivers;
    } catch (error) {
      return mockDrivers;
    }
  },

  // ✅ GET DRIVER BY ID
  getDriverById: async (id) => {
    try {
      if (!id) throw new Error('Driver ID is required');

      const mockDriver = mockDrivers.find(d => d._id === id);
      if (mockDriver) return mockDriver;

      const response = await api.get(`/drivers/${id}`);

      if (!response.data?.data) {
        throw new Error('Driver data not found');
      }

      const driver = response.data.data;
      return {
        ...driver,
        profilePhoto: driver.documents?.profilePhoto || driver.profilePhoto || getRandomPhoto(),
        name: driver.user?.name || driver.name || 'Unknown Driver'
      };
    } catch {
      return {
        _id: id,
        name: 'John Mitchell',
        rating: 4.9,
        experience: 8,
        profilePhoto: getRandomPhoto(),
        hourlyRate: 45,
        isAvailable: true,
        vehicleTypes: ['Sedan'],
      };
    }
  },

  // ✅ SEARCH DRIVERS
  searchDrivers: async (params = {}) => {
    try {
      const response = await api.get('/drivers/search', { params });

      const drivers = response.data?.data || [];
      return drivers.length > 0 ? drivers : mockDrivers;
    } catch (error) {
      return mockDrivers;
    }
  },

  // ✅ CREATE BOOKING
  createBooking: async (bookingData) => {
    try {
      if (!bookingData?.driverId) {
        throw new Error('Driver ID is required');
      }

      // Check authentication
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login first.');
      }

      const formattedBooking = {
        driverId: bookingData.driverId,
        startTime: new Date(bookingData.startTime).toISOString(),
        endTime: new Date(bookingData.endTime).toISOString(),
        pickupLocation: bookingData.pickupLocation,
        dropLocation: bookingData.dropLocation || bookingData.pickupLocation,
        totalAmount: parseFloat(bookingData.totalAmount) || 0,
        paymentMethod: 'COD' // Cash on Delivery
      };

      const response = await api.post('/bookings', formattedBooking);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Booking failed');
      }

      return response.data;
    } catch (error) {

      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please login again.');
      }

      const errorMessage = error.response?.data?.message || error.message || 'Failed to create booking';
      throw new Error(errorMessage);
    }
  },
};

export default driverService;