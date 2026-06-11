const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

// Whisper service URL - can be configured via environment variable
const WHISPER_SERVICE_URL = process.env.WHISPER_SERVICE_URL || 'http://localhost:5000';

// POST /api/whisper/transcribe
exports.transcribe = async (req, res) => {
  try {
    const audioFile = req.file;
    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file uploaded.' });
    }

    console.log('Transcribing audio file:', audioFile.filename, 'Size:', audioFile.size);

    // Create form data to send to the Whisper service
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(audioFile.path), {
      filename: audioFile.originalname,
      contentType: audioFile.mimetype.split(';')[0] // Strip codecs if present
    });
    formData.append('language', 'en'); // Force English to prevent hallucinations

    try {
      // Send request to the dockerized Whisper service
      const response = await axios.post(`${WHISPER_SERVICE_URL}/transcribe`, formData, {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 120000, // 2 minute timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      // Clean up uploaded file
      try {
        fs.unlinkSync(audioFile.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }

      console.log('Transcription successful:', response.data.text.substring(0, 100) + '...');
      
      const transcription = response.data.text ? response.data.text.trim() : "";
      
      if (audioFile.size < 5000) {
        return res.status(400).json({ error: 'Audio file too small. Your microphone might be muted or not picking up sound.' });
      }
      
      if (transcription === "You" || transcription === "You.") {
        return res.status(400).json({ error: 'Whisper detected silence. Please ensure your microphone is picking up your voice.' });
      }

      // Return the transcription text
      res.json({ text: transcription });

    } catch (error) {
      // Clean up uploaded file
      try {
        fs.unlinkSync(audioFile.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }

      console.error('Whisper service error:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({ 
          error: 'Whisper service unavailable',
          details: 'Cannot connect to transcription service. Please ensure the Docker container is running.'
        });
      }

      if (error.response) {
        // The request was made and the server responded with a status code
        return res.status(error.response.status).json({
          error: 'Transcription failed',
          details: error.response.data.details || error.response.data.error || 'Unknown error'
        });
      }

      return res.status(500).json({ 
        error: 'Transcription failed',
        details: error.message
      });
    }

  } catch (err) {
    console.error('Whisper integration error:', err);
    res.status(500).json({ error: 'Transcription failed', details: err.message });
  }
};

