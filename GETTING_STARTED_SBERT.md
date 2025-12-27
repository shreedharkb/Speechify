# 🚀 Getting Started with SBERT Grading

This guide will help you get the new SBERT grading system up and running in minutes.

## What Just Happened?

Your quiz application has been upgraded to use **SBERT (Sentence-BERT)** instead of Gemini API for semantic grading. This means:

- ✅ **No API keys needed** - Works offline
- ✅ **20-50x faster** - 80ms vs 2-5 seconds per answer
- ✅ **100% free** - No API costs
- ✅ **Better privacy** - All data stays on your server

## 3 Ways to Get Started

### Option 1: Docker Compose (Easiest) 🐳

**Perfect if you want to run everything with one command**

```bash
# Start all services (Postgres, Whisper, SBERT, etc.)
docker-compose up -d

# Check everything is running
docker-compose ps

# You should see:
# - postgres
# - whisper-service
# - sbert-service ← NEW!

# Test SBERT is working
curl http://localhost:5002/health
```

**Expected output:**
```json
{
  "status": "healthy",
  "model": "all-MiniLM-L6-v2",
  "service": "sbert-grading"
}
```

**That's it! Skip to [Testing](#testing) section.**

---

### Option 2: Manual Setup (Development) 💻

**Perfect for development and debugging**

**Step 1: Start SBERT Service**

```bash
# Navigate to sbert-service
cd sbert-service

# Check requirements (optional)
python check_requirements.py

# Install dependencies
pip install -r requirements.txt

# Start the service
python app.py
```

You should see:
```
Loading SBERT model...
SBERT model loaded successfully!
 * Running on http://0.0.0.0:5002
```

**Keep this terminal open!**

**Step 2: Start Backend** (in a new terminal)

```bash
cd Backend

# Install dependencies if needed
npm install

# Start backend
npm start
```

**Step 3: Start Frontend** (in a new terminal)

```bash
cd Frontend

# Install dependencies if needed
npm install

# Start frontend
npm run dev
```

---

### Option 3: Hybrid (Docker for SBERT only) 🔀

**Use Docker just for SBERT, run backend/frontend manually**

```bash
# Build and run SBERT in Docker
cd sbert-service
docker build -t sbert-service .
docker run -d -p 5002:5002 --name sbert-grading sbert-service

# Then start backend and frontend manually (see Option 2)
```

---

## Testing

### Quick Test (Windows)

```batch
test-sbert.bat
```

### Quick Test (Linux/Mac)

```bash
# Test health
curl http://localhost:5002/health

# Test grading
curl -X POST http://localhost:5002/grade \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "What is photosynthesis?",
    "studentAnswer": "process where plants make food from sunlight",
    "correctAnswer": "process by which plants convert light energy into chemical energy",
    "threshold": 0.70
  }'
```

**Expected output:**
```json
{
  "isCorrect": true,
  "similarityScore": 0.8943,
  "explanation": "Good match - answer conveys the correct meaning"
}
```

### Comprehensive Test Suite

```bash
cd sbert-service
pip install colorama  # For colored output
python test_service.py
```

This runs 8 automated tests covering:
- Health check
- Exact matching
- Case insensitivity
- Semantic similarity
- Medical terminology
- Incorrect answers
- Empty answers
- Batch grading

---

## Using the Application

### 1. Login as Teacher

- Navigate to: http://localhost:5174 (or your frontend URL)
- Login with teacher credentials

### 2. Create a Quiz

- Add questions with correct answers
- Set start and end times

### 3. Students Take Quiz

- Students login and take the quiz
- They can answer in their own words

### 4. Automatic Grading

- Answers are automatically graded using SBERT
- Students see results immediately
- Teachers can review all submissions

### Example: Seeing Semantic Grading in Action

**Question:** "What is an ECG?"

**Correct Answer:** "electrocardiogram"

**Student Answers (all marked correct!):**
- "electrocardiogram" ✅ (100% match)
- "electro cardio gram" ✅ (100% match)
- "electrical signal from the heart" ✅ (87% match)
- "heart electrical activity" ✅ (85% match)

---

## Configuration

### Environment Variables

Create or update `Backend/.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quiz_app
DB_USER=quiz_admin
DB_PASSWORD=quiz_secure_password

# JWT
JWT_SECRET=your_jwt_secret_key_here

# SBERT Service (defaults to localhost:5002)
SBERT_SERVICE_URL=http://localhost:5002

# If using Docker Compose:
# SBERT_SERVICE_URL=http://sbert-service:5002
```

