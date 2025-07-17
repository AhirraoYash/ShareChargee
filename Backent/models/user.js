const mongoose = require('mongoose');
const Vehicle = require('./vehicle');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: false },
  pincode: { type: String, required: false },
  profileImage: {
    type: String,
    default: "https://via.placeholder.com/150" // Default placeholder image
  },
  vehicles: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle' 
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  subscription: {
    type: Boolean,
    default: false
  },
  subscriptionStartDate: {
    type: Date,
    default: null
  },
  subscriptionEndDate: {
    type: Date,
    default: null
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet'
  },
});

// Middleware to populate vehicles when finding users
userSchema.pre('find', function(next) {
  this.populate('vehicles');
  next();
});

userSchema.pre('findOne', function(next) {
  this.populate('vehicles');
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
