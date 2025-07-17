const Wallet = require('../models/wallet');
const User = require('../models/user');

/**
 * @desc    Create wallet for user
 * @route   POST /api/wallet/create
 * @access  Private
 */
// walletController.js
const createWallet = async (userId) => {
    try {
        let wallet = await Wallet.findOne({ userId });

        if (wallet) {
            console.log('Wallet already exists for user:', userId);
            return wallet;
        }

        wallet = new Wallet({
            userId,
            balance: 0
        });

        await wallet.save();
        console.log('Wallet created successfully for user:', userId);

        return wallet;
    } catch (error) {
        console.error('Error creating wallet:', error);
        throw error;
    }
};


/**
 * @desc    Add money to wallet
 * @route   POST /api/wallet/add
 * @access  Private
 * @body    {amount: number}
 */
const addMoney = async (req, res) => {
    try {
        const userId = req.user.userId;
        const amount = Number(req.body.amount);

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid amount'
            });
        }

        let wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found'
            });
        }

        wallet.balance += amount;

        // ✅ Add transaction entry
        wallet.transactions.push({
            type: 'deposit',
            amount: amount
        });

        await wallet.save();

        res.status(200).json({
            success: true,
            message: 'Money added successfully',
            balance: wallet.balance,
            latestTransaction: wallet.transactions[wallet.transactions.length - 1]
        });
    } catch (error) {
        console.error('Error adding money:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding money to wallet'
        });
    }
};


const balanceUsingUserId= async (req, res) => {
    try {
         const userId=req.body.userId;
        const wallet = await Wallet.findOne(userId);

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
};


/**
 * @desc    Deduct money from wallet
 * @route   POST /api/wallet/deduct
 * @access  Private
 * @body    {amount: number}
 */
const deductMoney = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid amount'
            });
        }

        const wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found'
            });
        }

        if (wallet.balance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        wallet.balance -= amount;

        // ✅ Add transaction entry
        wallet.transactions.push({
            type: 'withdrawal',
            amount: amount
        });

        await wallet.save();

        res.status(200).json({
            success: true,
            message: 'Money deducted successfully',
            balance: wallet.balance,
            latestTransaction: wallet.transactions[wallet.transactions.length - 1]
        });
    } catch (error) {
        console.error('Error deducting money:', error);
        res.status(500).json({
            success: false,
            message: 'Error deducting money from wallet'
        });
    }
};


const getTransactions = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Find the wallet by userId
        const wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found'
            });
        }

        // Return all transactions from the wallet
        res.status(200).json({
            success: true,
            transactions: wallet.transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transactions'
        });
    }
};



module.exports = {
    createWallet,
    addMoney,
    deductMoney,
    getTransactions,
    balanceUsingUserId
};


