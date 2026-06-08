import mongoose from 'mongoose';
import NodeCache from 'node-cache';
import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import Settings from '../models/Settings.js';
import User from '../models/User.js';
import { sendAdminNotificationEmail } from '../utils/email.js';

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const isDev = process.env.NODE_ENV === 'development';

// Dashboard Statistics
export const getDashboardStats = async (req, res) => {
    try {
        const cached = cache.get('dashboard_stats');
        if (cached) {
            return res.status(200).json({ success: true, data: cached, cached: true });
        }
        const now = new Date();
        const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Basic counts
        const [
            totalUsers,
            totalDrivers,
            activeDrivers,
            totalBookings,
            pendingBookings,
            completedBookings,
            todayBookings,
            weeklyBookings,
            monthlyBookings
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Driver.countDocuments(),
            Driver.countDocuments({ status: 'active', isAvailable: true }),
            Booking.countDocuments(),
            Booking.countDocuments({ status: 'pending' }),
            Booking.countDocuments({ status: 'completed' }),
            Booking.countDocuments({ createdAt: { $gte: startOfDay } }),
            Booking.countDocuments({ createdAt: { $gte: startOfWeek } }),
            Booking.countDocuments({ createdAt: { $gte: startOfMonth } })
        ]);

        // Revenue statistics
        const revenueStats = await Booking.aggregate([
            {
                $match: { status: 'completed' }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    averageBookingValue: { $avg: "$totalAmount" }
                }
            }
        ]);

        // Monthly revenue trend
        const monthlyRevenue = await Booking.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: new Date(now.getFullYear(), 0, 1) }
                }
            },
            {
                $group: {
                    _id: { 
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    revenue: { $sum: "$totalAmount" },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Driver performance stats
        const topDrivers = await Driver.aggregate([
            {
                $match: { status: 'active' }
            },
            {
                $sort: { rating: -1, totalTrips: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $project: {
                    name: { $arrayElemAt: ['$userInfo.name', 0] },
                    rating: 1,
                    totalTrips: 1,
                    hourlyRate: 1
                }
            }
        ]);

        const stats = {
            overview: {
                totalUsers,
                totalDrivers,
                activeDrivers,
                totalBookings,
                pendingBookings,
                completedBookings
            },
            revenue: {
                total: revenueStats[0]?.totalRevenue || 0,
                average: revenueStats[0]?.averageBookingValue || 0,
                monthly: monthlyRevenue
            },
            bookings: {
                today: todayBookings,
                weekly: weeklyBookings,
                monthly: monthlyBookings
            },
            performance: {
                topDrivers
            }
        };
        
        cache.set('dashboard_stats', stats);
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

// User Management
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', role } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = role ? { role } : { role: { $ne: 'admin' } };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: users,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

// Driver Management
export const getAllDrivers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (status) query.status = status;

        let driversQuery = Driver.find(query)
            .populate('user', '-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        let countQuery = Driver.countDocuments(query);

        if (search) {
            // Search requires joining with User — use aggregate for name/email search
            const pipeline = [
                { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
                { $unwind: '$user' },
                {
                    $match: {
                        ...(status ? { status } : {}),
                        $or: [
                            { 'user.name': { $regex: search, $options: 'i' } },
                            { 'user.email': { $regex: search, $options: 'i' } },
                            { licenseNumber: { $regex: search, $options: 'i' } }
                        ]
                    }
                },
                { $sort: { createdAt: -1 } }
            ];

            const [drivers, countResult] = await Promise.all([
                Driver.aggregate([...pipeline, { $skip: skip }, { $limit: parseInt(limit) }]),
                Driver.aggregate([...pipeline, { $count: 'total' }])
            ]);
            const total = countResult[0]?.total || 0;
            return res.status(200).json({
                success: true,
                data: drivers,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
            });
        }

        const [drivers, total] = await Promise.all([driversQuery, countQuery]);
        res.status(200).json({
            success: true,
            data: drivers,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

export const approveDriver = async (req, res) => {
    try {
        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            { status: 'active', isAvailable: true },
            { new: true }
        );
        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' });
        }
        res.status(200).json({ success: true, data: driver });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

// Booking Management
export const getAllBookings = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, userId, driverId } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (status) query.status = status;
        if (userId) query.user = userId;
        if (driverId) query.driver = driverId;

        const [bookings, total] = await Promise.all([
            Booking.find(query)
                .populate('user', 'name email phone')
                .populate({ path: 'driver', select: 'licenseNumber hourlyRate', populate: { path: 'user', select: 'name phone' } })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Booking.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: bookings,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

// Admin Profile
export const getAdminProfile = async (req, res) => {
    try {
        const admin = await User.findById(req.user.id).select('-password');
        res.status(200).json({ success: true, data: admin });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

export const updateAdminProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        if (email) {
            const taken = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: req.user.id } });
            if (taken) return res.status(409).json({ success: false, message: 'Email already in use' });
        }
        const updates = {};
        if (name) updates.name = name.trim();
        if (email) updates.email = email.toLowerCase().trim();
        if (phone) updates.phone = phone.trim();
        const admin = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');
        res.status(200).json({ success: true, data: admin });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        await Promise.all([
            User.findByIdAndDelete(req.params.id),
            Driver.findOneAndDelete({ user: req.params.id }),
        ]);
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
}
export const getDriverDetails = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id).populate('user', '-password');
        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' });
        }
        res.status(200).json({ success: true, data: driver });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};
export const suspendDriver = async (req, res) => {
    try {
        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            { status: 'suspended' },
            { new: true }
        );
        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' });
        }
        res.status(200).json({ success: true, data: driver });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

export const deleteDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' });
        }
        // Delete the linked User account and the Driver document together
        await Promise.all([
            User.findByIdAndDelete(driver.user),
            Driver.findByIdAndDelete(req.params.id),
        ]);
        res.status(200).json({ success: true, message: 'Driver deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

export const updateDriver = async (req, res) => {
    try {
        const allowed = ['experience', 'hourlyRate', 'vehicleTypes', 'licenseNumber', 'status', 'isAvailable'];
        const updates = {};
        allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).populate('user', '-password');

        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' });
        }
        res.status(200).json({ success: true, data: driver });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const allowed = ['name', 'phone', 'profilePhoto', 'isEmailVerified', 'role'];
        const updates = {};
        allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
        if (updates.role && !['user', 'driver', 'admin'].includes(updates.role)) {
            return res.status(400).json({ success: false, message: 'Invalid role value' });
        }

        const user = await User.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

export const getBookingDetails = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate({ path: 'driver', select: 'licenseNumber hourlyRate', populate: { path: 'user', select: 'name phone' } });
        
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

// Advanced Analytics
export const getAnalytics = async (req, res) => {
    try {
        const { period = '30', type = 'overview' } = req.query;
        const days = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        let analytics = {};

        switch (type) {
            case 'revenue':
                analytics = await getRevenueAnalytics(startDate);
                break;
            case 'users':
                analytics = await getUserAnalytics(startDate);
                break;
            case 'drivers':
                analytics = await getDriverAnalytics(startDate);
                break;
            case 'bookings':
                analytics = await getBookingAnalytics(startDate);
                break;
            default:
                analytics = await getOverviewAnalytics(startDate);
        }

        res.status(200).json({ success: true, data: analytics });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

// Revenue Analytics Helper
const getRevenueAnalytics = async (startDate) => {
    const dailyRevenue = await Booking.aggregate([
        {
            $match: {
                status: 'completed',
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    day: { $dayOfMonth: "$createdAt" },
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" }
                },
                revenue: { $sum: "$totalAmount" },
                bookings: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    const topDriversByRevenue = await Booking.aggregate([
        {
            $match: {
                status: 'completed',
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: "$driver",
                revenue: { $sum: "$totalAmount" },
                trips: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'drivers',
                localField: '_id',
                foreignField: '_id',
                as: 'driverInfo'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'driverInfo.user',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        {
            $project: {
                name: { $arrayElemAt: ['$userInfo.name', 0] },
                revenue: 1,
                trips: 1
            }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
    ]);

    return { dailyRevenue, topDriversByRevenue };
};

// User Analytics Helper
const getUserAnalytics = async (startDate) => {
    const userGrowth = await User.aggregate([
        {
            $match: {
                role: 'user',
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    day: { $dayOfMonth: "$createdAt" },
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" }
                },
                newUsers: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    const activeUsers = await Booking.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: "$user",
                bookings: { $sum: 1 },
                totalSpent: { $sum: "$totalAmount" }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        {
            $project: {
                name: { $arrayElemAt: ['$userInfo.name', 0] },
                email: { $arrayElemAt: ['$userInfo.email', 0] },
                bookings: 1,
                totalSpent: 1
            }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 }
    ]);

    return { userGrowth, activeUsers };
};

// Driver Analytics Helper
const getDriverAnalytics = async (startDate) => {
    const driverPerformance = await Driver.aggregate([
        {
            $lookup: {
                from: 'bookings',
                localField: '_id',
                foreignField: 'driver',
                as: 'bookings'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        {
            $project: {
                name: { $arrayElemAt: ['$userInfo.name', 0] },
                rating: 1,
                totalTrips: 1,
                status: 1,
                isAvailable: 1,
                recentBookings: {
                    $filter: {
                        input: '$bookings',
                        cond: { $gte: ['$$this.createdAt', startDate] }
                    }
                }
            }
        },
        {
            $addFields: {
                recentTrips: { $size: '$recentBookings' },
                recentRevenue: {
                    $sum: {
                        $map: {
                            input: '$recentBookings',
                            as: 'booking',
                            in: '$$booking.totalAmount'
                        }
                    }
                }
            }
        },
        { $sort: { recentRevenue: -1 } }
    ]);

    return { driverPerformance };
};

// Booking Analytics Helper
const getBookingAnalytics = async (startDate) => {
    const bookingTrends = await Booking.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    day: { $dayOfMonth: "$createdAt" },
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" },
                    status: "$status"
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    const statusDistribution = await Booking.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
                revenue: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "completed"] },
                            "$totalAmount",
                            0
                        ]
                    }
                }
            }
        }
    ]);

    return { bookingTrends, statusDistribution };
};

// Overview Analytics Helper
const getOverviewAnalytics = async (startDate) => {
    const revenue = await getRevenueAnalytics(startDate);
    const users = await getUserAnalytics(startDate);
    const drivers = await getDriverAnalytics(startDate);
    const bookings = await getBookingAnalytics(startDate);

    return { revenue, users, drivers, bookings };
};

// Report helper functions
const generateRevenueReport = async (start, end) => {
    const data = await Booking.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: start, $lte: end } } },
        {
            $group: {
                _id: { day: { $dayOfMonth: '$createdAt' }, month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                revenue: { $sum: '$totalAmount' },
                bookings: { $sum: 1 },
                avgValue: { $avg: '$totalAmount' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    const totals = await Booking.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalBookings: { $sum: 1 } } }
    ]);
    return { dailyBreakdown: data, totals: totals[0] || { totalRevenue: 0, totalBookings: 0 } };
};

const generateUserReport = async (start, end) => {
    const newUsers = await User.aggregate([
        { $match: { role: 'user', createdAt: { $gte: start, $lte: end } } },
        {
            $group: {
                _id: { day: { $dayOfMonth: '$createdAt' }, month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    const total = await User.countDocuments({ role: 'user', createdAt: { $gte: start, $lte: end } });
    return { newUsers, totalNewUsers: total };
};

const generateDriverReport = async (start, end) => {
    const newDrivers = await Driver.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
            $group: {
                _id: { status: '$status' },
                count: { $sum: 1 }
            }
        }
    ]);
    const total = await Driver.countDocuments({ createdAt: { $gte: start, $lte: end } });
    return { byStatus: newDrivers, totalNewDrivers: total };
};

const generateBookingReport = async (start, end) => {
    const byStatus = await Booking.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
    ]);
    const daily = await Booking.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
            $group: {
                _id: { day: { $dayOfMonth: '$createdAt' }, month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    return { byStatus, daily };
};

// Report Generation
export const generateReport = async (req, res) => {
    try {
        const { type, startDate, endDate, format = 'json' } = req.body;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        let reportData = {};

        switch (type) {
            case 'revenue':
                reportData = await generateRevenueReport(start, end);
                break;
            case 'users':
                reportData = await generateUserReport(start, end);
                break;
            case 'drivers':
                reportData = await generateDriverReport(start, end);
                break;
            case 'bookings':
                reportData = await generateBookingReport(start, end);
                break;
            default:
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid report type' 
                });
        }

        const report = {
            type,
            period: { startDate, endDate },
            generatedAt: new Date(),
            data: reportData
        };

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

// System Management
export const getSystemInfo = async (req, res) => {
    try {
        const systemInfo = {
            database: {
                totalUsers: await User.countDocuments(),
                totalDrivers: await Driver.countDocuments(),
                totalBookings: await Booking.countDocuments(),
                pendingDrivers: await Driver.countDocuments({ status: 'pending' })
            },
            server: {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                nodeVersion: process.version,
                platform: process.platform
            },
            application: {
                version: process.env.APP_VERSION || '1.0.0',
                environment: process.env.NODE_ENV || 'development'
            }
        };

        res.status(200).json({ success: true, data: systemInfo });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

// Bulk Operations
export const bulkUpdateUsers = async (req, res) => {
    try {
        const { userIds, updateData } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'User IDs array is required'
            });
        }
        if (userIds.length > 100) {
            return res.status(400).json({ success: false, message: 'Cannot bulk-update more than 100 users at once' });
        }

        // Whitelist allowed fields to prevent mass-assignment
        const { name, phone, isActive } = updateData || {};
        const safeUpdate = {};
        if (name !== undefined) safeUpdate.name = name;
        if (phone !== undefined) safeUpdate.phone = phone;
        if (isActive !== undefined) safeUpdate.isActive = isActive;

        const result = await User.updateMany(
            { _id: { $in: userIds } },
            safeUpdate,
            { runValidators: true }
        );

        res.status(200).json({ 
            success: true, 
            data: { 
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount 
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

export const bulkUpdateDrivers = async (req, res) => {
    try {
        const { driverIds, updateData } = req.body;

        if (!Array.isArray(driverIds) || driverIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Driver IDs array is required'
            });
        }
        if (driverIds.length > 100) {
            return res.status(400).json({ success: false, message: 'Cannot bulk-update more than 100 drivers at once' });
        }

        // Whitelist allowed fields to prevent mass-assignment
        const { status, isAvailable } = updateData || {};
        const safeUpdate = {};
        if (status !== undefined && ['pending', 'active', 'suspended', 'inactive'].includes(status)) safeUpdate.status = status;
        if (isAvailable !== undefined) safeUpdate.isAvailable = Boolean(isAvailable);

        const result = await Driver.updateMany(
            { _id: { $in: driverIds } },
            safeUpdate,
            { runValidators: true }
        );

        res.status(200).json({ 
            success: true, 
            data: { 
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount 
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

// Advanced User Management
export const getUserStats = async (req, res) => {
    try {
        const userId = req.params.id;
        
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const bookingStats = await Booking.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    totalSpent: { $sum: "$totalAmount" },
                    completedBookings: {
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                    },
                    cancelledBookings: {
                        $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
                    }
                }
            }
        ]);

        const recentBookings = await Booking.find({ user: userId })
            .populate('driver', 'user')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({ 
            success: true, 
            data: { 
                user,
                stats: bookingStats[0] || {
                    totalBookings: 0,
                    totalSpent: 0,
                    completedBookings: 0,
                    cancelledBookings: 0
                },
                recentBookings
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

// Advanced Driver Management
export const getDriverStats = async (req, res) => {
    try {
        const driverId = req.params.id;
        
        const driver = await Driver.findById(driverId).populate('user', '-password');
        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' });
        }

        const bookingStats = await Booking.aggregate([
            { $match: { driver: new mongoose.Types.ObjectId(driverId) } },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    totalEarnings: { $sum: "$totalAmount" },
                    completedBookings: {
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                    },
                    cancelledBookings: {
                        $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
                    }
                }
            }
        ]);

        const recentBookings = await Booking.find({ driver: driverId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({ 
            success: true, 
            data: { 
                driver,
                stats: bookingStats[0] || {
                    totalBookings: 0,
                    totalEarnings: 0,
                    completedBookings: 0,
                    cancelledBookings: 0
                },
                recentBookings
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

// Settings Management
export const updateSystemSettings = async (req, res) => {
    try {
        const allowed = ['bookingFeePercent', 'maxBookingDays', 'minHourlyRate', 'maxHourlyRate', 'maintenanceMode', 'allowNewRegistrations'];
        const updates = { updatedBy: req.user._id };
        allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

        const settings = await Settings.findOneAndUpdate(
            { key: 'global' },
            updates,
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: settings, message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

// Notification Management
export const sendBulkNotification = async (req, res) => {
    try {
        const { title, message, targetType, targetIds } = req.body;
        
        let targetUsers = [];
        
        switch (targetType) {
            case 'all_users':
                targetUsers = await User.find({ role: 'user' }).select('_id');
                break;
            case 'all_drivers':
                const drivers = await Driver.find().populate('user');
                targetUsers = drivers.map(driver => ({ _id: driver.user._id }));
                break;
            case 'specific':
                targetUsers = await User.find({ _id: { $in: targetIds } }).select('_id');
                break;
            default:
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid target type' 
                });
        }

        // Fetch full user records (need email + name) for resolved IDs
        const userIds = targetUsers.map(u => u._id);
        const users = await User.find({ _id: { $in: userIds } }).select('name email');

        const results = await Promise.allSettled(
            users.map(u => sendAdminNotificationEmail({ to: u.email, name: u.name, title, message }))
        );
        const sent = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        res.status(200).json({
            success: true,
            data: { title, message, targetCount: users.length, sent, failed, sentAt: new Date() },
            message: `Notification sent to ${sent} user(s)${failed ? `, ${failed} failed` : ''}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: isDev ? error.message : 'Internal server error' });
    }
};

// Data Export
export const createUser = async (req, res) => {
    try {
        const bcrypt = (await import('bcrypt')).default;
        const { name, email, phone, password, role = 'user' } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }
        const exists = await User.findOne({ email: email.toLowerCase().trim() });
        if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });
        const hashed = await bcrypt.hash(password, 12);
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashed,
            phone: phone?.trim() || '',
            role: ['user', 'admin'].includes(role) ? role : 'user',
            isEmailVerified: true,
        });
        const { password: _, ...userData } = user.toObject();
        return res.status(201).json({ success: true, data: userData });
    } catch (error) {
        console.error('Create user error:', error);
        return res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to create user' });
    }
};

export const createDriver = async (req, res) => {
    try {
        const bcrypt = (await import('bcrypt')).default;
        const {
            name, email, phone, password,
            experience, hourlyRate, vehicleType,
            licenseNumber, dateOfBirth, gender, address,
        } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }
        const exists = await User.findOne({ email: email.toLowerCase().trim() });
        if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });
        const hashed = await bcrypt.hash(password, 12);
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashed,
            phone: phone?.trim() || '',
            role: 'driver',
            isEmailVerified: true,
            dateOfBirth,
            gender,
            address,
        });
        const driver = await Driver.create({
            user: user._id,
            licenseNumber: licenseNumber || `ADMIN-${user._id.toString().slice(-6).toUpperCase()}`,
            experience: experience ? Number(experience) : 0,
            vehicleTypes: vehicleType ? [vehicleType] : ['sedan'],
            hourlyRate: hourlyRate ? Number(hourlyRate) : 0,
            documents: { license: 'pending-upload', profilePhoto: 'default-profile.jpg' },
            status: 'pending',
        });
        return res.status(201).json({ success: true, data: { user: user._id, driver: driver._id } });
    } catch (error) {
        console.error('Create driver error:', error);
        return res.status(500).json({ success: false, message: isDev ? error.message : 'Failed to create driver' });
    }
};

export const exportData = async (req, res) => {
    try {
        const { type } = req.body;

        let cursor;
        switch (type) {
            case 'users':
                cursor = User.find({}).select('-password').lean().cursor();
                break;
            case 'drivers':
                cursor = Driver.find({}).populate('user', 'name email phone').lean().cursor();
                break;
            case 'bookings':
                cursor = Booking.find({})
                    .populate('user', 'name email')
                    .populate({ path: 'driver', populate: { path: 'user', select: 'name phone' } })
                    .lean().cursor();
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid export type. Use: users, drivers, or bookings' });
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${Date.now()}.json"`);

        // Stream JSON array to response — avoids loading entire collection into memory
        res.write('[');
        let first = true;
        for await (const doc of cursor) {
            if (!first) res.write(',');
            res.write(JSON.stringify(doc));
            first = false;
        }
        res.write(']');
        res.end();
    } catch (error) {
        console.error('Export error:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: isDev ? error.message : 'Export failed' });
        }
    }
};
