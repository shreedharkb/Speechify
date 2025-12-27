# SBERT Semantic Grading Setup

This document explains how the SBERT-powered semantic grading system works and how to set it up.

## Overview

The system now uses **Sentence-BERT (SBERT)** for semantic similarity checks between student answers and correct answers. This is a major upgrade from the previous Gemini API approach:

### Why SBERT?

✅ **No API Keys Required** - Works completely offline, no external API needed
✅ **No API Costs** - Free to use, unlimited requests
✅ **Privacy First** - Student answers never leave your server
✅ **Fast & Reliable** - No network latency, instant responses (~3000 sentences/sec)
✅ **No Rate Limits** - No API quotas or outages
✅ **Consistent Results** - Deterministic grading (same inputs = same output)
✅ **Open Source** - Fully transparent and customizable

### Semantic Understanding

Like the previous system, SBERT understands:
- **Synonyms**: "big" ↔ "large"
- **Paraphrasing**: "capital of France" ↔ "Paris"
- **Abbreviations**: "USA" ↔ "United States of America"
- **Scientific terms**: "NaCl" ↔ "sodium chloride" ↔ "table salt"
- **Medical terms**: "ECG" ↔ "electrocardiogram" ↔ "electrical signal from heart"

## Architecture

The system consists of two components:

1. **Backend Service** (Node.js) - Main application server
2. **SBERT Service** (Python/Flask) - Dedicated grading microservice

```
┌─────────────────┐     HTTP POST      ┌──────────────────┐
│  Node.js        │ ─────────────────> │  SBERT Service   │
│  Backend        │     /grade          │  (Flask/Python)  │
│  (Port 5001)    │ <───────────────── │  (Port 5002)     │
└─────────────────┘     JSON Result     └──────────────────┘
```

## Setup Instructions

### Method 1: Docker Compose (Recommended)

The easiest way to run everything:

```bash
# Build and start all services (Postgres, Whisper, SBERT)
docker-compose up -d

# Check service status
docker-compose ps

# View SBERT logs
docker-compose logs -f sbert-service
```

This will automatically:
- Build the SBERT service
- Download the model (~80MB)
- Start the service on port 5002

### Method 2: Manual Setup (Development)

If you want to run SBERT service separately:

```bash
# 1. Install Python dependencies
cd sbert-service
pip install -r requirements.txt

# 2. Start the service
python app.py
```

The service will be available at `http://localhost:5002`

### Method 3: Docker Only for SBERT

Run just the SBERT service in Docker:

```bash
cd sbert-service
docker build -t sbert-service .
docker run -p 5002:5002 sbert-service
```

## Backend Configuration

The Backend automatically connects to the SBERT service. You can configure the URL via environment variable:

**Backend/.env**:
```env
# SBERT Service URL (default: http://localhost:5002)
SBERT_SERVICE_URL=http://localhost:5002

# If using Docker Compose, use the service name:
# SBERT_SERVICE_URL=http://sbert-service:5002
```

## How It Works

### Grading Flow

1. **Student submits quiz** → Answers sent to Backend
2. **For each answer** → Backend calls SBERT service via HTTP
3. **SBERT encodes texts** → Converts answers to 384-dimensional vectors
4. **Calculate similarity** → Cosine similarity between vectors
5. **Returns score** → Number between 0.0 (no match) and 1.0 (perfect match)
6. **Apply threshold** → If score ≥ 0.70 (70%), answer is marked correct
7. **Save results** → Store score, explanation, and grading metadata

### Technical Details

**Model Used**: `all-MiniLM-L6-v2`
- Size: ~80MB
- Speed: ~3000 sentences/second on CPU
- Accuracy: Trained on 1B+ sentence pairs
- Output: 384-dimensional embeddings

**Similarity Calculation**:
- Uses cosine similarity between embeddings
- Context-aware: Considers both the question and answer
- Dual scoring: Compares with and without question context, uses higher score

### Key Files

- **`sbert-service/app.py`** - Flask API for SBERT grading
- **`sbert-service/Dockerfile`** - Docker container definition
- **`Backend/controllers/gradeController.js`** - Updated to call SBERT service
- **`Backend/controllers/quizAttemptController.js`** - Quiz submission logic
- **`docker-compose.yml`** - Orchestrates all services

## API Endpoints

### Health Check
```bash
GET http://localhost:5002/health
```

Returns:
```json
{
  "status": "healthy",
  "model": "all-MiniLM-L6-v2",
  "service": "sbert-grading"
}
```

### Grade Single Answer
```bash
POST http://localhost:5002/grade
Content-Type: application/json

{
  "questionText": "What is photosynthesis?",
  "studentAnswer": "Process where plants make food from sunlight",
  "correctAnswer": "Process by which plants convert light energy into chemical energy",
  "threshold": 0.85
}
```

Returns:
```json
{
  "isCorrect": true,
  "similarityScore": 0.8943,
  "explanation": "Good match - answer conveys the correct meaning"
}
```

### Batch Grade (Optional)
```bash
POST http://localhost:5002/batch-grade
Content-Type: application/json

{
  "threshold": 0.85,
  "answers": [
    {
      "questionText": "...",
      "studentAnswer": "...",
      "correctAnswer": "..."
    }
  ]
}
```

## Adjusting the Threshold

