# 🌐 Multi-Domain Connection Fix

## 🎯 **Issue Confirmed: Both Domains Failing**

Since both live domains are showing "Unable to connect to the server", this is definitely a **CORS or Environment Variable** issue.

---

## 🛠️ **Step 1: Fix Environment Variables**

### **Vercel Environment Variables (CRITICAL)**

Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

**Add these variables:**

```env
NEXT_PUBLIC_BACKEND_API_URL=https://hope-backend-2.onrender.com
BACKEND_API_URL=https://hope-backend-2.onrender.com
NEXTAUTH_URL=https://ai-therapist-agent-theta.vercel.app
NEXTAUTH_SECRET=568eb71487b9f26500740b1d9eac270451f78a887ef30f27038f2ad55594b6ca
```

**For ultra-predict.co.ke domain, also add:**
```env
NEXTAUTH_URL=https://ultra-predict.co.ke
```

---

## 🛠️ **Step 2: Fix Backend CORS Configuration**

### **Check Render Environment Variables**

Go to [Render Dashboard](https://dashboard.render.com) → Your Backend Service → Environment

**Make sure these are set:**
```env
FRONTEND_URL=https://ai-therapist-agent-theta.vercel.app
NODE_ENV=production
JWT_SECRET=79b6d65ed0ad2b6e2526430621dd88d54723d5b2db053efa50645964d39661b3
GEMINI_API_KEY=your-gemini-api-key
PORT=8000
```

### **Update CORS Configuration**

The backend CORS should allow both domains. Let me check if we need to update it:
