require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./config/db');

// Route Imports
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const quizRoutes = require('./routes/quiz');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3001;

// Simple CORS for local development
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// --- DATABASE CONNECTION ---
// Test PostgreSQL connection
pool.query('SELECT NOW()')
  .then((result) => {
    console.log("Successfully connected to PostgreSQL!");
    console.log("Database time:", result.rows[0].now);

    // --- API ROUTES ---
    // Use the authentication routes
    app.use('/api/auth', authRoutes);
    // Use the new question routes
    app.use('/api/questions', questionRoutes);
    // Use the quiz routes
    app.use('/api/quiz', quizRoutes);
    // Use the quiz attempt routes
    const quizAttemptRoutes = require('./routes/quizAttempt');
    app.use('/api/quiz-attempt', quizAttemptRoutes);
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
    console.error("Full error:", err);
    console.error("Error stack:", err.stack);
    console.error("Make sure PostgreSQL container is running: docker-compose up -d postgres");
    process.exit(1); // Exit if the database connection fails
  });





  
  