# 🔑 Environment Variables Setup - COMPLETE GUIDE

## ✅ **ENVIRONMENT FILES CREATED**

Your environment files have been created with the following structure:

### **Frontend (.env.local)**
```env
# ========================================
# FRONTEND ENVIRONMENT VARIABLES
# ========================================

# Backend API Configuration
NEXT_PUBLIC_BACKEND_API_URL=https://hope-backend-2.onrender.com
BACKEND_API_URL=https://hope-backend-2.onrender.com

# NextAuth Configuration
NEXTAUTH_URL=https://ai-therapist-agent-theta.vercel.app
NEXTAUTH_SECRET=568eb71487b9f26500740b1d9eac270451f78a887ef30f27038f2ad55594b6ca

# Vercel Blob Storage (for meditation uploads)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here

# Environment
NODE_ENV=production

# ========================================
# OPTIONAL
# ========================================

# Google Analytics
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry Error Tracking
# NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
```

### **Backend (Hope-backend/.env)**
```env
# ========================================
# BACKEND ENVIRONMENT VARIABLES
# ========================================

# Server Configuration
PORT=8000
NODE_ENV=production

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://knsalee:SyB11T1OcCTa0BGz@hope-ai.yzbppbz.mongodb.net/?retryWrites=true&w=majority&appName=HOPE-AI

# JWT Secret (MUST CHANGE THIS!)
JWT_SECRET=79b6d65ed0ad2b6e2526430621dd88d54723d5b2db053efa50645964d39661b3

# AI API Key (Google Gemini)
GEMINI_API_KEY=your-gemini-api-key-here

# CORS Configuration
FRONTEND_URL=https://ai-therapist-agent-theta.vercel.app

# ========================================
# OPTIONAL
# ========================================

# Inngest (Background Jobs)
# INNGEST_EVENT_KEY=your-inngest-event-key
# INNGEST_SIGNING_KEY=your-inngest-signing-key

# Email Service (SendGrid)
# SENDGRID_API_KEY=your-sendgrid-api-key

# AWS S3 (If using S3 storage)
# AWS_ACCESS_KEY_ID=your-aws-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret
# S3_BUCKET_NAME=your-bucket-name
```

---

## 🎯 **IMMEDIATE ACTION REQUIRED**

### **Step 1: Get Your API Keys**

#### **A. GEMINI_API_KEY (CRITICAL)**
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Update `Hope-backend/.env`:
   ```env
   GEMINI_API_KEY=your-actual-gemini-key-here
   ```

#### **B. BLOB_READ_WRITE_TOKEN (HIGH PRIORITY)**
1. Go to Vercel Dashboard → Your Project
2. Navigate to Storage → Blob
3. Create a new store or use existing
4. Go to Settings → Copy the token
5. Update `.env.local`:
   ```env
   BLOB_READ_WRITE_TOKEN=your-actual-vercel-blob-token-here
   ```

### **Step 2: Set Deployment Environment Variables**

#### **VERCEL (Frontend) - Set These:**
1. Go to: https://vercel.com/dashboard
2. Select your project: `ai-therapist-agent`
3. Go to Settings → Environment Variables
4. Add these variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_BACKEND_API_URL` | `https://hope-backend-2.onrender.com` | Production, Preview, Development |
| `BACKEND_API_URL` | `https://hope-backend-2.onrender.com` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://ai-therapist-agent-theta.vercel.app` | Production |
| `NEXTAUTH_URL` | Auto-generated preview URL | Preview |
| `NEXTAUTH_URL` | `http://localhost:3000` | Development |
| `NEXTAUTH_SECRET` | `568eb71487b9f26500740b1d9eac270451f78a887ef30f27038f2ad55594b6ca` | All |
| `BLOB_READ_WRITE_TOKEN` | Your Vercel Blob token | All |

