# Speechify

AI-powered quiz platform that uses semantic understanding to grade student answers based on meaning, not exact word matching.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

## What is Speechify?

Speechify transforms quiz grading by understanding **what students mean**, not just what they write. Using Sentence-BERT AI models, it evaluates answers semantically — so "Plants make food using sunlight" and "Photosynthesis converts light energy" both get marked correct.

**The Problem:**
```
✗ Traditional System
  Correct: "Photosynthesis is the process plants use to convert sunlight into energy"
  Student: "Plants make food using light from the sun"
  Result: ❌ Wrong (doesn't match exactly)

✓ Speechify
  Correct: "Photosynthesis is the process plants use to convert sunlight into energy"
  Student: "Plants make food using light from the sun"
  Result: ✅ Correct (85% semantic similarity)
```

## Key Features

- **🤖 AI Semantic Grading** - Sentence-BERT evaluates meaning, not exact words
- **👨‍🏫 Teacher Portal** - Create, schedule, and manage quizzes with time restrictions
- **👨‍🎓 Student Portal** - Take quizzes and receive instant AI-graded feedback
- **🎙️ Voice Transcription** - Optional Whisper AI integration for spoken answers
- **📊 Real-time Results** - Instant grading with detailed explanations
- **🔐 Secure Authentication** - JWT-based auth with role-based access control
- **🐳 Docker Ready** - Complete containerized setup with Docker Compose

## Tech Stack

**Frontend:** React 19, Vite, Axios  
**Backend:** Node.js 18+, Express 4, PostgreSQL 16  
**AI Services:** Sentence-BERT (all-MiniLM-L6-v2), OpenAI Whisper (base)  
**DevOps:** Docker, Docker Compose

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Python 3.9+ (for AI services)

### Installation

1. **Clone and navigate to the project**
   ```bash
   git clone <your-repo-url>
   cd speechify
   ```

2. **Start AI services and database**
   ```bash
   docker-compose up -d
   ```
   This starts PostgreSQL, SBERT grading service, and Whisper transcription service.

3. **Configure backend environment**
   
   Create `Backend/.env`:
   ```env
   PORT=3001
   JWT_SECRET=your_secret_key_change_this_in_production
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=quiz_admin
   DB_PASSWORD=quiz_secure_password
   DB_NAME=quiz_app
   SBERT_SERVICE_URL=http://localhost:5002
   WHISPER_SERVICE_URL=http://localhost:5000
   ```

4. **Start the backend**
   ```bash
   cd Backend
   npm install
   npm start
   ```

5. **Start the frontend**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Database: localhost:5432

## Usage Examples

### For Teachers

1. **Sign up** with role "teacher"
2. **Create a quiz** with title, subject, and scheduling
3. **Add questions** with correct answers and point values
4. **Publish** — students can now take it during the active period

```javascript
// Example: Create quiz via API
POST /api/quiz
{
  "title": "Biology 101 Midterm",
  "subject": "Biology",
  "start_time": "2026-03-01T09:00:00Z",
  "end_time": "2026-03-01T10:30:00Z",
  "questions": [
    {
      "question_text": "What is photosynthesis?",
      "correct_answer_text": "The process plants use to convert sunlight into energy",
      "points": 10
    }
  ]
}
```

### For Students

1. **Sign up** with role "student"
2. **View available quizzes** during their active time
3. **Take a quiz** by submitting text answers
4. **Get instant results** with AI similarity scores and explanations

```javascript
// Example: Submit quiz answers via API
POST /api/quiz-attempt/submit
{
  "attemptId": 42,
  "answers": [
    {
      "questionId": 1,
      "studentAnswer": "Plants make food from sunlight"
    }
  ]
}

// Response includes AI grading
{
  "score": 85.42,
  "results": [
    {
      "question": "What is photosynthesis?",
      "studentAnswer": "Plants make food from sunlight",
      "correctAnswer": "The process plants use to convert sunlight into energy",
      "similarityScore": 0.8542,
      "isCorrect": true,
      "pointsEarned": 8.5,
      "explanation": "Good match - core concepts are the same"
    }
  ]
}
```

### Testing AI Grading

Test the SBERT service directly:

```bash
curl -X POST http://localhost:5002/grade \
  -H "Content-Type: application/json" \
  -d '{
    "student_answer": "Plants make food from sunlight",
    "correct_answer": "Photosynthesis converts sunlight to energy"
  }'
```

Response:
```json
{
  "similarity_score": 0.8542,
  "is_correct": true,
  "explanation": "Good match - core concepts are the same"
}
```

## How AI Grading Works

