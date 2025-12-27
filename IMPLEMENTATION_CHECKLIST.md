# 📝 SBERT Implementation Checklist

Follow these steps in order. Check off each step as you complete it.

## Phase 1: Build & Start SBERT Service ⏳ (Currently Running)

- [x] Files created (done automatically)
- [ ] **Wait for build to complete** (currently running - shows "Building" in terminal)
  - This downloads ~800MB of dependencies (PyTorch, SBERT model)
  - Takes 5-10 minutes depending on internet speed
  - You'll see "Successfully built" when done

- [ ] **Start the service**
  ```powershell
  docker-compose up -d sbert-service
  ```

- [ ] **Verify it's running**
  ```powershell
  docker-compose ps
  # Should show sbert-service as "Up"
  ```

- [ ] **Test health endpoint**
  ```powershell
  curl http://localhost:5002/health
  ```
  Expected: `{"status":"healthy","model":"all-MiniLM-L6-v2","service":"sbert-grading"}`

## Phase 2: Update Backend

- [ ] **Check Backend .env file**
  ```powershell
  cd Backend
  notepad .env
  ```
  Add this line if not present:
  ```
  SBERT_SERVICE_URL=http://localhost:5002
  ```

- [ ] **Remove old Gemini dependency**
  ```powershell
  cd Backend
  npm uninstall @google/generative-ai
  ```

- [ ] **Restart Backend**
  ```powershell
  npm start
  ```
  Look for log: "🤖 SBERT Grading Starting..." when grading happens

## Phase 3: Test the System

- [ ] **Test SBERT directly with curl**
  ```powershell
  curl -X POST http://localhost:5002/grade `
    -H "Content-Type: application/json" `
    -d '{\"questionText\":\"What is the capital of France?\",\"studentAnswer\":\"Paris\",\"correctAnswer\":\"Paris\",\"threshold\":0.85}'
  ```
  Expected: `{"isCorrect":true,"similarityScore":1.0,"explanation":"Exact match"}`

- [ ] **Test semantic understanding**
  ```powershell
  curl -X POST http://localhost:5002/grade `
    -H "Content-Type: application/json" `
    -d '{\"questionText\":\"What is photosynthesis?\",\"studentAnswer\":\"plants make food from sunlight\",\"correctAnswer\":\"process by which plants convert light energy into chemical energy\",\"threshold\":0.70}'
  ```
  Expected: `{"isCorrect":true,"similarityScore":~0.85,"explanation":"Good match..."}`

## Phase 4: Test with Real Quiz

- [ ] **Start Frontend**
  ```powershell
  cd Frontend
  npm run dev
  ```

- [ ] **Login as Teacher**
  - Go to http://localhost:5174
  - Login with teacher credentials

- [ ] **Create Test Quiz**
  - Question: "What is ECG?"
  - Correct Answer: "electrocardiogram"
  - Save quiz

- [ ] **Take Quiz as Student**
  - Open incognito window or different browser
  - Login as student
  - Take the quiz
  - Answer: "electrical signal from the heart"
  - Submit

- [ ] **Verify Semantic Grading**
  - Answer should be marked CORRECT (even though wording is different)
  - Check score is ~85-90%
  - Check Backend logs show "SBERT Grading Starting..."

## Phase 5: Monitoring

- [ ] **View SBERT logs**
  ```powershell
  docker-compose logs -f sbert-service
  ```
  Press Ctrl+C to stop viewing

- [ ] **Check all services are running**
  ```powershell
  docker-compose ps
  ```
  Should show:
  - postgres: Up
  - whisper-service: Up
  - sbert-service: Up

## Troubleshooting

### If SBERT build fails:
```powershell
docker-compose down
docker-compose build --no-cache sbert-service
docker-compose up -d sbert-service
```

### If port 5002 is in use:
```powershell
# Find what's using it
netstat -ano | findstr :5002

# Kill the process
taskkill /PID <pid_number> /F
```

### If Backend can't connect:
1. Check SBERT is running: `curl http://localhost:5002/health`
2. Check .env has correct URL: `SBERT_SERVICE_URL=http://localhost:5002`
3. Restart Backend: `cd Backend; npm start`

### If grading seems too strict:
Edit `Backend/controllers/quizAttemptController.js`, line ~71:
```javascript
0.70  // Lower this to 0.60 or 0.65 for more lenient grading
```

## Success Indicators ✅

You'll know it's working when:
- [ ] `curl http://localhost:5002/health` returns healthy status
- [ ] Backend logs show "SBERT Grading Starting..."
- [ ] Backend logs show "✅ SBERT response received"
- [ ] Paraphrased answers are marked correct
- [ ] Wrong answers are marked incorrect
- [ ] Grading happens in < 1 second (vs 2-5 seconds with Gemini)

## Current Status

**Next Step:** Wait for Docker build to complete (check terminal for "Successfully built")

**After Build:** Run `docker-compose up -d sbert-service` to start the service

**Then:** Test with `curl http://localhost:5002/health`

---

💡 **Tip:** Keep this file open and check off items as you go!
