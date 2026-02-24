# Backend Container Setup Guide

## Complete Installation Guide for New Systems

This documentation provides step-by-step instructions to set up the Speechify backend infrastructure using Docker containers on a new system.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Prerequisites Installation](#prerequisites-installation)
   - [Windows](#windows-installation)
   - [macOS](#macos-installation)
   - [Linux (Ubuntu/Debian)](#linux-installation)
3. [Project Setup](#project-setup)
4. [Docker Container Architecture](#docker-container-architecture)
5. [Starting the Containers](#starting-the-containers)
6. [Verifying the Installation](#verifying-the-installation)
7. [Environment Configuration](#environment-configuration)
8. [Container Management](#container-management)
9. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements

| Component | Requirement |
|-----------|-------------|
| **CPU** | 4 cores (x64 architecture) |
| **RAM** | 8 GB minimum (16 GB recommended) |
| **Storage** | 20 GB free space |
| **OS** | Windows 10/11, macOS 11+, Ubuntu 20.04+ |

### Recommended Requirements

| Component | Requirement |
|-----------|-------------|
| **CPU** | 8+ cores |
| **RAM** | 16 GB or more |
| **Storage** | 50 GB SSD |
| **Network** | Stable internet for initial model downloads |

### Port Requirements

Ensure these ports are available (not used by other applications):

| Port | Service | Description |
|------|---------|-------------|
| `3001` | Backend API | Node.js Express server |
| `5000` | Whisper Service | Audio transcription API |
| `5002` | SBERT Service | Semantic grading API |
| `5432` | PostgreSQL | Database server |
| `6379` | Redis | Caching and queue server |
| `5173` | Frontend (Vite) | Development server |

---

## Prerequisites Installation

### Windows Installation

#### Step 1: Install Docker Desktop

1. **Download Docker Desktop**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Click "Download for Windows"

2. **Run the installer**
   ```
   Double-click Docker Desktop Installer.exe
   ```

3. **Configuration during installation**
   - ✅ Enable "Use WSL 2 instead of Hyper-V" (recommended)
   - ✅ Enable "Add shortcut to desktop"

4. **Complete installation**
   - Click "Close and restart" when prompted
   - After restart, Docker Desktop will start automatically

5. **Verify installation**
   ```powershell
   docker --version
   # Expected: Docker version 24.x.x or higher
   
   docker-compose --version
   # Expected: Docker Compose version v2.x.x
   ```

#### Step 2: Enable WSL 2 (if not already enabled)

1. **Open PowerShell as Administrator**
   ```powershell
   # Enable WSL feature
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   
   # Enable Virtual Machine Platform
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   ```

2. **Restart your computer**

3. **Set WSL 2 as default**
   ```powershell
   wsl --set-default-version 2
   ```

4. **Install Ubuntu (optional but recommended)**
   ```powershell
   wsl --install -d Ubuntu
   ```

#### Step 3: Install Node.js

1. **Download Node.js**
   - Visit: https://nodejs.org/
   - Download the LTS version (18.x or higher)

2. **Run the installer**
   - Accept the license agreement
   - Use default installation path
   - ✅ Check "Automatically install necessary tools"

3. **Verify installation**
   ```powershell
   node --version
   # Expected: v18.x.x or higher
   
   npm --version
   # Expected: 9.x.x or higher
   ```

#### Step 4: Install Git

1. **Download Git**
   - Visit: https://git-scm.com/download/win
   - Download 64-bit Git for Windows Setup

2. **Run the installer**
   - Use default settings
   - Select "Git from the command line and also from 3rd-party software"
   - Select "Use the OpenSSL library"

3. **Verify installation**
   ```powershell
   git --version
   # Expected: git version 2.x.x
   ```

---

### macOS Installation

#### Step 1: Install Homebrew (Package Manager)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installation, add Homebrew to PATH:
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

#### Step 2: Install Docker Desktop

**Option A: Using Homebrew (Recommended)**
```bash
brew install --cask docker
```

**Option B: Manual Download**
1. Visit: https://www.docker.com/products/docker-desktop/
2. Download for Mac (Apple Silicon or Intel)
3. Drag Docker.app to Applications folder
4. Launch Docker from Applications

**Verify installation:**
```bash
docker --version
docker-compose --version
```

#### Step 3: Install Node.js

```bash
brew install node@18

# Verify
node --version
npm --version
```

#### Step 4: Install Git

```bash
brew install git

# Verify
git --version
```

---

### Linux Installation

#### Ubuntu/Debian Systems

#### Step 1: Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

#### Step 2: Install Docker

```bash
# Remove old versions
sudo apt remove docker docker-engine docker.io containerd runc

# Install prerequisites
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

#### Step 3: Configure Docker (Non-root Access)

```bash
# Create docker group
sudo groupadd docker

# Add your user to docker group
sudo usermod -aG docker $USER

# Apply group changes (or log out and back in)
newgrp docker

# Verify
docker run hello-world
```

#### Step 4: Install Docker Compose

```bash
# Docker Compose is now included as a plugin, but you can also install standalone:
sudo apt install -y docker-compose

# Verify
docker compose version
# OR
docker-compose --version
```

#### Step 5: Install Node.js

```bash
# Install Node.js 18.x using NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

#### Step 6: Install Git

```bash
sudo apt install -y git

# Verify
git --version
```

---

## Project Setup

### Step 1: Clone the Repository

```bash
# Clone the project
git clone <repository-url> speechify
cd speechify
```

### Step 2: Create Backend Environment File

Create the file `Backend/.env` with the following content:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=quiz_admin
DB_PASSWORD=quiz_secure_password
DB_NAME=quiz_app

# Prisma Database URL (constructed from above)
DATABASE_URL=postgresql://quiz_admin:quiz_secure_password@localhost:5432/quiz_app

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# AI Services
SBERT_SERVICE_URL=http://localhost:5002
WHISPER_SERVICE_URL=http://localhost:5000

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=52428800
```

### Step 3: Create Frontend Environment File (Optional)

Create `Frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

---

## Docker Container Architecture

The application uses 4 Docker containers:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DOCKER COMPOSE NETWORK                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐      ┌─────────────────────┐                       │
│  │   WHISPER-SERVICE   │      │    SBERT-SERVICE    │                       │
│  │   (whisper-trans.)  │      │   (sbert-grading)   │                       │
│  ├─────────────────────┤      ├─────────────────────┤                       │
│  │ Port: 5000          │      │ Port: 5002          │                       │
│  │ Image: python:3.10  │      │ Image: python:3.10  │                       │
│  │ Model: Whisper base │      │ Model: MiniLM-L6-v2 │                       │
│  │ Workers: 4          │      │ Workers: 8          │                       │
│  │ Memory: 4GB         │      │ Memory: 4GB         │                       │
│  └─────────────────────┘      └─────────────────────┘                       │
│                                                                             │
│  ┌─────────────────────┐      ┌─────────────────────┐                       │
│  │     POSTGRESQL      │      │       REDIS         │                       │
│  │   (quiz-postgres)   │      │    (quiz-redis)     │                       │
│  ├─────────────────────┤      ├─────────────────────┤                       │
│  │ Port: 5432          │      │ Port: 6379          │                       │
│  │ Image: postgres:16  │      │ Image: redis:7      │                       │
│  │ DB: quiz_app        │      │ Memory: 256MB       │                       │
│  │ Max Conn: 200       │      │ Persistence: AOF    │                       │
│  └─────────────────────┘      └─────────────────────┘                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Container Details

#### 1. Whisper Service (`whisper-transcription`)

| Property | Value |
|----------|-------|
| **Purpose** | Audio-to-text transcription |
| **Port** | 5000 |
| **Base Image** | `python:3.10-slim` |
| **AI Model** | `faster-whisper` (base model) |
| **Framework** | FastAPI + Uvicorn |
| **Workers** | 4 concurrent |
| **Memory Limit** | 4 GB |
| **CPU Limit** | 4 cores |

**Dependencies:**
- `faster-whisper==1.1.0`
- `fastapi==0.104.1`
- `uvicorn==0.24.0`
- FFmpeg (system dependency)

**Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/transcribe` | POST | Transcribe audio file |

#### 2. SBERT Service (`sbert-grading`)

| Property | Value |
|----------|-------|
| **Purpose** | Semantic answer grading |
| **Port** | 5002 |
| **Base Image** | `python:3.10-slim` |
| **AI Model** | `all-MiniLM-L6-v2` |
| **Framework** | Flask + Gunicorn |
| **Workers** | 8 (gevent) |
| **Memory Limit** | 4 GB |
| **CPU Limit** | 4 cores |

**Dependencies:**
- `sentence-transformers==2.7.0`
- `torch==2.2.0`
- `flask==3.0.0`
- `gunicorn==21.2.0`

**Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/grade` | POST | Grade answer semantically |

#### 3. PostgreSQL (`quiz-postgres-db`)

| Property | Value |
|----------|-------|
| **Purpose** | Primary database |
| **Port** | 5432 |
| **Image** | `postgres:16-alpine` |
| **Database** | `quiz_app` |
| **User** | `quiz_admin` |
| **Max Connections** | 200 |
| **Shared Buffers** | 256 MB |

**Configuration:**
- Auto-initialization via `init-database.sql`
- Persistent volume for data
- Health check every 10 seconds

#### 4. Redis (`quiz-redis`)

| Property | Value |
|----------|-------|
| **Purpose** | Caching & job queues |
| **Port** | 6379 |
| **Image** | `redis:7-alpine` |
| **Max Memory** | 256 MB |
| **Eviction Policy** | `allkeys-lru` |
| **Persistence** | AOF (Append Only File) |

---

## Starting the Containers

### Step 1: Navigate to Project Root

```bash
cd speechify
# or wherever you cloned the project
```

### Step 2: Build and Start All Containers

```bash
# Build images and start containers in detached mode
docker-compose up -d --build
```

**First-time build will download:**
- Python base images (~200 MB)
- Whisper AI model (~150 MB)
- SBERT model (~100 MB)
- PostgreSQL image (~80 MB)
- Redis image (~30 MB)

**Expected build time:** 10-30 minutes (depending on internet speed)

### Step 3: Monitor Build Progress

```bash
# Watch build logs
docker-compose logs -f

# Watch specific service
docker-compose logs -f whisper-service
docker-compose logs -f sbert-service
```

### Step 4: Start Backend Server

```bash
# Navigate to backend directory
cd Backend

# Install Node.js dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Start the server
npm start
```

### Step 5: Start Frontend (Optional)

```bash
# In a new terminal
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Verifying the Installation

### Check Container Status

```bash
docker-compose ps
```

**Expected Output:**
```
NAME                  STATUS                   PORTS
quiz-postgres-db      Up (healthy)             0.0.0.0:5432->5432/tcp
quiz-redis            Up (healthy)             0.0.0.0:6379->6379/tcp
sbert-grading         Up (healthy)             0.0.0.0:5002->5002/tcp
whisper-transcription Up                       0.0.0.0:5000->5000/tcp
```

### Test Individual Services

#### Test PostgreSQL Connection

```bash
# Using Docker
docker exec quiz-postgres-db psql -U quiz_admin -d quiz_app -c "SELECT 1;"

# Expected: 1 (means connection successful)
```

#### Test Redis Connection

```bash
docker exec quiz-redis redis-cli ping

# Expected: PONG
```

#### Test SBERT Service

```bash
# Health check
curl http://localhost:5002/health

# Expected: {"status":"healthy","model":"all-MiniLM-L6-v2","service":"sbert-grading"}

# Test grading
curl -X POST http://localhost:5002/grade \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "What is photosynthesis?",
    "studentAnswer": "Process where plants make food from sunlight",
    "correctAnswer": "Process by which plants convert light energy into chemical energy"
  }'

# Expected: {"isCorrect":true,"similarityScore":0.85...,"explanation":"..."}
```

#### Test Whisper Service

```bash
# Health check
curl http://localhost:5000/health

# Expected: {"status":"healthy","service":"whisper-transcription"}
```

### Verify All Services Are Running

```powershell
# PowerShell (Windows)
$services = @(
    @{Name="PostgreSQL"; URL="localhost"; Port=5432},
    @{Name="Redis"; URL="localhost"; Port=6379},
    @{Name="SBERT"; URL="http://localhost:5002/health"; Port=5002},
    @{Name="Whisper"; URL="http://localhost:5000/health"; Port=5000}
)

foreach ($svc in $services) {
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $svc.Port -ErrorAction Stop -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host "✅ $($svc.Name) is running on port $($svc.Port)" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ $($svc.Name) is NOT running on port $($svc.Port)" -ForegroundColor Red
    }
}
```

---

## Environment Configuration

### docker-compose.yml Reference

```yaml
services:
  whisper-service:
    build:
      context: ./whisper-service
      dockerfile: Dockerfile
    container_name: whisper-transcription
    ports:
      - "5000:5000"
    environment:
      - KMP_DUPLICATE_LIB_OK=TRUE
    volumes:
      - whisper-cache:/root/.cache/huggingface
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 4G

  sbert-service:
    build:
      context: ./sbert-service
      dockerfile: Dockerfile
    container_name: sbert-grading
    ports:
      - "5002:5002"
    volumes:
      - sbert-cache:/root/.cache/torch
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5002/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:16-alpine
    container_name: quiz-postgres-db
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: quiz_admin
      POSTGRES_PASSWORD: quiz_secure_password
      POSTGRES_DB: quiz_app
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./Backend/init-database.sql:/docker-entrypoint-initdb.d/init-database.sql

  redis:
    image: redis:7-alpine
    container_name: quiz-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes --maxmemory 256mb

volumes:
  whisper-cache:
  sbert-cache:
  postgres-data:
  redis-data:
```

### Customizing Environment Variables

#### Change Database Credentials

1. Update `docker-compose.yml`:
```yaml
postgres:
  environment:
    POSTGRES_USER: your_custom_user
    POSTGRES_PASSWORD: your_secure_password
    POSTGRES_DB: your_database_name
```

2. Update `Backend/.env`:
```env
DB_USER=your_custom_user
DB_PASSWORD=your_secure_password
DB_NAME=your_database_name
DATABASE_URL=postgresql://your_custom_user:your_secure_password@localhost:5432/your_database_name
```

3. Recreate containers:
```bash
docker-compose down -v  # Warning: This deletes data!
docker-compose up -d
```

#### Change Port Mappings

```yaml
# Example: Run PostgreSQL on port 5433
postgres:
  ports:
    - "5433:5432"  # host:container
```

Update `.env` accordingly:
```env
DB_PORT=5433
```

---

## Container Management

### Common Commands

#### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services (keeps data)
docker-compose stop

# Stop and remove containers (keeps volumes/data)
docker-compose down

# Stop and remove everything including data
docker-compose down -v
```

#### View Logs

```bash
# All services
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# Specific service logs
docker-compose logs -f postgres
docker-compose logs -f sbert-service
docker-compose logs -f whisper-service
docker-compose logs -f redis
```

#### Rebuild Services

```bash
# Rebuild all services
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build sbert-service
docker-compose up -d --build whisper-service
```

#### Access Container Shell

```bash
# PostgreSQL
docker exec -it quiz-postgres-db psql -U quiz_admin -d quiz_app

# Redis CLI
docker exec -it quiz-redis redis-cli

# SBERT service (Python shell)
docker exec -it sbert-grading python

# Whisper service shell
docker exec -it whisper-transcription /bin/bash
```

### Volume Management

```bash
# List all volumes
docker volume ls

# Inspect a volume
docker volume inspect speechify_postgres-data

# Backup PostgreSQL data
docker exec quiz-postgres-db pg_dump -U quiz_admin quiz_app > backup.sql

# Restore PostgreSQL data
docker exec -i quiz-postgres-db psql -U quiz_admin quiz_app < backup.sql
```

### Resource Monitoring

```bash
# View resource usage
docker stats

# Output:
# CONTAINER ID   NAME                   CPU %   MEM USAGE / LIMIT   NET I/O
# abc123         quiz-postgres-db       0.50%   150MB / 4GB         10MB / 5MB
# def456         quiz-redis             0.10%   10MB / 256MB        1MB / 500KB
# ghi789         sbert-grading          2.00%   2GB / 4GB           50MB / 25MB
# jkl012         whisper-transcription  1.50%   1.5GB / 4GB         100MB / 50MB
```

---

## Troubleshooting

### Issue 1: Docker Not Starting

**Windows:**
```powershell
# Check if Docker service is running
Get-Service docker

# Restart Docker Desktop
Stop-Process -Name "Docker Desktop" -Force
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

**Linux:**
```bash
# Check Docker daemon status
sudo systemctl status docker

# Start Docker daemon
sudo systemctl start docker

# Enable on boot
sudo systemctl enable docker
```

### Issue 2: Port Already in Use

**Error:** `port is already allocated` or `address already in use`

**Solution:**
```bash
# Find process using the port (Windows PowerShell)
netstat -ano | findstr :5432

# Kill the process
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :5432
kill -9 <PID>
```

Or change the port in `docker-compose.yml`:
```yaml
postgres:
  ports:
    - "5433:5432"  # Use 5433 instead
```

### Issue 3: Container Won't Start

```bash
# Check container logs
docker-compose logs <service-name>

# Check container exit code
docker ps -a

# Remove and recreate container
docker-compose rm -f <service-name>
docker-compose up -d <service-name>
```

### Issue 4: Out of Memory

**Error:** `Killed` or container exits unexpectedly

**Solution:** Increase Docker memory allocation:

**Docker Desktop (Windows/Mac):**
1. Open Docker Desktop Settings
2. Go to Resources > Advanced
3. Increase Memory to 8GB or more
4. Click "Apply & Restart"

**Linux:**
```bash
# Check available memory
free -h

# Reduce worker count in docker-compose.yml
# Or add memory limits
```

### Issue 5: SBERT/Whisper Model Download Failed

**Error:** Model download timeout or network error

**Solution:**
```bash
# Rebuild with no cache
docker-compose build --no-cache sbert-service
docker-compose build --no-cache whisper-service

# Or manually download model inside container
docker exec -it sbert-grading python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
```

### Issue 6: PostgreSQL Connection Refused

**Error:** `connection refused` or `could not connect to server`

```bash
# Check if PostgreSQL is healthy
docker exec quiz-postgres-db pg_isready -U quiz_admin

# Check PostgreSQL logs
docker-compose logs postgres

# Verify environment variables match
docker exec quiz-postgres-db env | grep POSTGRES
```

### Issue 7: Redis Connection Failed

```bash
# Test Redis connection
docker exec quiz-redis redis-cli ping

# Check Redis logs
docker-compose logs redis

# Verify Redis is accepting connections
docker exec quiz-redis redis-cli info clients
```

### Issue 8: Permission Denied (Linux)

**Error:** `permission denied` when running docker commands

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and log back in, or run:
newgrp docker
```

### Issue 9: WSL 2 Issues (Windows)

```powershell
# Check WSL status
wsl --status

# Update WSL
wsl --update

# Restart WSL
wsl --shutdown

# Set WSL 2 as default
wsl --set-default-version 2
```

---

## Quick Reference Commands

```bash
# ==================== STARTUP ====================
docker-compose up -d                    # Start all containers
cd Backend && npm install && npm start  # Start backend

# ==================== STATUS ====================
docker-compose ps                       # Container status
docker stats                            # Resource usage
docker-compose logs -f                  # Live logs

# ==================== TESTING ====================
curl http://localhost:5002/health       # Test SBERT
curl http://localhost:5000/health       # Test Whisper
docker exec quiz-redis redis-cli ping   # Test Redis
docker exec quiz-postgres-db psql -U quiz_admin -d quiz_app -c "SELECT 1"

# ==================== SHUTDOWN ====================
docker-compose stop                     # Stop (keep data)
docker-compose down                     # Remove containers
docker-compose down -v                  # Remove everything

# ==================== MAINTENANCE ====================
docker-compose up -d --build            # Rebuild all
docker system prune -a                  # Clean unused images
docker volume prune                     # Clean unused volumes
```

---

## Summary Checklist

Use this checklist when setting up on a new system:

- [ ] **Install Docker Desktop** (Windows/Mac) or Docker Engine (Linux)
- [ ] **Install Docker Compose** (included with Docker Desktop)
- [ ] **Install Node.js 18+** and npm
- [ ] **Install Git**
- [ ] **Clone the repository**
- [ ] **Create `Backend/.env`** with database credentials
- [ ] **Run `docker-compose up -d --build`** (wait for completion)
- [ ] **Verify all 4 containers are running** (`docker-compose ps`)
- [ ] **Test each service** (PostgreSQL, Redis, SBERT, Whisper)
- [ ] **Install backend dependencies** (`cd Backend && npm install`)
- [ ] **Generate Prisma client** (`npx prisma generate`)
- [ ] **Run database migrations** (`npx prisma migrate deploy`)
- [ ] **Start backend server** (`npm start`)
- [ ] **Access application** at http://localhost:3001

---

## Support

For issues not covered in this guide:

1. Check Docker logs: `docker-compose logs -f`
2. Verify environment variables match across all config files
3. Ensure sufficient system resources (RAM, CPU, disk space)
4. Try rebuilding containers: `docker-compose down && docker-compose up -d --build`