#### **RENDER (Backend) - Set These:**
1. Go to: https://dashboard.render.com
2. Select service: `hope-backend-2`
3. Go to Environment
4. Add/Update these variables:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://knsalee:SyB11T1OcCTa0BGz@hope-ai.yzbppbz.mongodb.net/?retryWrites=true&w=majority&appName=HOPE-AI` |
| `JWT_SECRET` | `79b6d65ed0ad2b6e2526430621dd88d54723d5b2db053efa50645964d39661b3` |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://ai-therapist-agent-theta.vercel.app` |
| `PORT` | `8000` |

---

## 🔍 **ENVIRONMENT VARIABLE USAGE IN YOUR CODE**

### **Frontend Usage:**
- **`lib/api/backend-service.ts`**: Uses `NEXT_PUBLIC_BACKEND_API_URL` and `BACKEND_API_URL`
- **`app/api/auth/session/route.ts`**: Uses `NEXT_PUBLIC_BACKEND_API_URL` and `BACKEND_API_URL`
- **`lib/contexts/session-context.tsx`**: Uses `NEXT_PUBLIC_BACKEND_API_URL` and `BACKEND_API_URL`

### **Backend Usage:**
- **`Hope-backend/src/index.ts`**: Uses `PORT`, `NODE_ENV`, `FRONTEND_URL`
- **`Hope-backend/src/utils/db.ts`**: Uses `MONGODB_URI`
- **`Hope-backend/src/controllers/memoryEnhancedChat.ts`**: Uses `GEMINI_API_KEY`
- **`Hope-backend/src/controllers/cbtController.ts`**: Uses `GEMINI_API_KEY`

---

## 🧪 **TESTING YOUR ENVIRONMENT VARIABLES**

### **Test Frontend:**
```bash
npm run build
```
Should build without "missing environment variable" warnings

### **Test Backend:**
```bash
cd Hope-backend
npm run build
npm start
```
Should start without "undefined" errors in logs

### **Test Authentication:**
1. Login with real credentials
2. Check browser console for errors
3. Verify token is saved in localStorage
4. Refresh page - should stay logged in

### **Test CBT AI:**
1. Go to /cbt/dashboard
2. Create a thought record
3. Generate AI insights
4. Should return real AI-generated content (not errors)

---

## ⚠️ **CRITICAL MISSING VARIABLES**

### **1. GEMINI_API_KEY (CRITICAL)**
- **Impact:** AI insights will fail, fallback responses only
- **Location:** CBT insights, memory-enhanced chat
- **Fix:** Get from https://makersuite.google.com/app/apikey

### **2. BLOB_READ_WRITE_TOKEN (HIGH)**
- **Impact:** Meditation uploads will fail
- **Location:** Meditation upload functionality
- **Fix:** Get from Vercel Storage → Blob → Settings

---

## 📊 **VALIDATION CHECKLIST**

Before deploying, verify:

- [ ] GEMINI_API_KEY set in Hope-backend/.env
- [ ] BLOB_READ_WRITE_TOKEN set in .env.local
- [ ] All environment variables set in Vercel
- [ ] All environment variables set in Render
- [ ] Frontend and backend URLs match
- [ ] CORS FRONTEND_URL matches Vercel URL
- [ ] NEXTAUTH_URL matches deployed URL
- [ ] No `.env` or `.env.local` committed to git
- [ ] `.gitignore` includes `.env*`

---

## 🚀 **EXPECTED OUTCOME**

After setting all environment variables:

✅ **AI Features Working:** Real AI insights instead of fallbacks  
✅ **Authentication Secure:** Proper JWT tokens  
✅ **File Uploads Working:** Meditation uploads functional  
✅ **CORS Configured:** No cross-origin errors  
✅ **Production Ready:** All features fully functional  

---

## 🎯 **NEXT STEPS**

1. **Get your API keys** (GEMINI_API_KEY, BLOB_READ_WRITE_TOKEN)
2. **Update the .env files** with your actual keys
3. **Set variables in Vercel and Render** deployment platforms
4. **Test everything** to ensure it works
5. **Deploy to production** with confidence!

**Status:** Environment files created! Just need to add your API keys! 🚀
