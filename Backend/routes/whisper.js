const express = require('express');
const router = express.Router();
const whisperController = require('../controllers/whisperController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// POST /api/whisper/transcribe
router.post('/transcribe', upload.single('audio'), whisperController.transcribe);

module.exports = router;
