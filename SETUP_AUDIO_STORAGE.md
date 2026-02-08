# Quick Setup Guide - Audio Blob Storage

## Step 1: Apply Database Migration

### Option A: Using pgAdmin
1. Open pgAdmin and connect to your database
2. Open Query Tool
3. Copy and paste this SQL:

```sql
ALTER TABLE attempt_answers ADD COLUMN audio BYTEA;
```

4. Click Execute (F5)
5. Verify: You should see "Query returned successfully"

### Option B: Using Command Line
```powershell
# From your project root directory
docker exec -i speechify-postgres-1 psql -U postgres -d quiz_app < Backend/migrations/001_add_audio_column.sql
```

### Option C: Using psql directly
```bash
psql -U postgres -d quiz_app -f Backend/migrations/001_add_audio_column.sql
```

## Step 2: Verify Migration

Run this query in pgAdmin:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'attempt_answers' AND column_name = 'audio';
```

Expected result:
```
column_name | data_type
------------|----------
audio       | bytea
```

## Step 3: Test the Implementation

### Start your services:
```powershell
# Terminal 1: Start Docker services
docker-compose up -d

# Terminal 2: Start Backend
cd Backend
node server.js

# Terminal 3: Start Frontend
cd Frontend
npm run dev
```

### Test workflow:
1. Login as student
2. Start a quiz
3. Click microphone icon to record
4. Speak your answer
5. Stop recording (transcription should appear)
6. Submit quiz
7. Check pgAdmin: `SELECT audio FROM attempt_answers WHERE audio IS NOT NULL;`
8. You should see binary data (bytea)

## Step 4: View Audio Data in Database

```sql
-- Check if audio exists
SELECT 
  id,
  question_text,
  student_answer,
  CASE 
    WHEN audio IS NOT NULL THEN 'Has audio (' || pg_size_pretty(length(audio)) || ')'
    ELSE 'No audio'
  END as audio_status
FROM attempt_answers
ORDER BY id DESC
LIMIT 10;
```

## Troubleshooting

### Error: "column audio already exists"
✅ Migration already applied, you're good to go!

### Error: "Buffer is not defined" (Frontend)
Add this to your frontend package.json:
```json
"dependencies": {
  "buffer": "^6.0.3"
}
```

Then in your component:
```javascript
import { Buffer } from 'buffer';
window.Buffer = Buffer;
```

### Audio not being stored
1. Check browser console for errors
2. Verify audio blob is created: `console.log('Audio blob size:', audioBlob.size)`
3. Check backend logs for base64 conversion
4. Query database: `SELECT COUNT(*) FROM attempt_answers WHERE audio IS NOT NULL`

### Large database size
If storage becomes an issue:
```sql
-- Find largest audio files
SELECT 
  id,
  question_text,
  pg_size_pretty(length(audio)) as audio_size
FROM attempt_answers 
WHERE audio IS NOT NULL
ORDER BY length(audio) DESC
LIMIT 20;

-- Remove old audio (keep text answers)
UPDATE attempt_answers 
SET audio = NULL 
WHERE created_at < NOW() - INTERVAL '6 months';
```

## Size Limits

Current settings:
- No explicit limit (relies on PostgreSQL BYTEA max: 1GB)
- Recommended: Add 5-10MB limit on frontend

Add this to QuizAttempt.jsx:
```javascript
const MAX_AUDIO_SIZE = 5 * 1024 * 1024; // 5MB

if (audioBlob.size > MAX_AUDIO_SIZE) {
  alert('Recording too large. Please keep answers under 2 minutes.');
  return;
}
```

## Next Features to Implement

1. **Audio Playback in Teacher Dashboard**
   - Display audio player next to each answer
   - Show audio duration
   - Download audio button

2. **Compression**
   - Enable PostgreSQL compression for audio column
   - Use lower bitrate in MediaRecorder (32kbps)

3. **Analytics**
   - Track total audio storage usage
   - Average recording length per question
   - Students who prefer audio vs text answers

## Support

If you encounter issues:
1. Check Backend console logs
2. Check Frontend browser console
3. Verify PostgreSQL is running: `docker ps`
4. Check database connection: `docker exec -it speechify-postgres-1 psql -U postgres -d quiz_app`
