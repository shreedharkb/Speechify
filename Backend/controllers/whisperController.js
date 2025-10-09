
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');


// POST /api/whisper/transcribe
exports.transcribe = async (req, res) => {
  try {
    const audioFile = req.file;
    if (!audioFile) return res.status(400).json({ error: 'No audio file uploaded.' });

    // Call the local Python script using Faster Whisper
    const pythonProcess = spawn('python', [path.join(__dirname, '../transcribe.py'), audioFile.path]);
    let transcription = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      transcription += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      // Clean up uploaded file
      fs.unlinkSync(audioFile.path);
      if (code === 0) {
        res.json({ text: transcription.trim() });
      } else {
        console.error('Faster Whisper error:', errorOutput);
        res.status(500).json({ error: 'Transcription failed', details: errorOutput });
      }
    });
  } catch (err) {
    console.error('Faster Whisper integration error:', err);
    res.status(500).json({ error: 'Transcription failed', details: err.message });
  }
};

