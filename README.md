<div align="center">
  <br />
  <a href="https://speechify-psi.vercel.app">
    <img src="Frontend/public/favicon.svg" alt="Speechify Logo" width="100" />
  </a>
  <h1>Speechify</h1>
  <p><strong>AI-Powered Semantic Quiz Grading & Voice Assessment Platform</strong></p>
  <br />

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
    <img src="https://img.shields.io/badge/PostgreSQL_16-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Python_3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
    <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
    <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  </p>

  <br />

  <!-- Deployment Badges -->
  <p>
    <a href="https://speechify-psi.vercel.app">
      <img src="https://img.shields.io/badge/Frontend-speechify--psi.vercel.app-2563eb?style=for-the-badge&logo=vercel&logoColor=white" alt="Frontend Live" />
    </a>
    <a href="https://speechify-api.onrender.com">
      <img src="https://img.shields.io/badge/Backend_API-speechify--api.onrender.com-059669?style=for-the-badge&logo=render&logoColor=white" alt="Backend Live" />
    </a>
  </p>
</div>

<br />

> **Speechify** is an enterprise-grade academic evaluation system that replaces brittle exact-match grading with **AI-driven semantic analysis**. Teachers schedule quizzes; students respond via voice or typed text. Answers are processed through a multi-layer NLP pipeline combining gibberish detection, numeric grading, and context-aware cosine similarity using **Sentence-BERT (`all-MiniLM-L6-v2`)** to return instant, explainable grades. Audio submissions are transcribed in real time via **OpenAI Whisper**, while heavy machine learning jobs run asynchronously on **Bull/Redis** workers, pushing scores back over **Socket.IO WebSockets**.

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🗄️ Database Schema](#️-database-schema)
- [⚡ Technical Challenges & Solutions](#-technical-challenges--solutions)
- [💻 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🔌 API Reference](#-api-reference)
- [⚙️ Environment Variables](#️-environment-variables)
- [🚀 Quick Start](#-quick-start)
- [☁️ Deployment](#️-deployment)
- [🔄 CI/CD Pipeline](#-cicd-pipeline)
- [📜 License](#-license)

---

## ✨ Features

**Semantic NLP Grading**
Every student answer goes through a 6-layer PyTorch grading pipeline: gibberish filtering → stopword stripping → numeric constant validation → exact keyword overlap (60%) → Sentence-BERT cosine similarity on `all-MiniLM-L6-v2` embeddings (40%). This mirrors human teacher grading accuracy while accepting valid synonyms and rephrased concepts.

**Real-Time Voice Assessment**
Students speak directly into the browser. Audio blobs are streamed as multipart form-data to a dedicated Python FastAPI microservice running OpenAI Whisper, returning a clean transcription within seconds that feeds directly into the grading pipeline.

**Async Bull/Redis Grading Queue**
Exam submissions are never processed synchronously. The Express API Gateway immediately enqueues a `{attemptId, answers}` job and returns `202 Accepted`. A background Node.js worker dequeues the job, fans out calls to the SBERT microservice, and writes evaluated scores — preventing event-loop starvation under concurrent exam loads.

**Instant WebSocket Score Broadcast**
Once grading completes, the worker emits `evaluation_complete` on the Socket.IO server, pushing `{score, feedback, questionResults}` directly to the student's browser dashboard — no polling required.

**Role-Based Access Control (RBAC)**
Isolated Teacher and Student portals secured via JWT validation middleware and Google OAuth 2.0 single sign-on. Every route is guarded at the middleware layer before any controller logic executes.

**Automated Quiz Scheduling**
Teachers define `startTime` and `endTime` windows per quiz. Automated system triggers activate and terminate exams seamlessly — active quizzes are only visible to students within the valid window.

---

## 🏗️ System Architecture

Speechify employs a scalable **microservices architecture** decoupling client presentation, REST routing, async queue scheduling, speech transcription, and transformer inference into independent, individually deployable services.

```mermaid
flowchart TD
    classDef client fill:#2563eb,stroke:#1e3a8a,color:#fff
    classDef gateway fill:#059669,stroke:#064e3b,color:#fff
    classDef queue fill:#7c3aed,stroke:#4c1d95,color:#fff
    classDef ai fill:#db2777,stroke:#831843,color:#fff
    classDef db fill:#d97706,stroke:#78350f,color:#fff
    classDef deploy fill:#0f766e,stroke:#134e4a,color:#fff

    ReactSPA["⚛️ React 19 SPA<br>Teacher & Student Dashboards<br>Deployed: Vercel"]:::client

    subgraph ExpressGateway["🟢 Node.js Express API Gateway (:3001) — Render.com"]
        AuthRoute["POST /api/auth/login<br>JWT & Google OAuth 2.0"]:::gateway
        QuizRoute["POST /api/quiz<br>Quiz Creator & Scheduler"]:::gateway
        AttemptRoute["POST /api/quiz-attempt/submit<br>Answer Submission Handler"]:::gateway
        WhisperProxy["POST /api/whisper/transcribe<br>Audio Proxy & Streamer"]:::gateway
        SocketServer["Socket.IO WebSocket Server<br>Real-Time Score Broadcaster"]:::gateway
        RateLimiter["100 req/min IP Rate Limiter<br>Global API Guard"]:::gateway
    end

    ReactSPA -->|"HTTPS / REST"| RateLimiter
    RateLimiter --> AuthRoute
    RateLimiter --> QuizRoute
    RateLimiter --> AttemptRoute
    RateLimiter --> WhisperProxy
    ReactSPA <-->|"WebSocket<br>ws://api:3001"| SocketServer

    subgraph Microservices["🤖 AI Microservices Cluster — Render.com"]
        WhisperService["🎙️ Python FastAPI (:5000)<br>OpenAI Whisper<br>Speech-to-Text Engine"]:::ai
        SBERTService["🧠 Python Flask (:5002)<br>6-Layer SBERT Pipeline<br>all-MiniLM-L6-v2"]:::ai
    end

    WhisperProxy -->|"Multipart Audio Blob<br>.wav / .webm"| WhisperService
    WhisperService -->|"Transcribed String"| WhisperProxy

    subgraph AsyncOrchestration["⚡ Bull / Redis Async Grading Engine"]
        BullQueue["Bull Job Queue<br>grading-queue"]:::queue
        RedisCache[("🔴 Redis 7 (:6379)<br>Job Store & Session Cache")]:::queue
        GradingWorker["Node.js Grading Worker<br>Background Consumer"]:::queue
    end

    AttemptRoute -->|"Enqueue<br>{attemptId, answers}"| BullQueue
    BullQueue <-->|"Persistence"| RedisCache
    BullQueue -->|"Dequeue Job"| GradingWorker
    GradingWorker -->|"POST /batch-grade<br>{studentAnswer, correctAnswer}"| SBERTService
    SBERTService -->|"Cosine Similarity Scores<br>+ Pass/Fail per Question"| GradingWorker

    subgraph DataStorage["🗄️ Relational Data Store — Render PostgreSQL"]
        PrismaORM["Prisma 7 ORM<br>Connection Pool"]:::db
        PostgreSQL[("🐘 PostgreSQL 16 (:5432)<br>Users · Quizzes<br>Submissions · Evaluations")]:::db
    end

    AuthRoute <-->|"Verify & Issue JWT"| PrismaORM
    QuizRoute <-->|"Store JSONB Questions"| PrismaORM
    AttemptRoute -->|"Save Pending Submission"| PrismaORM
    GradingWorker -->|"Persist Evaluation Marks<br>& Cosine Similarity %"| PrismaORM
    PrismaORM <--> PostgreSQL

    GradingWorker -->|"Emit 'evaluation_complete'<br>{score, feedback}"| SocketServer
    SocketServer -->|"Push Score Live"| ReactSPA
```

---

## 🗄️ Database Schema

The platform relies on a **5-table normalized schema** in PostgreSQL 16 managed through Prisma ORM. `questions` and `correctAnswers` utilize `JSONB` columns for flexible quiz structuring without schema migrations per quiz type. `questionResults` stores per-question breakdowns with cosine similarity percentages.

```mermaid
erDiagram
    Teacher ||--o{ Quiz : "creates"
    Student ||--o{ QuizAttempt : "submits"
    Quiz ||--o{ QuizAttempt : "receives"
    QuizAttempt ||--|| SubmissionEvaluation : "generates"

    Student {
        String id PK
        String email UK
        String name
        String rollNumber
        String branch
        Int semester
        DateTime createdAt
    }

    Teacher {
        String id PK
        String email UK
        String name
        String department
        DateTime createdAt
    }

    Quiz {
        String id PK
        String title
        Json questions
        Json correctAnswers
        DateTime startTime
        DateTime endTime
        String teacherId FK
        DateTime createdAt
    }

    QuizAttempt {
        String id PK
        String studentId FK
        String quizId FK
        Json responses
        String audioRecordingUrl
        String status
        DateTime submittedAt
    }

    SubmissionEvaluation {
        String id PK
        String attemptId FK
        Json questionResults
        Float totalScore
        Float semanticSimilarity
        DateTime evaluatedAt
    }
```

---

## ⚡ Technical Challenges & Solutions

**1. Non-Blocking ML Workloads (Bull + Redis Orchestration)**

- **Challenge**: Calculating tensor similarity embeddings across hundreds of concurrent student submissions immediately bottlenecked the single-threaded event loop of Node.js. A synchronous SBERT call per submission would cause timeouts and cascading failures.
- **Solution**: Decoupled grading evaluation into asynchronous **Bull** job queues backed by **Redis**. When a student submits an exam, the API immediately responds with `202 Accepted` and spins off a background worker. Once the SBERT microservice finishes scoring, results push live to the student via Socket.IO — the HTTP request chain is never held open.

**2. Accurate Semantic Grading vs. Keyword Matching**

- **Challenge**: Traditional grading algorithms fail when students demonstrate understanding using synonyms or alternative sentence phrasing rather than verbatim textbook definitions (e.g., "H₂O boils at 100°C" vs. "water's boiling point is 100 degrees Celsius").
- **Solution**: Developed a hybrid **6-layer grading pipeline** using PyTorch and `sentence-transformers`. The pipeline screens out gibberish inputs, validates numeric constants independently, evaluates direct keyword overlap (60%), and runs cosine vector comparison on `all-MiniLM-L6-v2` embeddings (40%), producing a combined weighted score that mirrors human teacher grading accuracy.

**3. Real-Time Score Delivery Without Polling**

- **Challenge**: Students needed to see their grades appear instantly without manually refreshing the page or implementing costly server-side polling.
- **Solution**: Integrated **Socket.IO v4** bidirectional WebSockets. The Express server maintains a room per student session; once the background grading worker persists results to PostgreSQL, it emits `evaluation_complete` directly into the student's room, delivering scores within milliseconds of computation finishing.

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** & **Vite 6** | Fast single-page application with concurrent rendering and role-based views |
| **Styling & UI** | **Tailwind CSS** & **Axios** | Responsive layout styling and streamlined REST API communication |
| **API Gateway** | **Node.js** & **Express 4** | Central gateway routing requests, enforcing JWT auth, and handling rate limits |
| **Real-Time Engine** | **Socket.IO v4** | Bidirectional WebSocket communication for instant score broadcast |
| **Async Queues** | **Bull 4** & **Redis 7** | In-memory job orchestration preventing server blocking during ML evaluations |
| **Semantic AI Engine** | **Python Flask** & **Sentence-BERT** | Microservice running PyTorch `all-MiniLM-L6-v2` semantic cosine similarity |
| **Speech-to-Text** | **Python FastAPI** & **OpenAI Whisper** | Microservice capturing student audio streams and returning transcriptions |
| **Database & ORM** | **PostgreSQL 16** & **Prisma 7** | Strongly typed relational persistence for student identities and evaluations |
| **DevOps & CI/CD** | **Docker Compose** & **Jenkins** | Containerized orchestration with automated vulnerability and CVE scanning |
| **Deployment** | **Vercel** (Frontend) & **Render.com** (Backend + Services) | Zero-downtime cloud deployment with managed PostgreSQL |

---

## 📁 Project Structure

```text
Speechify/
├── Frontend/                 # React 19 SPA built with Vite
│   ├── src/
│   │   ├── components/       # Reusable UI widgets and navigation cards
│   │   ├── pages/            # Role views (TeacherDashboard, StudentDashboard, QuizPage)
│   │   └── utils/            # Axios API interceptors and WebSocket listeners
│   └── public/               # Static assets and favicon
├── Backend/                  # Node.js + Express API Gateway
│   ├── controllers/          # Domain logic (auth, quizzes, submissions, voice handling)
│   ├── middleware/           # JWT verification, RBAC guards, 100 req/min rate limiters
│   ├── prisma/               # Prisma schema definitions and migration snapshots
│   ├── routes/               # Express API endpoints (/api/auth, /api/quiz, /api/whisper)
│   └── utils/                # Bull queue configuration and async grading worker logic
├── sbert-service/            # Python Flask Microservice — semantic evaluation
│   ├── app.py                # 6-layer grading pipeline and /batch-grade endpoint
│   └── requirements.txt      # PyTorch, sentence-transformers, Flask dependencies
├── whisper-service/          # Python FastAPI Microservice — voice transcription
│   ├── app.py                # /transcribe handler interfacing with OpenAI Whisper
│   └── requirements.txt      # FastAPI, uvicorn, openai-whisper dependencies
├── assets/                   # Architecture diagrams and schema flowcharts
├── docker-compose.yml        # Full local multi-container infrastructure definition
├── render.yaml               # Render.com cloud deployment configuration
└── Jenkinsfile               # Automated CI/CD build, test, and security scan pipeline
```

---

## 🔌 API Reference

### Core Endpoints

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user and return signed JWT + Role |
| `POST` | `/api/auth/google` | Public | Google OAuth 2.0 callback — issue JWT for SSO |
| `POST` | `/api/quiz` | Teacher | Publish a new quiz with JSONB questions and time window |
| `GET` | `/api/quiz/active/student` | Student | Fetch quizzes active within the current time window |
| `GET` | `/api/quiz/:id` | Authenticated | Fetch a single quiz's questions by ID |
| `POST` | `/api/quiz-attempt/submit` | Student | Submit quiz answers and trigger Bull grading queue |
| `GET` | `/api/quiz-attempt/results/:id` | Authenticated | Fetch evaluated results for a specific attempt |
| `POST` | `/api/whisper/transcribe` | Authenticated | Stream audio recording for instant Whisper transcription |
| `GET` | `/api/health` | Public | Check infrastructure health across DB, Redis, and AI services |

---

## ⚙️ Environment Variables

### Backend Configuration (`Backend/.env`)

| Variable | Description | Required |
| :--- | :--- | :--- |
| `PORT` | Express server listen port (Default: `3001`) | No |
| `JWT_SECRET` | Cryptographic secret for signing auth tokens | Yes |
| `DATABASE_URL` | PostgreSQL connection string (`postgresql://user:pass@host:5432/db`) | Yes |
| `REDIS_URL` | Redis cache and queue connection URL (`redis://localhost:6379`) | Yes |
| `SBERT_SERVICE_URL` | SBERT microservice base URL (`http://localhost:5002`) | Yes |
| `WHISPER_SERVICE_URL` | Whisper transcription service URL (`http://localhost:5000`) | Yes |
| `FRONTEND_URL` | Allowed CORS origin (`http://localhost:5173` or Vercel URL) | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 public client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 private client secret | No |

### Frontend Configuration (`Frontend/.env`)

| Variable | Description | Required |
| :--- | :--- | :--- |
| `VITE_API_URL` | Target Backend API base path (`http://localhost:3001`) | Yes |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 public client ID | No |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+, Python 3.9+, Docker & Docker Compose

### 1. Clone Repository & Start Containers

Launch PostgreSQL, Redis, SBERT, and Whisper microservices via Docker Compose:

```bash
git clone https://github.com/shreedharkb/Speechify.git
cd Speechify
docker-compose up -d --build
```

### 2. Configure Backend & Synchronize Database

```bash
cd Backend
cp .env.example .env
# Edit .env with your DATABASE_URL, REDIS_URL, JWT_SECRET, etc.
npm install
npx prisma migrate dev
npm run dev
```

### 3. Launch Frontend Client

```bash
cd ../Frontend
npm install
npm run dev
```

Navigate to [http://localhost:5173](http://localhost:5173) to start evaluating quizzes!

---

## ☁️ Deployment

Speechify is fully deployed across two cloud platforms:

| Service | Platform | URL |
| :--- | :--- | :--- |
| **Frontend (React SPA)** | Vercel | [speechify-psi.vercel.app](https://speechify-psi.vercel.app) |
| **Backend API (Express)** | Render.com | [speechify-api.onrender.com](https://speechify-api.onrender.com) |
| **SBERT Microservice** | Render.com | Internal (Render private networking) |
| **Whisper Microservice** | Render.com | Internal (Render private networking) |
| **PostgreSQL 16** | Render Managed DB | Internal (Render private networking) |

The `render.yaml` in the root of this repository declaratively defines all four Render.com services and the managed PostgreSQL database. Internal services (SBERT, Whisper) communicate over Render's private network using zero-latency internal URLs — no public exposure.

---

## 🔄 CI/CD Pipeline

The project includes an automated `Jenkinsfile` orchestrating a **6-stage verification pipeline** covering dependency audit, static analysis, container vulnerability scanning, and Docker image build & push:

```mermaid
flowchart LR
    A["🔄 Git Checkout<br>Pull source from SCM"] --> B["📦 npm install<br>Install dependencies"]
    B --> C["🔍 SonarQube Analysis<br>Static code quality scan"]
    C --> D["🛡️ OWASP Dependency Check<br>CVE vulnerability audit"]
    D --> E["🔬 Trivy Vulnerability Scan<br>Container image security scan"]
    E --> F["🐳 Docker Build & Push<br>Build & push to registry"]
```

---

## 📜 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with ❤️ by <strong>Shreedhar K B</strong></p>
</div>
