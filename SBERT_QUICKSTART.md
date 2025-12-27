# Quick Start Guide - SBERT Grading System

## What Changed?

✅ **Removed**: Gemini API dependency (no more API keys needed!)
✅ **Added**: SBERT microservice for semantic grading
✅ **Benefit**: Faster, free, private, and offline grading

## Quick Start

### Option 1: Docker Compose (Easiest)

```bash
# Start all services (Postgres, Whisper, SBERT)
docker-compose up -d

# Check services are running
docker-compose ps

# Test SBERT service
curl http://localhost:5002/health
```

### Option 2: Manual Development Setup

```bash
# 1. Start SBERT Service
cd sbert-service
pip install -r requirements.txt
python app.py
# Keep this terminal open

# 2. In a new terminal, start Backend
cd Backend
npm install
npm start

# 3. In another terminal, start Frontend
cd Frontend
npm install
npm run dev
```

## Testing the Grading

### Test SBERT Service Directly

```bash
curl -X POST http://localhost:5002/grade \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "What is photosynthesis?",
    "studentAnswer": "process where plants make food from sunlight",
    "correctAnswer": "process by which plants convert light energy into chemical energy",
    "threshold": 0.70
  }'
```

Expected response:
```json
{
  "isCorrect": true,
  "similarityScore": 0.8943,
  "explanation": "Good match - answer conveys the correct meaning"
}
```

### Test Through the Application

1. Login as a student
2. Take a quiz
3. Submit answers with different phrasings
4. Check results to see semantic grading in action

## Common Commands

```bash
# View SBERT logs
docker-compose logs -f sbert-service

# Restart SBERT service
docker-compose restart sbert-service

# Stop all services
docker-compose down

# Rebuild SBERT after changes
docker-compose up -d --build sbert-service
```

## Environment Variables

No API keys needed! But you can configure:

**Backend/.env**:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quiz_app
DB_USER=quiz_admin
DB_PASSWORD=quiz_secure_password

# JWT
JWT_SECRET=your_jwt_secret_key_here

# SBERT Service (optional, defaults shown)
SBERT_SERVICE_URL=http://localhost:5002
```

## What to Remove

You can now remove from your `.env`:
```env
# ❌ NO LONGER NEEDED
# GEMINI_API_KEY=...
```

## Troubleshooting

### SBERT Service Won't Start
```bash
# Check if port 5002 is available
netstat -ano | findstr :5002

# If in use, stop the process or change port in:
# - sbert-service/app.py (last line)
# - docker-compose.yml (ports section)
# - Backend/.env (SBERT_SERVICE_URL)
```

### Backend Can't Connect to SBERT
```bash
# Test connection
curl http://localhost:5002/health

# If using Docker Compose, use service name:
# SBERT_SERVICE_URL=http://sbert-service:5002
```

### Model Download Issues
```bash
# Manually download model
cd sbert-service
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
```

## Performance Tips

- **CPU**: Works great, ~100ms per answer
- **GPU**: Automatically detected if available, even faster
- **Memory**: Uses ~500MB RAM
- **Batch Grading**: Use `/batch-grade` endpoint for better performance

## Next Steps

1. ✅ Start services (see above)
2. ✅ Test SBERT health endpoint
3. ✅ Submit a quiz through the app
4. ✅ Verify semantic grading works
5. 📊 Adjust threshold in `Backend/controllers/quizAttemptController.js` if needed

Read [SBERT_SETUP.md](SBERT_SETUP.md) for detailed documentation.

Happy grading! 🎓✨
