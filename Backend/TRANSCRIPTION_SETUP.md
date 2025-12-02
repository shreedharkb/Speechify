# Voice Transcription Setup

## Quick Fix for OpenMP Error

If you see the error "OMP: Error #15: Initializing libiomp5md.dll", follow these steps:

### Option 1: Run the Fix Script (Easiest)
1. Double-click `fix-openmp.bat` in the Backend folder
2. Wait for it to complete
3. Restart your backend server

### Option 2: Manual Fix
1. Set environment variable manually:
   ```powershell
   [System.Environment]::SetEnvironmentVariable('KMP_DUPLICATE_LIB_OK', 'TRUE', 'User')
   ```
2. Close all terminals
3. Restart your backend server

## Requirements

1. **Python** - Must be installed and in PATH
2. **faster-whisper** package:
   ```bash
   pip install faster-whisper
   ```

## Testing Transcription

Test if transcription works:
```bash
cd Backend
python transcribe.py path/to/audio.wav
```

## Troubleshooting

### "python: command not found"
- Install Python from python.org
- Make sure Python is added to PATH during installation

### "No module named 'faster_whisper'"
```bash
pip install faster-whisper
```

### Still getting errors?
- Try using Anaconda/Miniconda
- Create a clean environment:
  ```bash
  conda create -n quizapp python=3.10
  conda activate quizapp
  pip install faster-whisper
  ```

## Model Info

Current setup uses:
- **Model**: base (faster, good accuracy)
- **Device**: CPU (better compatibility)
- **Language**: English

You can change the model in `transcribe.py`:
- `tiny` - Fastest, lowest accuracy
- `base` - Good balance (current)
- `small` - Better accuracy
- `medium` - High accuracy, slower
- `large-v2` - Best accuracy, slowest
