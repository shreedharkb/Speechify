from faster_whisper import WhisperModel
import sys

# Usage: python transcribe.py <audio_path>
def transcribe_audio(audio_path):
    # Use medium model, GPU (CUDA), float16 for best speed/accuracy
    model = WhisperModel("medium", device="cuda", compute_type="float16")
    segments, info = model.transcribe(audio_path)
    transcription = " ".join([segment.text for segment in segments])
    return transcription

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python transcribe.py <audio_path>")
        sys.exit(1)
    audio_path = sys.argv[1]
    print(transcribe_audio(audio_path))