The default threshold is **70% (0.70)**. You can adjust it in `Backend/controllers/quizAttemptController.js`:

```javascript
const gradeResult = await gradeAnswerWithAI(
  question.questionText,
  answerObj.studentAnswer,
  question.correctAnswerText,
  0.70 // Change this value: 0.0 to 1.0
);
```

### Threshold Guidelines

- **0.95-1.0**: Very strict - Only near-exact semantic matches
- **0.90-0.95**: Strict - Very strong match required
- **0.85-0.90**: Moderate - Good match, allows paraphrasing
- **0.70-0.85**: **Recommended** - Balanced, accepts reasonable variations
- **0.60-0.70**: Lenient - Accepts broader interpretations
- **Below 0.60**: Very lenient - May accept partially correct answers

## Testing the System

### 1. Check SBERT Service Health
```bash
curl http://localhost:5002/health
```

### 2. Test a Single Grading Request
```bash
curl -X POST http://localhost:5002/grade \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "What is the capital of France?",
    "studentAnswer": "paris",
    "correctAnswer": "Paris",
    "threshold": 0.85
  }'
```

Expected output:
```json
{
  "isCorrect": true,
  "similarityScore": 1.0,
  "explanation": "Exact match"
}
```

### 3. Test Medical Term Recognition
```bash
curl -X POST http://localhost:5002/grade \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "What is ECG?",
    "studentAnswer": "electrical signal generated from the heart",
    "correctAnswer": "electrocardiogram",
    "threshold": 0.70
  }'
```

This should return a high similarity score (~0.85-0.95) demonstrating semantic understanding.

## Fallback Mechanism

If the SBERT service is unavailable, the Backend automatically falls back to a smart text-matching algorithm that:
- Checks for exact matches
- Looks for word overlaps
- Uses a built-in dictionary of common equivalents
- Ensures grading still works even if SBERT is down

## Monitoring & Logs

### View SBERT Service Logs
```bash
# Docker Compose
docker-compose logs -f sbert-service

# Direct Docker
docker logs -f sbert-grading
```

### Backend Logs
Backend will log each grading request:
```
🤖 SBERT Grading Starting...
Question: What is photosynthesis?
Student Answer: plants make food from sunlight
Correct Answer: process by which plants convert light energy into chemical energy
Threshold: 0.7
📡 Calling SBERT service at http://localhost:5002/grade...
✅ SBERT response received: { isCorrect: true, similarityScore: 0.8943, ... }
Grading result: Score=0.8943, Threshold=0.7, Correct=true
```

## Advantages Over Gemini API

| Feature | Gemini API | SBERT |
|---------|------------|-------|
| **Cost** | Paid (API usage) | Free |
| **API Key** | Required | None |
| **Privacy** | Data sent to Google | Runs locally |
| **Speed** | Network dependent (~2-5s) | Instant (~0.1s) |
| **Rate Limits** | Yes (RPM/RPD limits) | None |
| **Offline** | No | Yes |
| **Deterministic** | No (varies slightly) | Yes (consistent) |
| **Dependencies** | Google account | None |

## Troubleshooting

### SBERT Service Won't Start

**Problem**: Port 5002 already in use
```bash
# Find process using port
netstat -ano | findstr :5002

# Kill process (Windows)
taskkill /PID <pid> /F
```

**Problem**: Model download fails
```bash
# Manually download model
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
```

### Backend Can't Connect to SBERT

**Check service is running**:
```bash
curl http://localhost:5002/health
```

**Check Docker network** (if using Docker Compose):
```bash
docker-compose exec backend ping sbert-service
```

**Set correct URL in Backend/.env**:
- Local development: `http://localhost:5002`
- Docker Compose: `http://sbert-service:5002`

### Low Similarity Scores

If you're getting unexpectedly low scores:
1. Lower the threshold (try 0.60-0.70)
2. Check the question provides enough context
3. Verify correct answer is well-formatted
4. Consider the student's answer phrasing

### Memory Issues

SBERT uses ~500MB RAM. If running on limited memory:
- Close other applications
- Use a smaller model: `paraphrase-MiniLM-L3-v2` (17MB)
- Add swap space

## Migration from Gemini

If migrating from Gemini API:

1. ✅ **No data migration needed** - QuizAttempt schema unchanged
2. ✅ **Environment variable removed** - No need for `GEMINI_API_KEY`
3. ✅ **Improved speed** - Faster grading with no network calls
4. ✅ **Better privacy** - All data stays on your server

## Performance

Typical performance on commodity hardware:

- **Grading Speed**: 50-100 answers per second
- **Response Time**: < 100ms per answer
- **Memory Usage**: ~500MB RAM
- **CPU Usage**: Low (optimized with batching)
- **Startup Time**: 3-5 seconds (model loading)

## Support & Resources

- **SBERT Documentation**: https://www.sbert.net/
- **Model Card**: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- **Docker Issues**: Check `docker-compose logs sbert-service`
- **Backend Issues**: Check Node.js console output

## Next Steps

1. Start the services: `docker-compose up -d`
2. Test the health endpoint: `curl http://localhost:5002/health`
3. Submit a quiz and verify grading works
4. Adjust threshold if needed
5. Monitor logs for any issues

You're all set! 🎉 SBERT grading is now active.
