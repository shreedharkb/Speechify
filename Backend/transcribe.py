import os
import sys

# Fix OpenMP library conflict
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

from faster_whisper import WhisperModel

# Usage: python transcribe.py <audio_path>
def transcribe_audio(audio_path):
    try:
        # Use base model on CPU for better compatibility
        # Options: tiny, base, small, medium, large-v2
        model = WhisperModel("base", device="cpu", compute_type="int8")
        segments, info = model.transcribe(audio_path, language="en")
        transcription = " ".join([segment.text for segment in segments])
        return transcription.strip()
    except Exception as e:
        print(f"Error during transcription: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python transcribe.py <audio_path>")
        sys.exit(1)
    audio_path = sys.argv[1]
    print(transcribe_audio(audio_path))
