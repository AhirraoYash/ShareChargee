const Booking = require('../models/bookingSchema');
const Station = require('../models/station');
const User = require('../models/user');
const Vehicle = require('../models/vehicle');

// Create a new booking
const createBooking = async (req, res) => {
    try {
        const {
            stationId,
            chargerNumber,
            startTime,
            noOfHours,
            isPreBooked,
            bookingDate,
            vehicleId,
            totalAmount
        } = req.body;

        // Check if user is premium for pre-booking
        if (isPreBooked) {
            const user = await User.findById(req.user.userId);
            if (!user.subscription) {
                return res.status(403).json({
                    success: false,
                    message: 'Only premium users can pre-book charging slots'
                });
            }
        }

        // Validate station and charger availability
        const station = await Station.findById(stationId);
        if (!station) {
            return res.status(404).json({
                success: false,
                message: 'Station not found'
            });
        }

        // Check if charger exists and is available
        const charger = station.chargers.find(c => c.number === chargerNumber);
        if (!charger || charger.status !== 'available') {
            return res.status(400).json({
                success: false,
                message: 'Charger is not available'
            });
        }

        // Validate charging duration
        if (noOfHours < 1 || noOfHours > 6) {
            return res.status(400).json({
                success: false,
                message: 'Charging duration must be between 1 and 6 hours'
            });
        }

        // Check for overlapping bookings
        const overlappingBooking = await Booking.findOne({
            stationId,
            chargerNumber,
            status: { $nin: ['completed', 'cancelled'] },
            startTime: { $lt: new Date(new Date(startTime).getTime() + noOfHours * 60 * 60 * 1000) },
            $expr: {
                $lt: [
                    { $add: ['$startTime', { $multiply: ['$noOfHours', 60 * 60 * 1000] }] },
                    new Date(startTime)
                ]
            }
        });

        if (overlappingBooking) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked'
            });
        }

        // Create new booking
        const booking = new Booking({
            userId: req.user.userId,
            stationId,
            chargerNumber,
            startTime,
            noOfHours,
            isPreBooked,
            bookingDate,
            vehicleId,
            totalAmount,
            status: 'pending',
            paymentStatus: 'pending'
        });

        await booking.save();

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking
        });
    } catch (error) {
        console.error('Error in createBooking:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create booking'
        });
    }
};

// Get all bookings for a user
const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.userId })
            .populate('stationId', 'stationName address chargers')
            .populate('vehicleId', 'brand model numberPlate')
            .sort({ bookingDate: -1 });

        res.status(200).json({
            success: true,
            bookings
        });
    } catch (error) {
        console.error('Error in getUserBookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings'
        });
    }
};

// Get specific booking details
const getBookingDetails = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.bookingId,
            userId: req.user.userId
        })
        .populate('stationId', 'stationName address chargers')
        .populate('vehicleId', 'brand model numberPlate');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            booking
        });
    } catch (error) {
        console.error('Error in getBookingDetails:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking details'
        });
    }
};

// Cancel booking
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.bookingId,
            userId: req.user.userId
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if booking can be cancelled (1 hour before start time)
        const bookingTime = new Date(booking.startTime);
        const now = new Date();
        const hoursDifference = (bookingTime - now) / (1000 * 60 * 60);

        if (hoursDifference < 1) {
            return res.status(400).json({
                success: false,
                message: 'Booking cannot be cancelled within 1 hour of start time'
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        // Update station charger status if needed
        if (booking.status === 'active') {
            await Station.findByIdAndUpdate(booking.stationId, {
                $set: { [`chargers.${booking.chargerNumber}.status`]: 'available' }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        console.error('Error in cancelBooking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking'
        });
    }
};

// Check slot availability
const checkSlotAvailability = async (req, res) => {
    try {
        const { stationId, chargerNumber, startTime, noOfHours } = req.query;
        
        // Validate charging duration
        if (noOfHours < 1 || noOfHours > 6) {
            return res.status(400).json({
                success: false,
                message: 'Charging duration must be between 1 and 6 hours'
            });
        }

        // Check for overlapping bookings
        const overlappingBooking = await Booking.findOne({
            stationId,
            chargerNumber,
            status: { $nin: ['completed', 'cancelled'] },
            startTime: { $lt: new Date(new Date(startTime).getTime() + noOfHours * 60 * 60 * 1000) },
            $expr: {
                $lt: [
                    { $add: ['$startTime', { $multiply: ['$noOfHours', 60 * 60 * 1000] }] },
                    new Date(startTime)
                ]
            }
        });

        // Check station and charger status
        const station = await Station.findById(stationId);
        const charger = station?.chargers.find(c => c.number === chargerNumber);
        const isChargerAvailable = charger && charger.status === 'available';

        res.status(200).json({
            success: true,
            isAvailable: !overlappingBooking && isChargerAvailable
        });
    } catch (error) {
        console.error('Error in checkSlotAvailability:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check slot availability'
        });
    }
};

// Get station's bookings for a specific date
const getStationBookings = async (req, res) => {
    try {
        const { date } = req.query;
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookings = await Booking.find({
            stationId: req.params.stationId,
            bookingDate: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            status: { $ne: 'cancelled' }
        })
        .populate('userId', 'firstName lastName')
        .populate('vehicleId', 'brand model numberPlate');

        res.status(200).json({
            success: true,
            bookings
        });
    } catch (error) {
        console.error('Error in getStationBookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch station bookings'
        });
    }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.status = status;

        // Update station charger status based on booking status
        if (status === 'active') {
            await Station.findByIdAndUpdate(booking.stationId, {
                $set: { 
                    [`chargers.${booking.chargerNumber}.status`]: 'in_use',
                    [`chargers.${booking.chargerNumber}.currentBooking`]: booking._id
                }
            });
        } else if (status === 'completed') {
            await Station.findByIdAndUpdate(booking.stationId, {
                $set: { 
                    [`chargers.${booking.chargerNumber}.status`]: 'available',
                    [`chargers.${booking.chargerNumber}.currentBooking`]: null
                }
            });
        }

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            booking
        });
    } catch (error) {
        console.error('Error in updateBookingStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update booking status'
        });
    }
};

module.exports = {
    createBooking,
    getUserBookings,
    getBookingDetails,
    cancelBooking,
    updateBookingStatus,
    getStationBookings,
    checkSlotAvailability
};
