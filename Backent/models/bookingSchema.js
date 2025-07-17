const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        required: true
    },
    chargerNumber: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    noOfHours: {
        type: Number,
        required: true,
        min: [1, 'Duration must be at least 1 hour'],
        max: [6, 'Duration cannot exceed 6 hours']
    },
    bookingTime: {
        type: Date,
        default: Date.now
    },
    isPreBooked: {
        type: Boolean,
        required: true,
        default: false
    },
    bookingDate: {
        type: Date,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Amount cannot be negative']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    
    
}, {
    timestamps: true
});

// // Index for efficient queries
// bookingSchema.index({ userId: 1, bookingDate: -1 });
// bookingSchema.index({ stationId: 1, startTime: 1 });
// bookingSchema.index({ status: 1 });

// // Pre-save hook to validate booking
// bookingSchema.pre('save', async function(next) {
//     if (this.isNew) {
//         // Check if station exists and is operational
//         const Station = mongoose.model('Station');
//         const station = await Station.findById(this.stationId);
//         if (!station) {
//             throw new Error('Station not found');
//         }
//         if (station.status !== 'Available') {
//             throw new Error('Station is not available for booking');
//         }

//         // Check for overlapping bookings
//         const overlappingBooking = await this.constructor.findOne({
//             stationId: this.stationId,
//             chargerNumber: this.chargerNumber,
//             status: { $nin: ['completed', 'cancelled'] },
//             startTime: { $lt: new Date(this.startTime.getTime() + this.noOfHours * 60 * 60 * 1000) },
//             $expr: {
//                 $lt: [
//                     { $add: ['$startTime', { $multiply: ['$noOfHours', 60 * 60 * 1000] }] },
//                     this.startTime
//                 ]
//             }
//         });

//         if (overlappingBooking) {
//             throw new Error('This time slot is already booked');
//         }

//         // For pre-bookings, check if user is premium
//         if (this.isPreBooked) {
//             const User = mongoose.model('User');
//             const user = await User.findById(this.userId);
//             if (!user.subscription) {
//                 throw new Error('Only premium users can pre-book charging slots');
//             }
//         }
//     }
//     next();
// });

// // Post-save hook to update station status
// bookingSchema.post('save', async function(doc) {
//     if (doc.status === 'active') {
//         const Station = mongoose.model('Station');
//         await Station.findByIdAndUpdate(doc.stationId, {
//             $set: { 
//                 [`chargers.${doc.chargerNumber}.status`]: 'in_use',
//                 [`chargers.${doc.chargerNumber}.currentBooking`]: doc._id
//             }
//         });
//     }
// });

// Method to calculate final amount
// bookingSchema.methods.calculateFinalAmount = async function() {
//     if (this.chargingStatus === 'completed') {
//         const Station = mongoose.model('Station');
//         const station = await Station.findById(this.stationId);
//         const pricePerKWh = station.chargers.find(c => c.number === this.chargerNumber).price;
//         return this.energyConsumed * pricePerKWh;
//     }
//     return this.totalAmount;
// };

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 