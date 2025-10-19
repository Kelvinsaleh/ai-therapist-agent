# 🔧 Complete Environment Variables Setup

## 📋 **Your Current .env File Analysis**

### ✅ **What You Have (Good!):**
- `GEMINI_API_KEY` - ✅ Set (AI features will work)
- `JWT_SECRET` - ✅ Set (authentication will work)
- `NODE_ENV` - ✅ Set
- `PORT` - ✅ Set
- `FRONTEND_URL` - ✅ Set
- `CORS_ORIGIN` - ✅ Set
- Paystack variables - ✅ Set (payments will work)

### ❌ **What You're Missing (Critical!):**

---

## 🚨 **MISSING CRITICAL VARIABLES**

### **1. Database Connection (CRITICAL)**
```env
MONGODB_URI=mongodb+srv://knsalee:SyB11T1OcCTa0BGz@hope-ai.yzbppbz.mongodb.net/?retryWrites=true&w=majority&appName=HOPE-AI
```

### **2. Backend API URL (CRITICAL)**
```env
BACKEND_API_URL=https://hope-backend-2.onrender.com
NEXT_PUBLIC_BACKEND_API_URL=https://hope-backend-2.onrender.com
```

### **3. NextAuth Configuration (CRITICAL)**
```env
NEXTAUTH_URL=https://ai-therapist-agent-theta.vercel.app
NEXTAUTH_SECRET=568eb71487b9f26500740b1d9eac270451f78a887ef30f27038f2ad55594b6ca
```

### **4. File Storage (HIGH PRIORITY)**
```env
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here
```

---

## 📝 **COMPLETE .env FILE**

### **Frontend (.env.local):**
```env
# ========================================
# BACKEND CONNECTION (CRITICAL)
# ========================================
NEXT_PUBLIC_BACKEND_API_URL=https://hope-backend-2.onrender.com
BACKEND_API_URL=https://hope-backend-2.onrender.com

# ========================================
# AUTHENTICATION (CRITICAL)
# ========================================
NEXTAUTH_URL=https://ai-therapist-agent-theta.vercel.app
NEXTAUTH_SECRET=568eb71487b9f26500740b1d9eac270451f78a887ef30f27038f2ad55594b6ca

# ========================================
# FILE STORAGE (HIGH PRIORITY)
# ========================================
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here

# ========================================
# ENVIRONMENT
# ========================================
NODE_ENV=production

# ========================================
# OPTIONAL
# ========================================
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
# NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
```

### **Backend (Hope-backend/.env):**
```env
# ========================================
# SERVER CONFIGURATION
# ========================================
PORT=8000
NODE_ENV=production

# ========================================
# DATABASE (CRITICAL)
# ========================================
MONGODB_URI=mongodb+srv://knsalee:SyB11T1OcCTa0BGz@hope-ai.yzbppbz.mongodb.net/?retryWrites=true&w=majority&appName=HOPE-AI

# ========================================
# AUTHENTICATION (CRITICAL)
# ========================================
JWT_SECRET=79b6d65ed0ad2b6e2526430621dd88d54723d5b2db053efa50645964d39661b3

# ========================================
# AI FEATURES (CRITICAL)
# ========================================
GEMINI_API_KEY=AIzaSyCCRSas8dVBP3ye4ZY5RBPsYqw7m_2jro8

# ========================================
# CORS CONFIGURATION (CRITICAL)
# ========================================
FRONTEND_URL=https://ai-therapist-agent-theta.vercel.app
CORS_ORIGIN=https://ai-therapist-agent-theta.vercel.app

# ========================================
# PAYMENTS (ALREADY SET)
# ========================================
PAYSTACK_ANNUAL_PLAN_CODE=PLN_enqk2khgjxmb8fi
PAYSTACK_MONTHLY_PLAN_CODE=PLN_h992yw0qdyhkq6n
PAYSTACK_PUBLIC_KEY=pk_test_6b902d9fa756bd8550db12f7572e7640e66e217f
PAYSTACK_SECRET_KEY=sk_test_db09472048d947585e02821c7327f2b9dca2b81b

# ========================================
# FILE STORAGE (HIGH PRIORITY)
# ========================================
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here

# ========================================
# OPTIONAL
# ========================================
# INNGEST_EVENT_KEY=your-inngest-event-key
# INNGEST_SIGNING_KEY=your-inngest-signing-key
# SENDGRID_API_KEY=your-sendgrid-api-key
```

---

## 🎯 **IMMEDIATE ACTION REQUIRED**

### **Step 1: Add Missing Variables to Your .env**

Add these to your current .env file:

```env
# Add these to your existing .env file:
MONGODB_URI=mongodb+srv://knsalee:SyB11T1OcCTa0BGz@hope-ai.yzbppbz.mongodb.net/?retryWrites=true&w=majority&appName=HOPE-AI
BACKEND_API_URL=https://hope-backend-2.onrender.com
NEXT_PUBLIC_BACKEND_API_URL=https://hope-backend-2.onrender.com
NEXTAUTH_URL=https://ai-therapist-agent-theta.vercel.app
NEXTAUTH_SECRET=568eb71487b9f26500740b1d9eac270451f78a887ef30f27038f2ad55594b6ca
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here
```

### **Step 2: Update Your Existing Variables**

Change these in your current .env:

```env
# Change these:
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://ai-therapist-agent-theta.vercel.app
CORS_ORIGIN=https://ai-therapist-agent-theta.vercel.app
```

### **Step 3: Get Missing API Keys**

1. **BLOB_READ_WRITE_TOKEN:**
   - Go to Vercel Dashboard → Storage → Blob
   - Create a store and get the token

2. **Update JWT_SECRET:**
   - Use the secure one: `79b6d65ed0ad2b6e2526430621dd88d54723d5b2db053efa50645964d39661b3`

---

## 🚀 **DEPLOYMENT VARIABLES**

### **Vercel (Frontend):**
Set these in Vercel Dashboard → Environment Variables:

```env
NEXT_PUBLIC_BACKEND_API_URL=https://hope-backend-2.onrender.com
BACKEND_API_URL=https://hope-backend-2.onrender.com
NEXTAUTH_URL=https://ai-therapist-agent-theta.vercel.app
NEXTAUTH_SECRET=568eb71487b9f26500740b1d9eac270451f78a887ef30f27038f2ad55594b6ca
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

### **Render (Backend):**
Set these in Render Dashboard → Environment:

```env
MONGODB_URI=mongodb+srv://knsalee:SyB11T1OcCTa0BGz@hope-ai.yzbppbz.mongodb.net/?retryWrites=true&w=majority&appName=HOPE-AI
JWT_SECRET=79b6d65ed0ad2b6e2526430621dd88d54723d5b2db053efa50645964d39661b3
GEMINI_API_KEY=AIzaSyCCRSas8dVBP3ye4ZY5RBPsYqw7m_2jro8
FRONTEND_URL=https://ai-therapist-agent-theta.vercel.app
NODE_ENV=production
PORT=8000
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

---

## ✅ **EXPECTED RESULTS**

After adding these variables:

✅ **Backend connection will work**  
✅ **Authentication will work**  
✅ **AI features will work**  
✅ **File uploads will work**  
✅ **Payments will work**  
✅ **Both domains will work**  

**Status:** Add the missing variables and your app will be fully functional! 🚀
