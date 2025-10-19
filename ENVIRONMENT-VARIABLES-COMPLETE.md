# 🔑 Environment Variables - Complete Setup Guide

## 🎯 **CURRENT STATUS ANALYSIS**

### **✅ Environment Variables Already Connected:**
- **Backend Service:** `NEXT_PUBLIC_BACKEND_API_URL`, `BACKEND_API_URL`
- **Session Auth:** `NEXT_PUBLIC_BACKEND_API_URL`, `BACKEND_API_URL`
- **Backend Server:** `PORT`, `NODE_ENV`, `FRONTEND_URL`
- **Database:** `MONGODB_URI` (hardcoded fallback exists)

### **❌ Missing Critical Variables:**
- **AI Features:** `GEMINI_API_KEY` (required for AI insights)
- **Authentication:** `JWT_SECRET` (required for secure tokens)
- **NextAuth:** `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- **File Storage:** `BLOB_READ_WRITE_TOKEN` (for meditation uploads)

---

## 📋 **COMPLETE ENVIRONMENT SETUP**

### **Frontend (.env.local) - Create This File**

```env
# ========================================
# REQUIRED FOR PRODUCTION
# ========================================

# Backend API Configuration
NEXT_PUBLIC_BACKEND_API_URL=https://hope-backend-2.onrender.com
BACKEND_API_URL=https://hope-backend-2.onrender.com

# NextAuth Configuration
NEXTAUTH_URL=https://ai-therapist-agent-theta.vercel.app
NEXTAUTH_SECRET=<generate-random-secret-here>

# Vercel Blob Storage (for meditation uploads)
BLOB_READ_WRITE_TOKEN=<your-vercel-blob-token>

# ========================================
# OPTIONAL
# ========================================

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn

# Environment
NODE_ENV=production
```

### **Backend (.env in Hope-backend/) - Create This File**

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
JWT_SECRET=<generate-random-secret-here>

# AI API Key (Google Gemini)
GEMINI_API_KEY=<your-gemini-api-key>

# CORS Configuration
FRONTEND_URL=https://ai-therapist-agent-theta.vercel.app

# ========================================
# OPTIONAL
# ========================================

# Inngest (Background Jobs)
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key

# Email Service (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key

# AWS S3 (If using S3 storage)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET_NAME=your-bucket-name
```

---

## 🔧 **QUICK SETUP COMMANDS**

### **Generate Required Secrets:**

```bash
# Generate NEXTAUTH_SECRET
node -e "console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_SECRET
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### **Get API Keys:**

1. **GEMINI_API_KEY:**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Create new API key
   - Copy the key

2. **BLOB_READ_WRITE_TOKEN:**
   - Go to Vercel Dashboard → Your Project
   - Navigate to Storage → Blob
   - Create a new store or use existing
   - Copy the token from Settings

---

## 🚀 **DEPLOYMENT ENVIRONMENT VARIABLES**

### **Vercel (Frontend) - Set These:**

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_BACKEND_API_URL` | `https://hope-backend-2.onrender.com` | Production, Preview, Development |
| `BACKEND_API_URL` | `https://hope-backend-2.onrender.com` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://ai-therapist-agent-theta.vercel.app` | Production |
| `NEXTAUTH_URL` | Auto-generated preview URL | Preview |
| `NEXTAUTH_URL` | `http://localhost:3000` | Development |
| `NEXTAUTH_SECRET` | Generated secret | All |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | All |

### **Render (Backend) - Set These:**

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Generated secret (32+ characters) |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://ai-therapist-agent-theta.vercel.app` |
| `PORT` | `8000` |

---

## 🔍 **ENVIRONMENT VARIABLE USAGE IN CODE**

### **Frontend Usage:**