1. **Encoding**: Student and correct answers are converted to 768-dimensional semantic vectors using Sentence-BERT
2. **Comparison**: Cosine similarity calculated between vectors (0.0 - 1.0 scale)
3. **Scoring**: 
   - ≥0.95: Excellent match
   - 0.90-0.95: Very strong match
   - 0.85-0.90: Good match (passing threshold)
   - <0.85: Needs improvement

The AI model (`all-MiniLM-L6-v2`) runs locally on your machine — no external API calls, completely private.

## API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | Register new user (student/teacher) |
| `/api/auth/login` | POST | Login and receive JWT token |
| `/api/quiz` | POST | Create new quiz (teachers only) |
| `/api/quiz` | GET | List all quizzes |
| `/api/quiz/:id` | GET | Get single quiz details |
| `/api/quiz/active/student` | GET | Get currently active quizzes (students) |
| `/api/quiz-attempt/start` | POST | Start quiz attempt |
| `/api/quiz-attempt/submit` | POST | Submit quiz answers for AI grading |
| `/api/quiz-attempt/:attemptId/results` | GET | Retrieve attempt results |
| `/api/whisper/transcribe` | POST | Transcribe audio to text |

**Authentication**: Include JWT token in `Authorization: Bearer <token>` header for protected routes.

For detailed API documentation, see [Backend/README.md](Backend/README.md) (if available).

## Project Structure

```
Speechify/
├── Frontend/              # React application (Vite)
│   ├── src/
│   │   ├── pages/         # Page components (Login, Dashboard, etc.)
│   │   └── components/    # Reusable UI components
│   └── package.json
│
├── Backend/               # Express.js API server
│   ├── server.js          # Main server entry point
│   ├── routes/            # API route definitions
│   ├── controllers/       # Request handlers and business logic
│   ├── middleware/        # Auth, validation middleware
│   ├── config/            # Database configuration
│   ├── init-database.sql  # PostgreSQL schema
│   └── package.json
│
├── sbert-service/         # Flask app for AI semantic grading
│   ├── app.py             # SBERT similarity API
│   ├── requirements.txt
│   └── Dockerfile
│
├── whisper-service/       # FastAPI app for speech-to-text
│   ├── app.py             # Whisper transcription API
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml     # Orchestrates all services
├── PROJECT_HISTORY.md     # Detailed project evolution and decisions
└── README.md              # This file
```

## Database Schema

Speechify uses PostgreSQL with five main tables:

- **users**: Student and teacher accounts with bcrypt-hashed passwords
- **quiz_events**: Quizzes with scheduling (start_time, end_time)
- **questions**: Quiz questions with correct answers and point values
- **quiz_attempts**: Student attempts (one per student per quiz)
- **attempt_answers**: Individual answer records with AI similarity scores

See [Backend/init-database.sql](Backend/init-database.sql) for the complete schema.

## Deployment

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

1. **PostgreSQL**: Set up database using `Backend/init-database.sql`
2. **Backend**: `cd Backend && npm install && node server.js`
3. **Frontend**: `cd Frontend && npm install && npm run build && npm run preview`
4. **AI Services**:
   ```bash
   # SBERT
   cd sbert-service && pip install -r requirements.txt && python app.py
   
   # Whisper
   cd whisper-service && pip install -r requirements.txt && uvicorn app:app
   ```

### Environment Variables

Configure these in `Backend/.env`:

- `PORT`: Backend server port (default: 3001)
- `JWT_SECRET`: Secret key for JWT signing (change in production!)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: PostgreSQL connection
- `SBERT_SERVICE_URL`: URL for semantic grading service (default: http://localhost:5002)
- `WHISPER_SERVICE_URL`: URL for transcription service (default: http://localhost:5000)

## Documentation

- **Project History**: See [PROJECT_HISTORY.md](PROJECT_HISTORY.md) for complete development timeline and technical decisions
- **Audio Storage**: See [SETUP_AUDIO_STORAGE.md](SETUP_AUDIO_STORAGE.md) for audio file handling details
- **Database Migrations**: See [Backend/PRISMA_MIGRATION_GUIDE.md](Backend/PRISMA_MIGRATION_GUIDE.md) for schema evolution

## Support

- **Issues**: Open an issue on GitHub for bug reports or feature requests
- **Discussions**: Use GitHub Discussions for questions and community support
- **Documentation**: Check the `docs/` folder and linked markdown files

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Make your changes and commit: `git commit -m 'Add YourFeature'`
4. Push to your fork: `git push origin feature/YourFeature`
5. Open a Pull Request with a clear description

Please ensure your code follows the existing style and includes appropriate tests.

## Who Maintains This?

This project is actively maintained by the Speechify development team. See [PROJECT_HISTORY.md](PROJECT_HISTORY.md) for contributor information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Built for better education through AI** 🎓
