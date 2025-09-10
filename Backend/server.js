const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// --- Checkpoint 1: Script Start ---
console.log("1. Server script started.");

// Route Imports
const authRoutes = require('./routes/auth');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
// IMPORTANT: Make sure this is your correct connection string.
const MONGO_URI = 'mongodb+srv://shreedharkb4_db_user:shreedhariiit23@quizmasterdeployment.bp14rgx.mongodb.net/?retryWrites=true&w=majority&appName=QuizMasterDeployment'; // <-- Make sure this is still correct!

// --- Checkpoint 2: Before Database Connection ---
console.log("2. Attempting to connect to MongoDB...");

mongoose.connect(MONGO_URI)
  .then(() => {
    // --- Checkpoint 3 (Success): Database Connected ---
    console.log("3. Successfully connected to MongoDB!");

    // --- API ROUTES ---
    app.use('/api/auth', authRoutes);

    // --- START SERVER (Only after successful DB connection) ---
    // --- Checkpoint 4: Starting Server ---
    console.log("4. Starting Express server to listen for requests...");
    app.listen(PORT, () => {
      // --- Checkpoint 5 (Success): Server is Running ---
      console.log(`5. Server is running on http://localhost:${PORT}`);
    });

  })
  .catch(err => {
    // --- Checkpoint 3 (FAILURE): Database Connection Error ---
    console.error("--- DATABASE CONNECTION FAILED ---");
    console.error("Error Details:", err.message);
    console.error("---------------------------------");
    // We will exit the process if the database connection fails
    process.exit(1);
  });

