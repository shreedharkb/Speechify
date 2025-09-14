const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Route Imports
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions'); // New route for questions


// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
// Make sure this is your correct connection string.
const MONGO_URI = 'mongodb+srv://shreedharkb4_db_user:shreedhariiit23@quizmasterdeployment.bp14rgx.mongodb.net/?retryWrites=true&w=majority&appName=QuizMasterDeployment';

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

