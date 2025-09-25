// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Routes
const userRoutes = require('./routes/userRoutes');     // /api/register, /api/login
const reportRoutes = require('./routes/reportRoutes'); // /api/report/save, /api/report/:reportId

app.use('/api', userRoutes);          // Mount user routes at /api
app.use('/api/report', reportRoutes); // Mount report routes at /api/report

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'MediAssist Backend Running!' });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
