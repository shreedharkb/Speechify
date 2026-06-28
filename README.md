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
  <a href="https://speechify-psi.vercel.app">
    <img src="https://img.shields.io/badge/🚀_View_Live_Deployment-speechify--psi.vercel.app-2563eb?style=for-the-badge" alt="Live Demo" />
  </a>
</div>

<br />

> **Speechify** is an enterprise-grade academic evaluation system that replaces brittle exact-match grading with **AI-driven semantic analysis**. Teachers schedule quizzes; students respond via voice or typed text. Answers are processed through a multi-layer NLP pipeline combining gibberish detection, numeric grading, and context-aware cosine similarity using **Sentence-BERT (`all-MiniLM-L6-v2`)** to return instant, explainable grades. Audio submissions are transcribed in real time via **OpenAI Whisper**, while heavy machine learning jobs run asynchronously on **Bull/Redis** workers, pushing scores back over **Socket.IO WebSockets**.

---

## 📑 Table of Contents

- [✨ Core Capabilities](#-core-capabilities)
- [🏗️ System Architecture](#-system-architecture)
- [🗄️ Database Entity-Relationship Schema](#-database-entity-relationship-schema)
- [⚡ Technical Challenges & Solutions](#-technical-challenges--solutions)
- [💻 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🔌 API Reference](#-api-reference)
- [⚙️ Environment Variables](#-environment-variables)
- [🚀 Quick Start](#-quick-start)
- [🔄 CI/CD Pipeline](#-cicd-pipeline)
- [📜 License](#-license)

---

## ✨ Core Capabilities

- **🧠 Semantic NLP Grading**: Multi-stage evaluation engine blending 60% direct answer overlap with 40% Sentence-BERT context-aware cosine similarity. Filters out gibberish and accurately evaluates synonyms and rephrased concepts.
- **🎙️ Real-Time Voice Assessment**: Students can speak their answers directly into the browser. Audio streams are captured and transcribed instantly by a dedicated **OpenAI Whisper** microservice built with FastAPI.
- **⚡ Asynchronous Bull/Redis Workers**: Computationally expensive AI similarity matrix calculations are offloaded to background job queues, ensuring the Node.js API Gateway never blocks under concurrent student exam loads.
- **📡 Instant WebSocket Notifications**: Grading results and teacher evaluations are pushed instantaneously to student browser dashboards via **Socket.IO** without polling.
- **🔐 Role-Based Access Control (RBAC)**: Isolated Teacher and Student portals secured via JWT validation and Google OAuth 2.0 single sign-on.
- **⏱️ Automated Quiz Scheduling**: Teachers define `startTime` and `endTime` windows; automated system triggers activate and terminate exams seamlessly.

---

## 🏗️ System Architecture

Speechify employs a scalable **microservices architecture** decoupling client presentation, REST routing, async queue scheduling, speech transcription, and transformer inference.

```mermaid
flowchart TD
    classDef client fill:#2563eb,stroke:#1e3a8a,color:#fff
    classDef gateway fill:#059669,stroke:#064e3b,color:#fff
    classDef queue fill:#7c3aed,stroke:#4c1d95,color:#fff
    classDef ai fill:#db2777,stroke:#831843,color:#fff
    classDef db fill:#d97706,stroke:#78350f,color:#fff

    subgraph Presentation["Client Layer"]
        React["React 19 SPA<br>Vite + Tailwind CSS"]:::client
    end

    subgraph Gateway["API Gateway Layer"]
        Express["Node.js Express API<br>RBAC / Auth / Socket.IO"]:::gateway
    end

    subgraph Async["Background Workers & Caching"]
        Bull["Bull Job Queue<br>Async Task Scheduler"]:::queue
        Redis[(Redis 7 Cache<br>Queue Store & Session State)]:::queue
    end

    subgraph Intelligence["AI Microservices Layer"]
        SBERT["Python Flask Microservice<br>Sentence-BERT (all-MiniLM-L6-v2)"]:::ai
        Whisper["Python FastAPI Microservice<br>OpenAI Whisper Transcription"]:::ai
    end

    subgraph Storage["Relational Storage Layer"]
        Prisma["Prisma ORM Client"]:::db
        Postgres[(PostgreSQL 16 Database<br>Relational Quiz & Grade Store)]:::db
    end

    %% Data Flows
    React <-->|REST API / WebSockets| Express
    React -->|Audio Upload| Whisper
    Whisper -->|Transcribed Text| Express

    Express -->|Enqueue Grading Job| Bull
    Bull <--> Redis
    Bull -->|Process Job| SBERT

    SBERT -->|Similarity Score| Express
    Express <-->|Read / Write| Prisma
    Prisma <--> Postgres

    Express -->|Socket.IO Push| React
```

---

## 🗄️ Database Entity-Relationship Schema

The platform relies on a 5-table normalized schema in PostgreSQL 16 managed through Prisma ORM. Questions and answers utilize JSONB columns for flexible quiz structuring.

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
    }

    Teacher {
        String id PK
        String email UK
        String name
        String department
    }

    Quiz {
        String id PK
        String title
        Json questions
        Json correctAnswers
        DateTime startTime
        DateTime endTime
        String teacherId FK
    }

    QuizAttempt {
        String id PK
        String studentId FK
        String quizId FK
        Json responses
        String audioRecordingUrl
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

1. **Non-Blocking ML Workloads (Bull + Redis Orchestration)**
   - **Challenge**: Calculating tensor similarity embeddings across hundreds of concurrent student submissions immediately bottlenecked the single-threaded event loop of Node.js.
   - **Solution**: Decoupled grading evaluation into asynchronous **Bull** job queues backed by **Redis**. When a student submits an exam, the API immediately responds with an acknowledgement (`202 Accepted`) and spins off a background worker. Once the SBERT microservice finishes scoring, results push live to the student via Socket.IO.

2. **Accurate Semantic Grading vs. Keywords**
   - **Challenge**: Traditional grading algorithms fail when students demonstrate understanding using synonyms or alternative sentence phrasing rather than verbatim textbook definitions.
   - **Solution**: Developed a hybrid 6-layer grading pipeline using PyTorch and `sentence-transformers`. The pipeline screens out gibberish, validates numeric constants, evaluates exact overlap (60%), and runs cosine vector comparison on `all-MiniLM-L6-v2` embeddings (40%), mirroring human teacher grading accuracy.

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

---

## 📁 Project Structure

```text
Speechify/
├── Frontend/                 # React 19 SPA built with Vite
│   ├── src/
│   │   ├── components/       # Reusable UI widgets and navigation cards
│   │   ├── pages/            # Role views (TeacherDashboard, StudentDashboard, QuizPage)
│   │   └── utils/            # Axios API interceptors and WebSocket listeners
├── Backend/                  # Node.js + Express API Gateway
│   ├── controllers/          # Domain logic (auth, quizzes, submissions, voice handling)
│   ├── middleware/           # JWT verification, RBAC guards, and 100 req/min rate limiters
│   ├── prisma/               # Prisma schema definitions and migration snapshots
│   ├── routes/               # Express API endpoints (/api/auth, /api/quiz, /api/whisper)
│   └── utils/                # Bull queue configuration and async grading worker logic
├── sbert-service/            # Python Flask Microservice for semantic evaluation
│   ├── app.py                # 6-layer grading pipeline and /batch-grade endpoints
│   └── requirements.txt      # PyTorch, sentence-transformers, Flask dependencies
├── whisper-service/          # Python FastAPI Microservice for voice transcription
│   ├── app.py                # /transcribe handler interfacing with OpenAI Whisper
│   └── requirements.txt      # FastAPI, uvicorn, openai-whisper dependencies
├── assets/                   # Architecture diagrams and schema flowcharts
├── docker-compose.yml        # Full local multi-container infrastructure definition
└── Jenkinsfile               # Automated CI/CD build, test, and security scan pipeline
```

---

## 🔌 API Reference

### Core Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user and return signed JWT + Role |
| `POST` | `/api/quiz` | Teacher | Publish a new quiz with JSON questions and schedule |
| `GET` | `/api/quiz/active/student` | Student | Fetch active quizzes within the valid time window |
| `POST` | `/api/quiz-attempt/submit` | Student | Submit quiz answers and trigger Bull grading queue |
| `POST` | `/api/whisper/transcribe` | Authenticated | Stream audio recording for instant text conversion |
| `GET` | `/api/health` | Public | Check infrastructure health across DB, Redis, and AI services |

---

## ⚙️ Environment Variables

### Backend Configuration (`Backend/.env`)

| Variable Name | Description | Required |
| :--- | :--- | :--- |
| `PORT` | Express server listen port (Default: `3001`) | No |
| `JWT_SECRET` | Cryptographic secret for signing auth tokens | Yes |
| `DATABASE_URL` | PostgreSQL connection string (`postgresql://user:pass@host:5432/db`) | Yes |
| `REDIS_URL` | Redis cache and queue connection URL (`redis://localhost:6379`) | Yes |
| `SBERT_SERVICE_URL` | SBERT microservice URL (`http://localhost:5002`) | Yes |
| `WHISPER_SERVICE_URL` | Whisper transcription service URL (`http://localhost:5000`) | Yes |
| `FRONTEND_URL` | Allowed CORS origin (`http://localhost:5173`) | Yes |

### Frontend Configuration (`Frontend/.env`)

| Variable Name | Description | Required |
| :--- | :--- | :--- |
| `VITE_API_URL` | Target Backend API base path (`http://localhost:3001`) | Yes |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 public client ID | No |

---

## 🚀 Quick Start

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

## 🔄 CI/CD Pipeline

The project includes an automated `Jenkinsfile` orchestrating a 6-stage verification pipeline:

```mermaid
flowchart LR
    A[Git Checkout] --> B[npm install]
    B --> C[SonarQube Analysis]
    C --> D[OWASP Dependency Check]
    D --> E[Trivy Vulnerability Scan]
    E --> F[Docker Build & Push]
```

---

## 📜 License

This project is licensed under the **MIT License**.

---

<div align="center">
  <p>Built with ❤️ by <strong>Shreedhar K B</strong></p>
</div>
