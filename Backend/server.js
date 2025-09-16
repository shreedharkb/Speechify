require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Route Imports
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions'); // New route for questions


// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Force CORS headers for all responses (fix for Render)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://speechify-tau.vercel.app');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Keep CORS package for local dev
app.use(cors({
  origin: ['https://speechify-tau.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// --- DATABASE CONNECTION ---
// Use environment variable for MongoDB URI (set in Vercel dashboard)
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB!");

    // --- API ROUTES ---
  // Use the authentication routes
  app.use('/api/auth', authRoutes);
  // Use the new question routes
  app.use('/api/questions', questionRoutes);
  // Use the whisper transcription route
  const whisperRoutes = require('./routes/whisper');
  app.use('/api/whisper', whisperRoutes);

    // --- START SERVER (Only after successful DB connection) ---
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("--- DATABASE CONNECTION FAILED ---");
    console.error("Error Details:", err.message);
    process.exit(1); // Exit if the database connection fails
  });





  
  