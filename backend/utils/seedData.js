import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';

import User from '../models/User.js';
import Driver from '../models/Driver.js';

dotenv.config({ path: './.env' });

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI not found. Make sure .env file exists in backend/');
  process.exit(1);
}

// Simple password hasher using crypto (bcryptjs may not be installed)
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
};

const seedData = async () => {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // ----------------------------
    // Clean existing seed data
    // ----------------------------
    console.log('🗑️  Cleaning test data...');
    const allEmails = [
      'demo.user@example.com',
      'raul.verma@example.com',
      'sohail.khan@example.com',
      'priya.nair@example.com',
      'arjun.patel@example.com',
      'vikram.singh@example.com',
      'john.doe@example.com',
      'admin@example.com'
    ];

    await User.deleteMany({ email: { $in: allEmails } });
    await Driver.deleteMany({});
    console.log('✅ Test data cleaned');

    // ----------------------------
    // Create Users
    // ----------------------------
    const password = 'Password123';

    const users = await User.create([
      {
        name: 'Demo User',
        email: 'demo.user@example.com',
        password,
        phone: '+91 98765 43210',
        role: 'user',
        isEmailVerified: true,
      },
      {
        name: 'Raul Verma',
        email: 'raul.verma@example.com',
        password,
        phone: '+91 87654 32109',
        role: 'user',
        isEmailVerified: true,
      },
      {
        name: 'Sohail Khan',
        email: 'sohail.khan@example.com',
        password,
        phone: '+91 76543 21098',
        role: 'user',
        isEmailVerified: true,
      },
      {
        name: 'Priya Nair',
        email: 'priya.nair@example.com',
        password,
        phone: '+91 65432 10987',
        role: 'user',
        isEmailVerified: true,
      },
    ]);
    console.log(`✅ Created ${users.length} users`);

    // ----------------------------
    // Create Driver Users
    // ----------------------------
    const driverUsers = await User.create([
      {
        name: 'Arjun Patel',
        email: 'arjun.patel@example.com',
        password,
        phone: '+91 91234 56789',
        role: 'driver',
        isEmailVerified: true,
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@example.com',
        password,
        phone: '+91 92345 67890',
        role: 'driver',
        isEmailVerified: true,
        profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      },
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password,
        phone: '+91 93456 78901',
        role: 'driver',
        isEmailVerified: true,
        profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password,
        phone: '+91 99999 88888',
        role: 'admin',
        isEmailVerified: true,
      },
    ]);
    console.log(`✅ Created ${driverUsers.length} driver/admin users`);

    // ----------------------------
    // Create Drivers
    // ----------------------------
    const drivers = await Driver.create([
      {
        user: driverUsers[0]._id,
        licenseNumber: 'MH-12-2024-0001',
        experience: 8,
        vehicleTypes: ['Sedan', 'SUV'],
        isAvailable: true,
        rating: 4.8,
        totalRatings: 124,
        totalTrips: 456,
        hourlyRate: 35,
        languages: ['English', 'Hindi', 'Marathi'],
        certifications: ['Defensive Driving', 'First Aid'],
        documents: {
          profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          vehiclePhoto: 'https://images.unsplash.com/photo-1550360732-18d6e1a578?w=400',
          license: 'license-doc-arjun.pdf',
          insurance: 'insurance-2024.pdf',
        },
        location: { type: 'Point', coordinates: [72.8777, 19.076] },
        preferredLocations: ['Mumbai', 'Thane'],
        workingHours: { start: '06:00', end: '22:00' },
        status: 'active',
      },
      {
        user: driverUsers[1]._id,
        licenseNumber: 'DL-04-2024-0002',
        experience: 12,
        vehicleTypes: ['Luxury Sedan', 'SUV'],
        isAvailable: true,
        rating: 4.9,
        totalRatings: 89,
        totalTrips: 312,
        hourlyRate: 50,
        languages: ['English', 'Hindi', 'Punjabi'],
        certifications: ['VIP Transport', 'Security Escort'],
        documents: {
          profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
          vehiclePhoto: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400',
          license: 'license-doc-vikram.pdf',
          insurance: 'insurance-2024.pdf',
        },
        location: { type: 'Point', coordinates: [77.1025, 28.7041] },
        preferredLocations: ['Delhi', 'Gurgaon', 'Noida'],
        workingHours: { start: '05:00', end: '23:00' },
        status: 'active',
      },
      {
        user: driverUsers[2]._id,
        licenseNumber: 'KA-05-2024-0003',
        experience: 5,
        vehicleTypes: ['Hatchback', 'Sedan'],
        isAvailable: true,
        rating: 4.6,
        totalRatings: 67,
        totalTrips: 198,
        hourlyRate: 25,
        languages: ['English', 'Kannada', 'Hindi'],
        certifications: ['Fuel Efficiency'],
        documents: {
          profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
          vehiclePhoto: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400',
          license: 'license-doc-john.pdf',
          insurance: 'insurance-2024.pdf',
        },
        location: { type: 'Point', coordinates: [77.5946, 12.9716] },
        preferredLocations: ['Bangalore', 'Whitefield'],
        workingHours: { start: '07:00', end: '20:00' },
        status: 'active',
      },
    ]);
    console.log(`✅ Created ${drivers.length} driver profiles`);

    console.log('\n🎉 Seed data inserted successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   User:  demo.user@example.com / Password123');
    console.log('   User:  raul.verma@example.com / Password123');
    console.log('   Driver: arjun.patel@example.com / Password123');
    console.log('   Driver: vikram.singh@example.com / Password123');
    console.log('   Admin:  admin@example.com / Password123');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedData();
