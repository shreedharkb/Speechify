const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// POST /api/whisper/transcribe
exports.transcribe = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No audio file uploaded.' });
    }
    // Path to uploaded audio file
    const audioPath = path.join(__dirname, '..', req.file.path);
    // Log file info for debugging
    console.log('Audio file info:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: audioPath
    });

    // Convert webm to wav using ffmpeg
    const wavPath = audioPath.replace(/\.[^/.]+$/, '') + '.wav';
    await new Promise((resolve, reject) => {
      exec(`ffmpeg -y -i "${audioPath}" "${wavPath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error('ffmpeg conversion error:', error);
          reject(error);
        } else {
          console.log('ffmpeg conversion stdout:', stdout);
          console.log('ffmpeg conversion stderr:', stderr);
          resolve();
        }
      });
    });

    // Send to Whisper API (OpenAI)
    const formData = new FormData();
    formData.append('file', fs.createReadStream(wavPath));
    formData.append('model', 'whisper-1');

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({ msg: 'OpenAI API key not set.' });
    }

    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${openaiApiKey}`,
      },
    });

    // Clean up uploaded files
    fs.unlinkSync(audioPath);
    fs.unlinkSync(wavPath);

    res.json({ text: response.data.text });
  } catch (err) {
    console.error('Whisper transcription error:', err);
    if (err.response && err.response.data) {
      console.error('Whisper API response:', err.response.data);
      res.status(500).json({ msg: 'Transcription failed.', error: err.response.data });
    } else {
      res.status(500).json({ msg: 'Transcription failed.', error: err.message });
    }
  }
};
