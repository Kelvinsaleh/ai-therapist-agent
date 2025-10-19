# 🔑 ALL Environment Variables - Complete Reference

## 📋 **COMPLETE ENVIRONMENT VARIABLES LIST**

### **Frontend (.env.local) - REQUIRED**

```env
# ========================================
# REQUIRED FOR PRODUCTION
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

### **Backend (Hope-backend/.env) - REQUIRED**

```env
# ========================================
# REQUIRED FOR PRODUCTION
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

# Vercel Blob Storage (for meditation uploads)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here

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

## 🔍 **ENVIRONMENT VARIABLE USAGE IN CODE**

### **Frontend Usage:**

#### **1. Backend Service (`lib/api/backend-service.ts`)**
```typescript
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 
                        process.env.BACKEND_API_URL || 
                        "https://hope-backend-2.onrender.com";
```

#### **2. Session Auth (`app/api/auth/session/route.ts`)**
```typescript
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 
                   process.env.BACKEND_API_URL || 
                   "https://hope-backend-2.onrender.com";
```

#### **3. Session Context (`lib/contexts/session-context.tsx`)**
```typescript
const tierResponse = await fetch(
  (process.env.NEXT_PUBLIC_BACKEND_API_URL || 
   process.env.BACKEND_API_URL || 
   'https://hope-backend-2.onrender.com') + '/payments/subscription/status'
);
```

#### **4. Meditations Page (`app/meditations/page.tsx`)**
```typescript
const res = await fetch((process.env.NEXT_PUBLIC_BACKEND_API_URL || 
                       process.env.BACKEND_API_URL || 
                       'https://hope-backend-2.onrender.com') + '/meditation/sessions?limit=100&page=1'
```

#### **5. Favorite API Routes**
- `app/api/meditations/[meditationId]/favorite-status/route.ts`
- `app/api/meditations/[meditationId]/favorite/route.ts`
```typescript
const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";
```

### **Backend Usage:**

#### **1. Main Server (`Hope-backend/src/index.ts`)**
```typescript
const PORT = process.env.PORT || 8000;
const allowedOrigins = process.env.FRONTEND_URL || defaultFrontend;
if (process.env.NODE_ENV === 'production') {
  return [process.env.FRONTEND_URL || defaultFrontend];
}
```

#### **2. Database (`Hope-backend/src/utils/db.ts`)**
```typescript
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://...";
```

#### **3. Memory Enhanced Chat (`Hope-backend/src/controllers/memoryEnhancedChat.ts`)**
```typescript
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
```

#### **4. CBT Controller (`Hope-backend/src/controllers/cbtController.ts`)**
```typescript
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
```

#### **5. Meditation Controller (`Hope-backend/src/controllers/meditationController.ts`)**
```typescript
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "AIzaSyCCRSas8dVBP3ye4ZY5RBPsYqw7m_2jro8"
);
// ... and ...
token: process.env.BLOB_READ_WRITE_TOKEN
```

---

## ⚠️ **CRITICAL ISSUES FOUND**

### **1. Hardcoded API Key in Meditation Controller**
**Location:** `Hope-backend/src/controllers/meditationController.ts:11`
```typescript
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "AIzaSyCCRSas8dVBP3ye4ZY5RBPsYqw7m_2jro8"
);
```
**Issue:** Hardcoded fallback API key exposed in code
**Fix:** Remove hardcoded fallback, use environment variable only

### **2. Missing BLOB_READ_WRITE_TOKEN in Backend**
**Location:** `Hope-backend/src/controllers/meditationController.ts:188`
```typescript
token: process.env.BLOB_READ_WRITE_TOKEN
```
**Issue:** Backend needs BLOB_READ_WRITE_TOKEN for meditation uploads
**Fix:** Add BLOB_READ_WRITE_TOKEN to backend .env file

---

## 🚀 **DEPLOYMENT ENVIRONMENT VARIABLES**

### **VERCEL (Frontend) - Set These:**

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_BACKEND_API_URL` | `https://hope-backend-2.onrender.com` | Production, Preview, Development |
| `BACKEND_API_URL` | `https://hope-backend-2.onrender.com` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://ai-therapist-agent-theta.vercel.app` | Production |
| `NEXTAUTH_URL` | Auto-generated preview URL | Preview |
| `NEXTAUTH_URL` | `http://localhost:3000` | Development |
| `NEXTAUTH_SECRET` | `568eb71487b9f26500740b1d9eac270451f78a887ef30f27038f2ad55594b6ca` | All |
| `BLOB_READ_WRITE_TOKEN` | Your Vercel Blob token | All |

### **RENDER (Backend) - Set These:**

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://knsalee:SyB11T1OcCTa0BGz@hope-ai.yzbppbz.mongodb.net/?retryWrites=true&w=majority&appName=HOPE-AI` |
| `JWT_SECRET` | `79b6d65ed0ad2b6e2526430621dd88d54723d5b2db053efa50645964d39661b3` |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://ai-therapist-agent-theta.vercel.app` |
| `PORT` | `8000` |
| `BLOB_READ_WRITE_TOKEN` | Your Vercel Blob token |

---

## 🎯 **IMMEDIATE ACTION REQUIRED**

### **Step 1: Get Your API Keys**

#### **A. GEMINI_API_KEY (CRITICAL)**
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Update both `.env.local` and `Hope-backend/.env`:
   ```env
   GEMINI_API_KEY=your-actual-gemini-key-here
   ```

#### **B. BLOB_READ_WRITE_TOKEN (HIGH PRIORITY)**
1. Go to Vercel Dashboard → Your Project
2. Navigate to Storage → Blob
3. Create a new store or use existing
4. Go to Settings → Copy the token
5. Update both `.env.local` and `Hope-backend/.env`:
   ```env
   BLOB_READ_WRITE_TOKEN=your-actual-vercel-blob-token-here
   ```

### **Step 2: Fix Hardcoded API Key**
Update `Hope-backend/src/controllers/meditationController.ts:11`:
```typescript
// Change this:
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "AIzaSyCCRSas8dVBP3ye4ZY5RBPsYqw7m_2jro8"
);

// To this:
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ""
);
```

### **Step 3: Set Deployment Variables**
- **Vercel:** Add all frontend variables
- **Render:** Add all backend variables (including BLOB_READ_WRITE_TOKEN)

---

## 📊 **VALIDATION CHECKLIST**

Before deploying, verify:

- [ ] GEMINI_API_KEY set in both .env files
- [ ] BLOB_READ_WRITE_TOKEN set in both .env files
- [ ] Hardcoded API key removed from meditation controller
- [ ] All environment variables set in Vercel
- [ ] All environment variables set in Render
- [ ] Frontend and backend URLs match
- [ ] CORS FRONTEND_URL matches Vercel URL
- [ ] NEXTAUTH_URL matches deployed URL
- [ ] No `.env` or `.env.local` committed to git
- [ ] `.gitignore` includes `.env*`

---

## 🎯 **EXPECTED OUTCOME**

After setting all environment variables:

✅ **AI Features Working:** Real AI insights instead of fallbacks  
✅ **Authentication Secure:** Proper JWT tokens  
✅ **File Uploads Working:** Meditation uploads functional  
✅ **CORS Configured:** No cross-origin errors  
✅ **Production Ready:** All features fully functional  

**Status:** Environment files created! Just need to add your API keys and fix hardcoded fallback! 🚀