```typescript
// lib/api/backend-service.ts
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 
                        process.env.BACKEND_API_URL || 
                        "https://hope-backend-2.onrender.com";

// app/api/auth/session/route.ts
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 
                   process.env.BACKEND_API_URL || 
                   "https://hope-backend-2.onrender.com";

// lib/contexts/session-context.tsx
const tierResponse = await fetch(
  (process.env.NEXT_PUBLIC_BACKEND_API_URL || 
   process.env.BACKEND_API_URL || 
   'https://hope-backend-2.onrender.com') + '/payments/subscription/status'
);
```

### **Backend Usage:**

```typescript
// Hope-backend/src/index.ts
const PORT = process.env.PORT || 8000;
const allowedOrigins = process.env.FRONTEND_URL || defaultFrontend;

// Hope-backend/src/utils/db.ts
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://...";

// Hope-backend/src/controllers/memoryEnhancedChat.ts
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Hope-backend/src/controllers/cbtController.ts
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
```

---

## ⚠️ **CRITICAL MISSING VARIABLES**

### **1. GEMINI_API_KEY (CRITICAL)**
- **Impact:** AI insights will fail, fallback responses only
- **Location:** CBT insights, memory-enhanced chat
- **Fix:** Get from https://makersuite.google.com/app/apikey

### **2. JWT_SECRET (CRITICAL)**
- **Impact:** Authentication tokens insecure
- **Location:** Backend authentication
- **Fix:** Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### **3. NEXTAUTH_SECRET (CRITICAL)**
- **Impact:** NextAuth sessions won't work
- **Location:** Frontend authentication
- **Fix:** Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### **4. BLOB_READ_WRITE_TOKEN (HIGH)**
- **Impact:** Meditation uploads will fail
- **Location:** Meditation upload functionality
- **Fix:** Get from Vercel Storage → Blob → Settings

---

## 🧪 **TESTING ENVIRONMENT VARIABLES**

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

## 🔒 **SECURITY BEST PRACTICES**

### **1. Secret Generation**
Never use simple passwords. Generate cryptographically secure secrets:

```bash
# Generate secure secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **2. Rotate Secrets Regularly**
- Change JWT_SECRET every 90 days
- Change NEXTAUTH_SECRET every 90 days
- Revoke old tokens after rotation

### **3. Separate Environments**
Use different secrets for:
- Development
- Staging
- Production

### **4. Never Hardcode**
❌ **Bad:**
```typescript
const API_KEY = "sk-abc123...";
```

✅ **Good:**
```typescript
const API_KEY = process.env.GEMINI_API_KEY!;
```

---

## 📊 **VALIDATION CHECKLIST**

Before deploying, verify:

- [ ] All environment variables set in Vercel
- [ ] All environment variables set in Render
- [ ] Secrets are randomly generated (not simple passwords)
- [ ] Frontend and backend URLs match
- [ ] CORS FRONTEND_URL matches Vercel URL
- [ ] NEXTAUTH_URL matches deployed URL
- [ ] No `.env` or `.env.local` committed to git
- [ ] `.gitignore` includes `.env*`

---

## 🚨 **IMMEDIATE ACTION REQUIRED**

### **Step 1: Create .env.local (Frontend)**
```bash
# Create file in project root
touch .env.local
```

### **Step 2: Create .env (Backend)**
```bash
# Create file in Hope-backend directory
touch Hope-backend/.env
```

### **Step 3: Set Variables in Deployment Platforms**
- **Vercel:** Settings → Environment Variables
- **Render:** Your Service → Environment

### **Step 4: Test Everything**
- Build frontend: `npm run build`
- Build backend: `cd Hope-backend && npm run build`
- Test authentication flow
- Test AI features

---

## 🎯 **EXPECTED OUTCOME**

After setting all environment variables:

✅ **AI Features Working:** Real AI insights instead of fallbacks  
✅ **Authentication Secure:** Proper JWT tokens  
✅ **File Uploads Working:** Meditation uploads functional  
✅ **CORS Configured:** No cross-origin errors  
✅ **Production Ready:** All features fully functional  

**Status:** Ready to set environment variables and deploy! 🚀
