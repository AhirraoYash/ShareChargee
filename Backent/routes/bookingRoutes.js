const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    createBooking,
    getUserBookings,
    getBookingDetails,
    cancelBooking,
    updateBookingStatus,
    getStationBookings,
    checkSlotAvailability
} = require('../controllers/bookingController');

// Create a new booking
router.post('/create', auth, createBooking);

// Get all bookings for logged-in user
router.get('/my-bookings', auth, getUserBookings);

// Get specific booking details
router.get('/details/:bookingId', auth, getBookingDetails);

// Cancel a booking
router.put('/cancel/:bookingId', auth, cancelBooking);

// Update booking status
router.put('/status/:bookingId', auth, updateBookingStatus);

// Get all bookings for a specific station
router.get('/station/:stationId', auth, getStationBookings);

// Check slot availability
router.get('/check-availability', auth, checkSlotAvailability);

module.exports = router;
