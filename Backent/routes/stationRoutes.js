const express = require('express');
const router = express.Router();
const {
    getStations,
    getStationsByPincode,
    addStation,
    updateStation,
    deleteStation,
    getStationById
} = require('../controllers/stationController');
const isLoggedIn = require('../middlerware/userMiddlerware');

// Public routes
router.get('/', getStations);
router.get('/search/:pincode', getStationsByPincode);
router.get('/:id', getStationById);

// Protected routes (admin only)
router.post('/', isLoggedIn, addStation);
router.put('/:id', isLoggedIn, updateStation);
router.delete('/:id', isLoggedIn, deleteStation);

module.exports = router; 