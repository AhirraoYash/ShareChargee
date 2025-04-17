const express = require('express');
// const { signup, login, logout } = require('../controllers/userController');
const {signup,login,checkSession,logout} =require('../controllers/userController');
const router = express.Router();

// Routes for Signup, Login, and Logout
router.post('/signup', signup);
router.post('/login', login);
router.get('/checkSession',checkSession)
router.post('/logout', logout);

module.exports = router;
