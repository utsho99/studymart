# StudyMart — Deployment Cheat Sheet
============================================================

## VALUES YOU NEED TO FILL IN (only 3 things total)

1. MONGO_URI       → from MongoDB Atlas (Phase 1)
2. RENDER_URL      → from Render after backend deploy (Phase 4)
3. VERCEL_URL      → from Vercel after frontend deploy (Phase 5)

============================================================

## PHASE 1 — Get your MongoDB connection string

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up → create FREE M0 cluster
3. Security Quickstart:
   - Username: studymart
   - Password: Studymart2024!
   - Click "Create User"
4. Network Access → Add IP → type 0.0.0.0/0 → Add Entry
5. Click "Connect" on your cluster → "Drivers"
6. Copy the string, replace <password> with Studymart2024!
   Add /studymart before the ? like this:
   mongodb+srv://studymart:Studymart2024!@cluster0.XXXXX.mongodb.net/studymart?retryWrites=true&w=majority

7. Open backend/.env → paste it as MONGO_URI value

============================================================

## PHASE 2 — Run locally on Windows

Open PowerShell:

  cd C:\studymart\backend
  npm install
  node utils/seed.js        ← loads sample data, tests DB connection
  npm run dev               ← keep this running

Open a SECOND PowerShell:

  cd C:\studymart\frontend
  npm install
  npm run dev

Open Chrome → http://localhost:5173
Login with: rafi@test.com / password123

============================================================

## PHASE 3 — Push to GitHub

1. Go to https://github.com/new
   - Name: studymart
   - Public
   - Do NOT add README
   - Click Create

2. Open PowerShell:

  cd C:\studymart
  git init
  git add .
  git commit -m "first commit"
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/studymart.git
  git push -u origin main

  (For password use a GitHub token from https://github.com/settings/tokens)

============================================================

## PHASE 4 — Deploy Backend on Render (free)

1. Go to https://render.com → Sign up with GitHub
2. New + → Web Service → connect studymart repo
3. Fill in:
   - Name:           studymart-api
   - Region:         Singapore
   - Root Directory: backend
   - Build Command:  npm install
   - Start Command:  node server.js
   - Instance Type:  Free

4. Environment Variables (add all of these):
   MONGO_URI    = your Atlas string
   JWT_SECRET   = studymart_super_secret_key_2024
   JWT_EXPIRE   = 30d
   NODE_ENV     = production
   CLIENT_URL   = https://studymart.vercel.app  ← fix this after step 5

5. Click Create Web Service → wait 3-5 min
6. Your backend URL will look like: https://studymart-api.onrender.com
7. Test it: open https://studymart-api.onrender.com/api/health
   You should see: {"status":"OK","message":"StudyMart API running"}

============================================================

## PHASE 5 — Deploy Frontend on Vercel (free)

1. Open frontend/.env.production
   Replace PASTE_YOUR_RENDER_URL_HERE with your Render URL
   Example: VITE_API_URL=https://studymart-api.onrender.com

2. Push to GitHub:
   cd C:\studymart
   git add .
   git commit -m "add render url"
   git push

3. Go to https://vercel.com → Sign up with GitHub
4. Add New Project → Import studymart
5. Fill in:
   - Root Directory: frontend
   - Framework:      Vite
   - Build Command:  npm run build
   - Output Dir:     dist

6. Environment Variables:
   VITE_API_URL = https://studymart-api.onrender.com

7. Click Deploy → wait 2 min
8. Your frontend URL: https://studymart-xxxx.vercel.app

============================================================

## PHASE 6 — Final connection fix

1. Go to Render → studymart-api → Environment
2. Change CLIENT_URL to your actual Vercel URL
   Example: CLIENT_URL = https://studymart-xxxx.vercel.app
3. Save → Render auto-restarts

============================================================

## TEST YOUR LIVE APP

1. Open your Vercel URL
2. Register a new account
3. Post a listing with a photo
4. Open in another browser → register another account
5. Find the listing → Contact Seller → send a message
6. Real-time chat should work!

============================================================

## IF SOMETHING BREAKS

Just tell Claude:
- Which Phase and Step you're on
- Copy-paste the exact error message

============================================================
