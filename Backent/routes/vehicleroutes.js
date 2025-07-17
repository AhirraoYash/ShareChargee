const express = require('express');
const isLoggedIn = require('../middlerware/userMiddlerware');
const { 
  addVehicle,
  getVehicles,
  getVehicleByNumberPlate,
  updateVehicle,
  deleteVehicle
} = require('../controllers/vehicleController');

const router = express.Router();

// 🛡️ All routes are protected with verifyUser middleware

// ➕ Add vehicle
router.post('/add', isLoggedIn, addVehicle);

// 📥 Get all vehicles for logged-in user
router.get('/all', isLoggedIn, getVehicles);

// 🔍 Get vehicle by number plate
router.get('/:numberPlate', isLoggedIn, getVehicleByNumberPlate);

// ✏️ Update a vehicle
router.put('/update/:vehicleId', isLoggedIn, updateVehicle);

// ❌ Delete a vehicle
router.delete('/delete/:vehicleId', isLoggedIn, deleteVehicle);

module.exports = router;
