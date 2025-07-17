const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String, // e.g., "bike", "car"
    required: true,
  },
  numberPlate: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  model: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  batteryCapacityKWH: {
    type: Number,
    required: true
  }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;