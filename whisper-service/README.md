# Whisper Transcription Service

This is a dockerized Whisper transcription service that provides audio-to-text conversion via a REST API.

## Features

- FastAPI-based REST endpoint for audio transcription
- Uses Faster-Whisper for efficient transcription
- Runs in a Docker container for easy deployment
- Health check endpoint for monitoring
- Automatic API documentation with Swagger UI

## API Endpoints

### POST /transcribe
Transcribe an audio file to text.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `audio` field containing the audio file

**Response:**
```json
{
  "text": "transcribed text here",
  "language": "en",
  "duration": 10.5
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "whisper-transcription"
}
```

## Running with Docker Compose

From the project root directory:

```bash
# Build and start the service
docker-compose up -d

# View logs
docker-compose logs -f whisper-service

# Stop the service
docker-compose down
```

## Running Manually

```bash
# Build the image
docker build -t whisper-service ./whisper-service

# Run the container
docker run -p 5000:5000 whisper-service
```

## Configuration

The service listens on port 5000 by default. You can change this in the `docker-compose.yml` file.

## Environment Variables

- `KMP_DUPLICATE_LIB_OK`: Set to `TRUE` to avoid OpenMP conflicts

## API Documentation

Once the service is running, you can access:
- Swagger UI: http://localhost:5000/docs
- ReDoc: http://localhost:5000/redoc
