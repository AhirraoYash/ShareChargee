const express = require('express');
const isLoggedIn=require('../middlerware/userMiddlerware');
// const { signup, login, logout } = require('../controllers/userController');
const {
  signup,
  login,
  checkSession,
  logout,
  fetchUserDetails,
  updateUserDetails,
  getAllUsers,
  deleteUser,
  updateSubscription,
  getCurrentUser
} = require('../controllers/userController');
// const { addVehicle, getVehicles, getVehicleByNumberPlate, updateVehicle, deleteVehicle } = require('../controllers/vehicleController'); // Import your controller methods

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/checkSession', checkSession);
router.get('/getCurrentUser', isLoggedIn, getCurrentUser);
// Protected routes
router.get('/fetchUserDetails', isLoggedIn, fetchUserDetails);
router.put('/updateUserDetails', isLoggedIn, updateUserDetails);

// Admin routes
router.get('/getAllUsers', isLoggedIn, getAllUsers);
router.delete('/deleteUser/:id', isLoggedIn, deleteUser);
router.post('/updateSubscription', isLoggedIn, updateSubscription);

module.exports = router;

