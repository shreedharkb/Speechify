const fs = require('fs');
const path = require('path');
const { SpeechClient } = require('@google-cloud/speech');

// Set up Google credentials
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, '../google-credentials.json');
const client = new SpeechClient();

// POST /api/whisper/transcribe
exports.transcribe = async (req, res) => {
  try {
    const audioFile = req.file;
    if (!audioFile) return res.status(400).json({ error: 'No audio file uploaded.' });

    // Read audio file and convert to base64
    const audioBytes = fs.readFileSync(audioFile.path).toString('base64');


    // Choose encoding and sample rate based on file type
    let encoding = 'WEBM_OPUS';
    let sampleRateHertz = 48000;
    if (audioFile.mimetype === 'audio/wav') {
      encoding = 'LINEAR16';
      sampleRateHertz = 16000;
    }
    if (audioFile.mimetype === 'audio/mp3') {
      encoding = 'MP3';
      sampleRateHertz = 16000;
    }

    const request = {
      audio: { content: audioBytes },
      config: {
        encoding,
        sampleRateHertz,
        languageCode: 'en-US',
      },
    };

    const [response] = await client.recognize(request);
    const transcription = response.results.map(r => r.alternatives[0].transcript).join('\n');
    res.json({ text: transcription });

    // Clean up
    fs.unlinkSync(audioFile.path);
  } catch (err) {
    console.error('Google Speech-to-Text error:', err);
    res.status(500).json({ error: 'Transcription failed', details: err.message });
  }
};

