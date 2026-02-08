/**
 * Audio File Storage Utilities
 * Saves audio recordings as 16kHz WAV files in sounds/ folder
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const SOUNDS_DIR = path.join(__dirname, '..', '..', 'sounds');

async function ensureSoundsDirectory() {
  try {
    await fs.access(SOUNDS_DIR);
  } catch {
    await fs.mkdir(SOUNDS_DIR, { recursive: true });
  }
}

async function saveAudioToFile(base64Audio, attemptId, questionId) {
  if (!base64Audio || typeof base64Audio !== 'string') {
    return null;
  }
  
  try {
    await ensureSoundsDirectory();
    
    const timestamp = Date.now();
    const tempFilename = `temp_${attemptId}_${questionId}_${timestamp}.webm`;
    const outputFilename = `attempt_${attemptId}_q${questionId}_${timestamp}.wav`;
    
    const tempFilePath = path.join(SOUNDS_DIR, tempFilename);
    const outputFilePath = path.join(SOUNDS_DIR, outputFilename);
    
    const buffer = Buffer.from(base64Audio, 'base64');
    await fs.writeFile(tempFilePath, buffer);
    
    const ffmpegCommand = `ffmpeg -i "${tempFilePath}" -ar 16000 -ac 1 -c:a pcm_s16le "${outputFilePath}" -y`;
    
    try {
      await execAsync(ffmpegCommand);
      await fs.unlink(tempFilePath);
      return outputFilename;
    } catch (ffmpegError) {
      console.error('FFmpeg error:', ffmpegError.message);
      await fs.writeFile(outputFilePath.replace('.wav', '.webm'), buffer);
      await fs.unlink(tempFilePath);
      return outputFilename.replace('.wav', '.webm');
    }
  } catch (error) {
    console.error('Error saving audio:', error);
    return null;
  }
}

module.exports = {
  saveAudioToFile,
  ensureSoundsDirectory
};
