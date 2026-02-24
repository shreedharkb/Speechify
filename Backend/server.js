require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool } = require('./config/db');
const { redis } = require('./config/redis');
const { getQueueStats, cleanQueues } = require('./utils/queue');
const { apiRateLimit } = require('./middleware/rateLimitMiddleware');

// Route Imports
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const quizRoutes = require('./routes/quiz');
const imageRoutes = require('./routes/images');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3001;

// Simple CORS for local development
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Increase payload size limit to handle audio data (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global API rate limiting (100 requests per minute per IP)
app.use('/api', apiRateLimit);

// --- Health & Stats Endpoints ---
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await pool.query('SELECT 1');
    const redisHealth = await redis.ping();
    const queueStats = await getQueueStats();
    
    res.json({
      status: 'healthy',
      database: dbHealth ? 'connected' : 'disconnected',
      redis: redisHealth === 'PONG' ? 'connected' : 'disconnected',
      queues: queueStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Queue stats endpoint
app.get('/api/queue-stats', async (req, res) => {
  try {
    const stats = await getQueueStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clean old jobs periodically (every hour)
setInterval(async () => {
  try {
    await cleanQueues();
    console.log('🧹 Cleaned old queue jobs');
  } catch (error) {
    console.error('Error cleaning queues:', error);
  }
}, 3600000);

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
    // Use the image upload routes
    app.use('/api/images', imageRoutes);
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





  
  