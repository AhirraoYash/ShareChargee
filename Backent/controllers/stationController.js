const Station = require('../models/station');

// @desc    Get all stations
// @route   GET /api/stations
// @access  Public
exports.getStations = async (req, res) => {
    try {
        const stations = await Station.find();
        res.status(200).json({
            success: true,
            count: stations.length,
            stations
        });
    } catch (err) {
        console.error('Error fetching stations:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get stations by pincode
// @route   GET /api/stations/pincode/:pincode
// @access  Public
exports.getStationsByPincode = async (req, res) => {
    try {
        const stations = await Station.find({ pincode: req.params.pincode });
        res.status(200).json({
            success: true,
            count: stations.length,
            stations
        });
    } catch (err) {
        console.error('Error fetching stations by pincode:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Add station
// @route   POST /api/stations
// @access  Private (Admin only)
exports.addStation = async (req, res) => {
    try {
        // Validate chargers array
        if (!req.body.chargers || !Array.isArray(req.body.chargers) || req.body.chargers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one charger is required'
            });
        }

        // Validate each charger
        for (const charger of req.body.chargers) {
            if (!charger.type || !['AC', 'DC'].includes(charger.type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid charger type. Must be either AC or DC'
                });
            }
            if (!charger.power || charger.power <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid charger power. Must be greater than 0'
                });
            }
            if (!charger.price || charger.price <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid charger price. Must be greater than 0'
                });
            }
        }

        const station = await Station.create(req.body);
        res.status(201).json({
            success: true,
            data: station
        });
    } catch (err) {
        console.error('Error adding station:', err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Server Error'
            });
        }
    }
};

// @desc    Update station
// @route   PUT /api/stations/:id
// @access  Private (Admin only)
exports.updateStation = async (req, res) => {
    try {
        // Validate chargers array if it's being updated
        if (req.body.chargers) {
            if (!Array.isArray(req.body.chargers) || req.body.chargers.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one charger is required'
                });
            }

            // Validate each charger
            for (const charger of req.body.chargers) {
                if (!charger.type || !['AC', 'DC'].includes(charger.type)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid charger type. Must be either AC or DC'
                    });
                }
                if (!charger.power || charger.power <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid charger power. Must be greater than 0'
                    });
                }
                if (!charger.price || charger.price <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid charger price. Must be greater than 0'
                    });
                }
            }
        }

        const station = await Station.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!station) {
            return res.status(404).json({
                success: false,
                message: 'Station not found'
            });
        }

        res.status(200).json({
            success: true,
            data: station
        });
    } catch (err) {
        console.error('Error updating station:', err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Server Error'
            });
        }
    }
};

// @desc    Delete station
// @route   DELETE /api/stations/:id
// @access  Private (Admin only)
exports.deleteStation = async (req, res) => {
    try {
        const station = await Station.findById(req.params.id);

        if (!station) {
            return res.status(404).json({
                success: false,
                message: 'Station not found'
            });
        }

        await Station.deleteOne({ _id: req.params.id });

        res.status(200).json({
            success: true,
            message: 'Station deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting station:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get station by ID
// @route   GET /api/stations/:id
// @access  Public
exports.getStationById = async (req, res) => {
    try {
        const station = await Station.findById(req.params.id);
        
        if (!station) {
            return res.status(404).json({
                success: false,
                message: 'Station not found'
            });
        }

        res.status(200).json({
            success: true,
            data: station
        });
    } catch (err) {
        console.error('Error fetching station:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// Add rating to station
exports.addRating = async (req, res) => {
    try {
        const station = await Station.findById(req.params.id);
        if (!station) {
            return res.status(404).json({
                success: false,
                message: "Station not found"
            });
        }
        await station.addRating(req.body.rating);
        res.status(200).json({
            success: true,
            message: "Rating added successfully",
            data: station
        });
    } catch (error) {
        console.error('Error adding rating:', error);
        res.status(400).json({
            success: false,
            message: "Error adding rating",
            error: error.message
        });
    }
}; 