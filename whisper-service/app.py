import os
import shutil
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import uvicorn
from faster_whisper import WhisperModel

# Fix OpenMP library conflict
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

app = FastAPI(title="Whisper Transcription Service", version="1.0.0")

# Configure upload folder
UPLOAD_FOLDER = '/tmp/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize Whisper model (loaded once at startup)
model = None


@app.on_event("startup")
async def startup_event():
    """Load the Whisper model on startup"""
    global model
    print("Loading Whisper model...")
    model = WhisperModel("base", device="cpu", compute_type="int8")
    print("Whisper model loaded successfully!")


@app.get('/health')
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "whisper-transcription"}


@app.post('/transcribe')
async def transcribe(audio: UploadFile = File(...)):
    """Transcribe audio file"""
    if not audio:
        raise HTTPException(status_code=400, detail="No audio file provided")
    
    if audio.filename == '':
        raise HTTPException(status_code=400, detail="No file selected")
    
    # Save the uploaded file temporarily
    filename = audio.filename
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    
    try:
        # Save uploaded file
        with open(filepath, 'wb') as buffer:
            shutil.copyfileobj(audio.file, buffer)
        
        print(f"Transcribing file: {filename}")
        
        # Perform transcription
        segments, info = model.transcribe(filepath, language="en")
        transcription = " ".join([segment.text for segment in segments])
        
        # Clean up the temporary file
        try:
            os.remove(filepath)
        except Exception as e:
            print(f"Warning: Could not delete temporary file: {e}")
        
        print(f"Transcription completed: {transcription[:100]}...")
        
        return {
            "text": transcription.strip(),
            "language": info.language,
            "duration": info.duration
        }
        
    except Exception as e:
        print(f"Error during transcription: {str(e)}")
        # Clean up file if it exists
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except:
            pass
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Transcription failed",
                "details": str(e)
            }
        )


if __name__ == '__main__':
    # Run FastAPI app with uvicorn
    uvicorn.run(app, host='0.0.0.0', port=5000)
