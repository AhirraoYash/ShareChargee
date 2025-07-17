const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middlerware/userMiddlerware');
const {
    createWallet,
    addMoney,
    deductMoney,
    getTransactions,
    balanceUsingUserId
} = require('../controllers/walletController');
const Wallet = require('../models/wallet');

// Create wallet
router.post('/create', isLoggedIn, createWallet);

// Add money to wallet
router.post('/add', isLoggedIn, addMoney);

// Deduct money from wallet
router.post('/deduct', isLoggedIn, deductMoney);
router.get("/transactions",isLoggedIn,getTransactions)
router.get("/balanceUsingUserId",isLoggedIn,balanceUsingUserId)
// Get wallet balance
router.get('/balance', isLoggedIn, async (req, res) => {
    try {
        const userId = req.user.userId;
        const wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found'
            });
        }

        res.status(200).json({
            success: true,
            balance: wallet.balance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching wallet balance'
        });
    }
});


// Check balance
router.post('/check-balance', isLoggedIn, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an amount to check'
            });
        }

        const wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found'
            });
        }

        const isSufficient = wallet.balance >= amount;

        res.status(200).json({
            success: true,
            isSufficient,
            currentBalance: wallet.balance,
            requiredAmount: amount,
            deficit: isSufficient ? 0 : amount - wallet.balance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking wallet balance'
        });
    }
});

module.exports = router;
