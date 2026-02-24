const express = require('express');
const router = express.Router();
const whisperController = require('../controllers/whisperController');
const multer = require('multer');
const { whisperRateLimit } = require('../middleware/rateLimitMiddleware');
const upload = multer({ dest: 'uploads/' });

// POST /api/whisper/transcribe - with rate limiting (20 per minute)
router.post('/transcribe', whisperRateLimit, upload.single('audio'), whisperController.transcribe);

module.exports = router;
