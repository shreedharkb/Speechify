# 🚀 Render Deployment - Quick Start (30 Minutes)

Fast-track checklist to deploy Speechify to Render.com

---

## ⚠️ Prerequisites Checklist

Before starting:
- [ ] GitHub account with Speechify repo (committed and pushed)
- [ ] Render.com account (free at https://render.com)
- [ ] Code updated: `Backend/server.js` CORS fix ✅
- [ ] 30 minutes free time
- [ ] Browser window with GitHub and Render

---

## 🎯 Quick Deploy Steps

### Step 1: Commit Code to GitHub (2 min)

```powershell
cd d:\Speechify

# Verify changes
git status

# Should show:
# - Backend/server.js (modified)
# - Backend/.env.render (new)
# - Frontend/.env.render (new)

# Commit
git add .
git commit -m "chore: prepare Render deployment with CORS fix"
git push origin main

# Verify on GitHub - all files should be there
```

**✅ Complete?** Check GitHub and confirm files are pushed.

---

### Step 2: Create Render Account (2 min)

1. Go to https://render.com
2. Click **"Get Started"**
3. Sign up with GitHub
4. Authorize access
5. ✅ Done!

---

### Step 3: Create PostgreSQL Database (3 min)

1. Render dashboard → Click **"New +"**
2. Select **"PostgreSQL"**
3. Fill in:
   - **Name**: `speechify-db`
   - **Database**: `quiz_app`
   - **User**: `quiz_admin`
   - **Region**: Closest to you
4. Click **"Create Database"**
5. ⏳ Wait 1-2 minutes for creation
6. **Copy Internal Database URL** → Save it (you'll need it)

**✅ Complete?** Database card shows in dashboard.

---

### Step 4: Create Redis Cache (2 min)

1. Dashboard → **"New +"**
2. Select **"Redis"**
3. Fill in:
   - **Name**: `speechify-redis`
   - **Region**: Same as PostgreSQL
4. Click **"Create Redis"**
5. ⏳ Wait 1-2 minutes
6. **Copy Internal Redis URL** → Save it

**✅ Complete?** Redis card shows in dashboard.

---

### Step 5: Create Backend Service (5 min)

1. Dashboard → **"New +"** → **"Web Service"**
2. GitHub connection:
   - Select Speechify repo
   - Click **"Connect"**
3. Configure:
   - **Name**: `speechify-backend`
   - **Region**: Same as DB/Redis
   - **Root Directory**: `Backend`
   - **Runtime**: `Node` (auto-selected)
   - **Build Command**: `npm install && npx prisma migrate deploy`
   - **Start Command**: `npm start`

4. **Set Environment Variables** (click "Advanced" if needed):

```env
DATABASE_URL=<paste PostgreSQL URL from Step 3>
REDIS_URL=<paste Redis URL from Step 4>
JWT_SECRET=your-random-secret-key-here-change-me
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
WHISPER_SERVICE_URL=http://localhost:5000
SBERT_SERVICE_URL=http://localhost:5002
MAX_FILE_SIZE=52428800
UPLOAD_DIR=/tmp/uploads
LOG_LEVEL=info
```

5. Click **"Create Web Service"**
6. ⏳ Build starts (10-15 min)
7. **Save Backend URL** when deployment completes

**✅ Complete?** Backend service shows (may still be building).

---

### Step 6: Create Frontend Service (5 min)

While Backend builds, create Frontend:

1. Dashboard → **"New +"** → **"Web Service"**
2. GitHub:
   - Select Speechify repo again
   - Click **"Connect"**
3. Configure:
   - **Name**: `speechify-frontend`
   - **Region**: Same as others
   - **Root Directory**: `Frontend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`

4. **Set Environment Variables**:

```env
VITE_API_URL=https://speechify-backend-xyz.onrender.com
```
(Replace with actual backend URL from Step 5 - you'll get it soon)

Actually, **don't set VITE_API_URL yet** - we'll update it after Backend deploys.

5. Click **"Create Web Service"**
6. ⏳ Build starts (5-10 min)

**✅ Complete?** Frontend service shows.

---

### Step 7: Create Whisper Service (3 min)

1. Dashboard → **"New +"** → **"Web Service"**
2. GitHub:
   - Select Speechify repo
   - Click **"Connect"**
3. Configure:
   - **Name**: `speechify-whisper`
   - **Region**: Same as others
   - **Root Directory**: `whisper-service`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port 5000`

4. **Environment Variable**:
```env
KMP_DUPLICATE_LIB_OK=TRUE
```

5. Click **"Create Web Service"**
6. ⏳ Build starts (15-20 min - downloading ML models)

**⚠️ Note:** This takes longest because it downloads speech model.

---

### Step 8: Create SBERT Service (3 min)

1. Dashboard → **"New +"** → **"Web Service"**
2. GitHub:
   - Select Speechify repo
   - Click **"Connect"**
3. Configure:
   - **Name**: `speechify-sbert`
   - **Region**: Same as others
   - **Root Directory**: `sbert-service`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --workers 1 --worker-class sync --bind 0.0.0.0:5002 --timeout 120 app:app`

4. **Environment Variable**:
```env
```
(None needed)

5. Click **"Create Web Service"**
6. ⏳ Build starts (15-20 min - downloading ML models)

**Status at this point:**
- ✅ PostgreSQL: Running
- ✅ Redis: Running
- ⏳ Backend: Building
- ⏳ Frontend: Building
- ⏳ Whisper: Building
- ⏳ SBERT: Building

---

### Step 9: Wait & Collect URLs (10 min)

Now you wait for services to build. They show in order:
1. Backend (red → building → running)
2. Frontend (red → building → running)
3. Whisper (red → building → running) [takes longest]
4. SBERT (red → building → running) [takes longest]

**Collect these URLs as they appear:**

- Backend: Click service → Copy URL → https://speechify-backend-xyz.onrender.com
- Frontend: Click service → Copy URL → https://speechify-frontend-xyz.onrender.com
- Whisper: Click service → Copy URL → https://speechify-whisper-xyz.onrender.com
- SBERT: Click service → Copy URL → https://speechify-sbert-xyz.onrender.com

---

### Step 10: Update Environment Variables (3 min)

Once Backend, Frontend, Whisper, SBERT are all running:

#### Update Backend Variables

1. Backend service → **Environment**
2. Update these (replace xyz with actual service names):

```env
FRONTEND_URL=https://speechify-frontend-xyz.onrender.com
WHISPER_SERVICE_URL=https://speechify-whisper-xyz.onrender.com
SBERT_SERVICE_URL=https://speechify-sbert-xyz.onrender.com
```

3. Click **"Save"**
4. Wait for redeploy to complete

#### Update Frontend Variables

1. Frontend service → **Environment**
2. Update:

```env
VITE_API_URL=https://speechify-backend-xyz.onrender.com
```

3. Click **"Save"**
4. Wait for redeploy

---

### Step 11: Test Everything (5 min)

#### Test Backend Health

```powershell
# Copy your Backend URL
$backend = "https://speechify-backend-xyz.onrender.com"

# Test health endpoint
Invoke-WebRequest -Uri "$backend/api/health" -Method GET

# Should return:
# status: healthy
# database: connected
# redis: connected
```

#### Test Frontend

1. Open browser: `https://speechify-frontend-xyz.onrender.com`
2. Check console (F12) for errors
3. Try to sign up
4. Create test quiz

---

## ✅ Final Checklist

- [ ] PostgreSQL created
- [ ] Redis created
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Whisper deployed
- [ ] SBERT deployed
- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] Can signup/login

---

## 🎉 You're Done!

Your Speechify is live on Render!

**Shared URLs:**
- **Frontend**: https://speechify-frontend-xyz.onrender.app
- **Backend**: https://speechify-backend-xyz.onrender.app
- (Don't share the Whisper/SBERT URLs - they're internal)

---

## ⚠️ Important Reminders

1. **JWT_SECRET** - Change to random value in Backend variables
2. **Cold Starts** - Free tier services sleep after 15s (upgrade if needed)
3. **Files** - `/tmp/uploads` are deleted on redeploy (use S3 if permanent storage needed)
4. **Monitor** - Check logs regularly first week

---

## 🆘 If Something Fails

1. **Check Logs**: Service → Logs tab
2. See **RENDER_DEPLOYMENT_GUIDE.md** Troubleshooting section
3. Common issues:
   - Build fails → Check package.json exists
   - DB error → Copy full URL exactly
   - CORS error → Update FRONTEND_URL
   - Services timeout → They might still be building

---

## 📚 More Help

- Full guide: **RENDER_DEPLOYMENT_GUIDE.md**
- Render docs: https://render.com/docs
- Your repo: https://github.com/shreedharkb/Speechify

---

**Total Time**: 30-45 minutes (mostly waiting for builds to complete)

**Status**: Ready for production use ✅
