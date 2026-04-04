# 🚀 Speechify - Render Deployment Guide

Complete step-by-step guide to deploy Speechify to Render.com

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Setup Render Account](#step-1-setup-render-account)
3. [Step 2: Prepare GitHub Repo](#step-2-prepare-github-repo)
4. [Step 3: Create PostgreSQL Database](#step-3-create-postgresql-database)
5. [Step 4: Create Redis Cache](#step-4-create-redis-cache)
6. [Step 5: Create Backend Service](#step-5-create-backend-service)
7. [Step 6: Create Frontend Service](#step-6-create-frontend-service)
8. [Step 7: Create Whisper Service](#step-7-create-whisper-service)
9. [Step 8: Create SBERT Service](#step-8-create-sbert-service)
10. [Step 9: Connect Services](#step-9-connect-services)
11. [Step 10: Deploy & Test](#step-10-deploy--test)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure:
- ✅ GitHub account with Speechify repo pushed
- ✅ Render.com account (free at https://render.com)
- ✅ Code changes committed (CORS fix)
- ✅ All configuration files in place

**Config files ready:**
- `Backend/.env.render` ✅
- `Frontend/.env.render` ✅
- `Backend/server.js` (CORS updated) ✅

---

## Step 1: Setup Render Account

### 1.1 Create Account
1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

### 1.2 Create New Project
1. Click "New +" button
2. Select "Web Service"
3. Select GitHub repository: **Speechify**
4. Complete setup (you'll return here later)

---

## Step 2: Prepare GitHub Repo

### 2.1 Commit Code Changes

```powershell
cd d:\Speechify

# Stage all new files
git add Backend\.env.render Frontend\.env.render Backend\server.js

# Commit
git commit -m "chore: prepare Render deployment

- Update Backend CORS for production
- Add environment variable templates
- Support dynamic FRONTEND_URL"

# Push to main
git push origin main
```

### 2.2 Verify Files in GitHub

1. Go to your GitHub repo
2. Verify these files exist and are committed:
   - `Backend/server.js` (updated CORS)
   - `Backend/.env.render` (new)
   - `Frontend/.env.render` (new)

---

## Step 3: Create PostgreSQL Database

### 3.1 In Render Dashboard

1. Click **"New +"**
2. Select **"PostgreSQL"**
3. Set configuration:
   - **Name**: `speechify-db` or similar
   - **Database**: `quiz_app`
   - **User**: `quiz_admin`
   - **Region**: Choose closest to you
   - **PostgreSQL Version**: 15
4. Click **"Create Database"**

### 3.2 After Creation

1. Database card appears in dashboard
2. Note the **Internal Database URL** (starts with `postgres://`)
3. This is your `DATABASE_URL` for Backend
4. **Don't share this URL anywhere**

---

## Step 4: Create Redis Cache

### 4.1 In Render Dashboard

1. Click **"New +"**
2. Select **"Redis"**
3. Set configuration:
   - **Name**: `speechify-redis` or similar
   - **Region**: Same as PostgreSQL (for speed)
4. Click **"Create Redis"**

### 4.2 After Creation

1. Redis card appears in dashboard
2. Note the **Internal Redis URL** (starts with `redis://`)
3. This is your `REDIS_URL` for Backend
4. **Don't share this URL anywhere**

---

## Step 5: Create Backend Service

### 5.1 Create New Service

1. Click **"New +"** → **"Web Service"**
2. Connect GitHub:
   - Search for **"Speechify"**
   - Select it
   - Click **"Connect"**

### 5.2 Configure Backend Service

**Basic Settings:**
- **Name**: `speechify-backend`
- **Region**: Same as database
- **Root Directory**: `Backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npx prisma migrate deploy`
- **Start Command**: `npm start`

**Important:** Click the **"Advanced"** button for more options

### 5.3 Set Environment Variables

In the "Environment" section, add:

```env
# Database (get from PostgreSQL service)
DATABASE_URL=<copy from PostgreSQL service>

# Redis (get from Redis service)
REDIS_URL=<copy from Redis service>

# JWT Secret (generate a random value)
JWT_SECRET=your-random-secret-key-here-min-32-chars

# Server
PORT=3001
NODE_ENV=production

# These will be updated after frontend/services deploy
FRONTEND_URL=http://localhost:5173
WHISPER_SERVICE_URL=http://localhost:5000
SBERT_SERVICE_URL=http://localhost:5002

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR=/tmp/uploads
LOG_LEVEL=info
```

### 5.4 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for build to complete (5-10 minutes)
3. Check build logs for errors
4. After deployment, note the **Backend URL** (e.g., `https://speechify-backend-xyz.onrender.com`)

---

## Step 6: Create Frontend Service

### 6.1 Create New Service

1. Click **"New +"** → **"Web Service"**
2. Connect GitHub:
   - Select **"Speechify"** again
   - Click **"Connect"**

### 6.2 Configure Frontend Service

**Basic Settings:**
- **Name**: `speechify-frontend`
- **Region**: Same as backend
- **Root Directory**: `Frontend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run preview`

### 6.3 Set Environment Variables

In the "Environment" section, add:

```env
# Backend API URL (update after Backend deploys)
VITE_API_URL=https://speechify-backend-xyz.onrender.com
```

Replace `speechify-backend-xyz.onrender.com` with your actual Backend URL.

### 6.4 Deploy Frontend

1. Click **"Create Web Service"**
2. Wait for build to complete
3. After deployment, note the **Frontend URL** (e.g., `https://speechify-frontend-xyz.onrender.com`)

---

## Step 7: Create Whisper Service

### 7.1 Create New Service

1. Click **"New +"** → **"Web Service"**
2. Connect GitHub:
   - Select **"Speechify"**
   - Click **"Connect"**

### 7.2 Configure Whisper Service

**Basic Settings:**
- **Name**: `speechify-whisper`
- **Region**: Same as others
- **Root Directory**: `whisper-service`
- **Runtime**: `Python`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app:app --host 0.0.0.0 --port 5000`

### 7.3 Set Environment Variables

```env
PORT=5000
KMP_DUPLICATE_LIB_OK=TRUE
```

### 7.4 Deploy Whisper

1. Click **"Create Web Service"**
2. Wait for build (may take 10+ minutes - downloading ML models)
3. Note the **Whisper URL**

---

## Step 8: Create SBERT Service

### 8.1 Create New Service

1. Click **"New +"** → **"Web Service"**
2. Connect GitHub:
   - Select **"Speechify"**
   - Click **"Connect"**

### 8.2 Configure SBERT Service

**Basic Settings:**
- **Name**: `speechify-sbert`
- **Region**: Same as others
- **Root Directory**: `sbert-service`
- **Runtime**: `Python`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn --workers 1 --worker-class sync --bind 0.0.0.0:5002 --timeout 120 app:app`

### 8.3 Set Environment Variables

```env
PORT=5002
```

### 8.4 Deploy SBERT

1. Click **"Create Web Service"**
2. Wait for build (may take 15+ minutes - downloading ML models)
3. Note the **SBERT URL**

---

## Step 9: Connect Services

### 9.1 Update Backend Environment Variables

Now that all services are deployed, update Backend variables:

1. Go to **Backend service** → **Environment**
2. Update these URLs (get from each service's Settings):

```env
FRONTEND_URL=https://speechify-frontend-xyz.onrender.com
WHISPER_SERVICE_URL=https://speechify-whisper-xyz.onrender.com
SBERT_SERVICE_URL=https://speechify-sbert-xyz.onrender.com
```

3. **Redeploy Backend**:
   - Go to **Deployments**
   - Click **"Redeploy"** on latest commit

### 9.2 Update Frontend Environment Variables

1. Go to **Frontend service** → **Environment**
2. Verify `VITE_API_URL` is set correctly:

```env
VITE_API_URL=https://speechify-backend-xyz.onrender.com
```

3. **Redeploy Frontend**:
   - Go to **Deployments**
   - Click **"Redeploy"**

---

## Step 10: Deploy & Test

### 10.1 Test Backend Health

```bash
# Replace with your actual backend URL
curl https://speechify-backend-xyz.onrender.com/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "queues": {...},
  "timestamp": "2026-04-04T10:30:00Z"
}
```

### 10.2 Test Frontend

1. Open in browser: `https://speechify-frontend-xyz.onrender.com`
2. Check browser console (F12) for errors
3. Try to signup/login
4. Create a test quiz
5. Test audio recording if possible

### 10.3 Monitor Logs

For each service:
1. Go to **Logs** tab
2. Watch for errors
3. Check that services are communicating

---

## Architecture on Render

```
Render Dashboard
├── PostgreSQL Database
│   ├── Database URL: postgres://...
│   └── Auto-backup enabled
│
├── Redis Cache
│   ├── Redis URL: redis://...
│   └── Ephemeral (no persistence by default)
│
├── Backend (Node.js)
│   ├── URL: https://speechify-backend-xyz.onrender.com
│   ├── Variables: DATABASE_URL, REDIS_URL, JWT_SECRET, FRONTEND_URL, etc.
│   └── Health: /api/health
│
├── Frontend (React)
│   ├── URL: https://speechify-frontend-xyz.onrender.com
│   ├── Variables: VITE_API_URL
│   └── Built React SPA
│
├── Whisper (FastAPI)
│   ├── URL: https://speechify-whisper-xyz.onrender.com
│   ├── Port: 5000
│   └── Speech transcription
│
└── SBERT (Flask)
    ├── URL: https://speechify-sbert-xyz.onrender.com
    ├── Port: 5002
    └── Semantic grading
```

---

## Troubleshooting

### Issue 1: Backend Build Fails

**Error in logs:** `npm ERR! code ENOENT`

**Solution:**
1. Check `Backend/package.json` exists
2. Verify all dependencies are listed
3. Check for typos in `Build Command`
4. Redeploy with: **Deployments** → **Redeploy**

### Issue 2: Database Connection Error

**Error:** `ECONNREFUSED PostgreSQL`

**Solution:**
1. Verify `DATABASE_URL` is set in Backend variables
2. Copy full URL from PostgreSQL service (Settings tab)
3. Paste into Backend → Environment → DATABASE_URL
4. Redeploy Backend

### Issue 3: Frontend Not Loading

**Error:** 404 or blank page

**Solution:**
1. Check `Frontend/package.json` has build script
2. Verify `VITE_API_URL` is set correctly
3. Check build logs for errors
4. Redeploy Frontend

### Issue 4: CORS Error in Frontend

**Error:** `Access to XMLHttpRequest blocked by CORS`

**Solution:**
1. Backend → Environment
2. Verify `FRONTEND_URL` is set to frontend domain
3. Exactly match the deployed frontend URL
4. Redeploy Backend

### Issue 5: Services Not Communicating

**Error:** Whisper/SBERT connection timeouts

**Solution:**
1. Use full HTTPS URLs (not localhost)
2. Verify Whisper and SBERT are deployed and running
3. Update Backend variables with correct URLs
4. Redeploy Backend

### Issue 6: Out of Memory

**Error:** Service crashes randomly

**Solution:**
1. Services may be on free tier (512MB RAM)
2. Upgrade to paid plan ($7-12/month)
3. Or optimize memory usage:
   - Reduce Whisper workers: `--workers 1`
   - Reduce SBERT workers: `--workers 2`

### Issue 7: Models Downloading Forever

**Error:** Build stuck on "Downloading model files"

**Solution:**
1. Render times out after 30 minutes
2. Download models locally, commit to repo, or:
3. Upgrade to paid tier (longer builds allowed)
4. Or use smaller models

---

## Important Notes

### Security
- ⚠️ Change `JWT_SECRET` to a strong random value
- ⚠️ Never commit `.env` files with secrets
- ✅ Use Render's environment variables (they're secure)
- ✅ Marked sensitive variables as "secret" if available

### Costs
- **Free Tier**: 
  - PostgreSQL: $0 (shared)
  - Services: May sleep after 15s inactivity
  - Redis: $0
  - Estimated: $0-5/month
  
- **Paid Tier** ($7/month per service):
  - Always running
  - No cold starts
  - Better performance
  - Estimated: $35-50/month (6 services)

### Limits
- **File Storage**: `/tmp` is ephemeral
  - Files deleted on redeploy
  - For permanent storage: use AWS S3
- **Cold Starts**: Free tier services sleep
- **Build Time**: 30 min limit on free tier
- **Memory**: 512MB on free tier

### Best Practices

1. **Auto-Deploy**: Push to main → auto-deploys
2. **Monitor Logs**: Check regularly first week
3. **Rotate Secrets**: Every 3-6 months
4. **Test First**: Always test after redeploy
5. **Backup Data**: Export PostgreSQL weekly

---

## Useful Commands

### Generate JWT Secret

```powershell
# PowerShell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

### View Service Logs

On Render Dashboard:
1. Click service
2. Go to **Logs** tab
3. Watch in real-time

### Restart Service

On Render Dashboard:
1. Click service
2. Go to **Settings**
3. Scroll to **Restart Service**

### Check Service Status

On Render Dashboard:
1. Services show status:
   - 🟢 Running
   - 🟠 Building
   - 🔴 Failed

---

## Next Steps After Deployment

### Immediate (First Day)
- [ ] Test all core features
- [ ] Check logs for errors
- [ ] Share frontend URL with team

### Short Term (First Week)
- [ ] Monitor resource usage
- [ ] Add custom domain (optional)
- [ ] Set up email alerts
- [ ] Document setup for team

### Ongoing (Monthly)
- [ ] Check PostgreSQL disk usage
- [ ] Rotate JWT_SECRET
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Backup database

---

## Resources

- Render Docs: https://render.com/docs
- Render Dashboard: https://dashboard.render.com
- Your GitHub Repo: https://github.com/shreedharkb/Speechify
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Redis Docs: https://redis.io/docs/

---

## Support

If you get stuck:
1. Check the **Troubleshooting** section above
2. View service **Logs** in Render dashboard
3. Open an issue on GitHub
4. Contact Render support: https://render.com/support

---

**Last Updated:** April 4, 2026  
**Status:** Ready for deployment  
**Expected Deployment Time:** 30-45 minutes
