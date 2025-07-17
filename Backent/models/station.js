const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    stationName: {
        type: String,
        required: [true, 'Please add a station name'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    pincode: {
        type: String,
        required: [true, 'Please add a pincode'],
        match: [/^[0-9]{6}$/, 'Please add a valid 6-digit pincode']
    },
    latitude: {
        type: Number,
        required: [true, 'Please add latitude']
    },
    longitude: {
        type: Number,
        required: [true, 'Please add longitude']
    },
    chargers: [{
        type: {
            type: String,
            enum: ['AC', 'DC'],
            required: true,
            status:false
        },
        power: {
            type: Number,
            required: true,
            min: [0, 'Power must be greater than 0'],
            status:false
        },
        price: {
            type: Number,
            required: true,
            min: [0, 'Price must be greater than 0'],
            status:false
        },
        status: {
            type: String,
            enum: ['Available', 'Maintenance', 'Busy'],
            default: 'Available'
        }
    }],
    status: {
        type: String,
        enum: ['Available', 'Maintenance', 'Busy'],
        default: 'Available'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Station', stationSchema); 