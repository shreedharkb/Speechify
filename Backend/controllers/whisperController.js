
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');


// POST /api/whisper/transcribe
exports.transcribe = async (req, res) => {
  try {
    const audioFile = req.file;
    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file uploaded.' });
    }

    console.log('Transcribing audio file:', audioFile.filename, 'Size:', audioFile.size);

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
      try {
        fs.unlinkSync(audioFile.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }

      if (code === 0 && transcription.trim()) {
        console.log('Transcription successful:', transcription.trim());
        res.json({ text: transcription.trim() });
      } else {
        console.error('Faster Whisper error (code ' + code + '):', errorOutput);
        
        // Check for common errors
        if (errorOutput.includes('OMP: Error')) {
          res.status(500).json({ 
            error: 'Python environment error. OpenMP library conflict detected.',
            details: 'Please restart the backend server to apply the fix.'
          });
        } else if (errorOutput.includes('ModuleNotFoundError') || errorOutput.includes('No module named')) {
          res.status(500).json({ 
            error: 'Missing Python package. Please install faster-whisper.',
            details: 'Run: pip install faster-whisper'
          });
        } else {
          res.status(500).json({ 
            error: 'Transcription failed', 
            details: errorOutput || 'Unknown error'
          });
        }
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      try {
        fs.unlinkSync(audioFile.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
      res.status(500).json({ 
        error: 'Failed to start transcription process',
        details: 'Make sure Python is installed and in PATH'
      });
    });

  } catch (err) {
    console.error('Faster Whisper integration error:', err);
    res.status(500).json({ error: 'Transcription failed', details: err.message });
  }
};

