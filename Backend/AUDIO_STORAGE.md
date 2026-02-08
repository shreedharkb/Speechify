# Audio Blob Storage Implementation

## Overview
This implementation stores student audio recordings directly in PostgreSQL as BYTEA (binary) data, eliminating the need for separate file storage systems.

## Database Schema

### Table: `attempt_answers`
```sql
audio BYTEA  -- Stores the audio recording as binary data
```

## Data Flow

### 1. Frontend (Quiz Attempt)
```javascript
// Record audio → Create Blob → Convert to Base64 → Send to backend
const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
const arrayBuffer = await audioBlob.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);
const audioBase64 = buffer.toString('base64');

// Send with answer
{
  studentAnswer: "transcribed text",
  audioBlob: audioBase64
}
```

### 2. Backend (Quiz Attempt Controller)
```javascript
// Receive base64 → Convert to Buffer → Store in database
const audioBuffer = Buffer.from(audioBase64, 'base64');

// Insert into database
INSERT INTO attempt_answers (..., audio) VALUES (..., $11)
[..., audioBuffer]
```

### 3. Backend (QuizAttempt Model)
```javascript
// Retrieve from database → Convert to base64 → Send to frontend
audio: ans.audio ? ans.audio.toString('base64') : null
```

### 4. Frontend (Display Results)
```javascript
// Receive base64 → Create Blob URL → Play audio
const audioURL = createAudioURL(answer.audio, 'audio/webm');
<audio src={audioURL} controls />
```

## Migration

Run this SQL to add the audio column to existing databases:

```sql
ALTER TABLE attempt_answers ADD COLUMN audio BYTEA;
```

Or use the migration file:
```bash
psql -U postgres -d quiz_app -f Backend/migrations/001_add_audio_column.sql
```

## Storage Considerations

### Pros:
- ✅ Simple implementation (no file system management)
- ✅ ACID transactions (audio stored atomically with answers)
- ✅ Easy backup/restore (single database backup includes audio)
- ✅ No file path management or cleanup needed
- ✅ Works perfectly for campus server deployment

### Cons:
- ❌ Database size increases (typical audio: 200KB-2MB per recording)
- ❌ Slower for very large files (> 10MB)
- ❌ Database backups take longer

### Size Estimates:
```
Scenario: 1000 students × 10 quizzes × 5 questions = 50,000 recordings

Audio size per recording:
- WebM compressed: ~200KB - 500KB
- WAV uncompressed: ~1MB - 3MB

Total storage (WebM):
- Average case: 50,000 × 300KB = 15GB
- Max case: 50,000 × 500KB = 25GB

PostgreSQL can easily handle this on a campus server with 100GB storage.
```

## Optimization Tips

### 1. Compress audio on frontend before sending:
```javascript
// Use MediaRecorder with low bitrate
const recorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 32000  // 32kbps = smaller files
});
```

### 2. Set size limits:
```javascript
const MAX_AUDIO_SIZE = 5 * 1024 * 1024; // 5MB
if (audioBlob.size > MAX_AUDIO_SIZE) {
  alert('Audio recording too large. Please keep answers under 2 minutes.');
}
```

### 3. Archive old recordings:
```sql
-- Archive recordings older than 6 months to a separate table
CREATE TABLE attempt_answers_archive AS 
SELECT * FROM attempt_answers 
WHERE created_at < NOW() - INTERVAL '6 months';

UPDATE attempt_answers SET audio = NULL 
WHERE created_at < NOW() - INTERVAL '6 months';
```

### 4. Use compression (PostgreSQL 14+):
```sql
-- Enable compression for audio column (reduces storage by 20-40%)
ALTER TABLE attempt_answers 
ALTER COLUMN audio SET COMPRESSION pglz;
```

## Retrieving Audio for Playback

### Backend API Endpoint (Optional - for direct audio download):
```javascript
// GET /api/quiz-attempts/:attemptId/answer/:answerId/audio
router.get('/:attemptId/answer/:answerId/audio', async (req, res) => {
  const answer = await query(
    'SELECT audio FROM attempt_answers WHERE id = $1',
    [req.params.answerId]
  );
  
  if (!answer.rows[0].audio) {
    return res.status(404).json({ error: 'No audio found' });
  }
  
  res.set('Content-Type', 'audio/webm');
  res.send(answer.rows[0].audio);
});
```

### Frontend Playback:
```javascript
// Method 1: Direct blob URL (already implemented)
const audioURL = createAudioURL(answer.audio);
<audio src={audioURL} controls />

// Method 2: Fetch from endpoint
<audio src={`/api/quiz-attempts/${attemptId}/answer/${answerId}/audio`} controls />
```

## Security Considerations

1. **Access Control**: Only teachers can access student audio recordings
2. **Size Validation**: Enforce max file size (5-10MB)
3. **Type Validation**: Only accept audio/* MIME types
4. **Rate Limiting**: Prevent abuse of audio upload endpoints

## Performance

For 1000+ concurrent students:
- Use connection pooling (already configured)
- Add read replicas for analytics queries
- Consider caching audio URLs for frequently accessed recordings
- Monitor database size and implement archival strategy

## Alternative: Hybrid Approach

If database storage becomes an issue, implement a hybrid approach:

```javascript
// Store audio in filesystem, reference in database
const audioPath = `/uploads/audio/${quizId}/${studentId}/${questionId}.webm`;
fs.writeFileSync(audioPath, audioBuffer);

// Store only path in database
INSERT INTO attempt_answers (..., audio_path) VALUES (..., $11)
```

## Testing

```javascript
// Test audio storage
const testAudio = Buffer.from('fake audio data');
await QuizAttempt.create({
  answers: [{
    studentAnswer: 'test',
    audioBlob: testAudio
  }]
});

// Verify retrieval
const attempt = await QuizAttempt.findById(attemptId);
console.log('Audio size:', attempt.answers[0].audio.length);
```

## Files Modified

1. ✅ `Backend/init-database.sql` - Added audio BYTEA column
2. ✅ `Backend/models/QuizAttempt.js` - Handle audio in create/retrieve
3. ✅ `Backend/controllers/quizAttemptController.js` - Process audio blobs
4. ✅ `Frontend/src/components/quiz/QuizAttempt.jsx` - Store and send audio
5. ✅ `Backend/migrations/001_add_audio_column.sql` - Migration script
6. ✅ `Backend/utils/audioUtils.js` - Audio utility functions

## Next Steps

1. Run the migration on your PostgreSQL database
2. Test audio recording and submission
3. Verify audio appears in pgAdmin (attempt_answers.audio)
4. Implement audio playback in teacher dashboard
5. Add compression and size limits as needed
