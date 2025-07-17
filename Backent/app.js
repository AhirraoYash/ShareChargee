const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./config/db');
const vehicleRoutes = require('./routes/vehicleRoutes');
const stationRoutes = require('./routes/stationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const walletRoutes = require('./routes/walletRoute');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express'); // Add this line
const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, 'docs', 'swagger.json'), 'utf8')); // Load your swagger.json file

// Load env vars
dotenv.config();

// Route files
const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
app.use(express.json());

// Mount routes
app.use('/api', userRoutes);
app.use('/api/v1/vehicle', vehicleRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/wallet', walletRoutes);

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// run swagger api http://localhost:5000/api-docs/