### Adjusting Grading Threshold

The threshold determines how strict grading is:

Edit `Backend/controllers/quizAttemptController.js`:

```javascript
const gradeResult = await gradeAnswerWithAI(
  question.questionText,
  answerObj.studentAnswer,
  question.correctAnswerText,
  0.70 // ← Change this: 0.0 to 1.0
);
```

**Recommended values:**
- `0.95`: Very strict - near-perfect matches only
- `0.85`: Strict - strong semantic match
- `0.70`: **Recommended** - balanced approach
- `0.60`: Lenient - accepts broader interpretations

---

## Troubleshooting

### Problem: "Connection refused" when backend tries to grade

**Solution:**
```bash
# Make sure SBERT service is running
curl http://localhost:5002/health

# If not, start it:
# Docker: docker-compose up -d sbert-service
# Manual: cd sbert-service && python app.py
```

### Problem: Port 5002 already in use

**Solution:**
```bash
# Windows: Find and kill process
netstat -ano | findstr :5002
taskkill /PID <pid> /F

# Linux/Mac: Find and kill process
lsof -ti:5002 | xargs kill -9
```

Or change the port in:
- `sbert-service/app.py` (last line)
- `docker-compose.yml` (ports section)
- `Backend/.env` (SBERT_SERVICE_URL)

### Problem: Model download fails

**Solution:**
```bash
# Manually download model
cd sbert-service
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
```

### Problem: Low similarity scores

**Solution:**
- Lower the threshold (try 0.60-0.70)
- Ensure questions provide enough context
- Check correct answers are well-formatted

---

## Monitoring

### View SBERT Logs

```bash
# Docker Compose
docker-compose logs -f sbert-service

# Direct Docker
docker logs -f sbert-grading

# Manual
# Check terminal where you ran python app.py
```

### View Backend Logs

Look for grading entries like:
```
🤖 SBERT Grading Starting...
Question: What is photosynthesis?
Student Answer: plants make food from sunlight
Correct Answer: process by which plants convert light energy
Threshold: 0.7
📡 Calling SBERT service at http://localhost:5002/grade...
✅ SBERT response received
Grading result: Score=0.8943, Threshold=0.7, Correct=true
```

---

## Stopping Services

### Docker Compose

```bash
# Stop all services
docker-compose down

# Stop but keep data
docker-compose stop
```

### Manual

```bash
# Press Ctrl+C in each terminal running:
# - python app.py (SBERT)
# - npm start (Backend)
# - npm run dev (Frontend)
```

---

## Next Steps

1. ✅ **Test the system** - Run test scripts and try grading
2. 📚 **Read detailed docs** - Check [SBERT_SETUP.md](SBERT_SETUP.md)
3. ⚙️ **Adjust threshold** - Fine-tune for your use case
4. 🎓 **Create quizzes** - Start using semantic grading!

---

## Need Help?

### Documentation
- [SBERT_SETUP.md](SBERT_SETUP.md) - Complete setup guide
- [SBERT_QUICKSTART.md](SBERT_QUICKSTART.md) - Quick reference
- [GEMINI_TO_SBERT_COMPARISON.md](GEMINI_TO_SBERT_COMPARISON.md) - See what changed
- [sbert-service/README.md](sbert-service/README.md) - Service details

### Common Commands Cheat Sheet

```bash
# Start everything
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f sbert-service

# Test SBERT
curl http://localhost:5002/health

# Stop everything
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

---

## Performance Tips

- **CPU:** Works great out of the box (~80ms per answer)
- **GPU:** Automatically detected if available (2-5x faster)
- **Memory:** Uses ~500MB RAM
- **Batch Processing:** Use `/batch-grade` for grading multiple answers

---

## Success Checklist

- [ ] SBERT service is running (check health endpoint)
- [ ] Backend can connect to SBERT (check backend logs)
- [ ] Test grading works (run test-sbert.bat or test_service.py)
- [ ] Can create and take quizzes
- [ ] Semantic grading recognizes paraphrased answers
- [ ] Threshold is appropriate for your use case

---

**You're all set! Happy grading! 🎓✨**

The SBERT system is now handling semantic evaluation of quiz answers, making your grading smarter, faster, and completely free!
