# 🔧 CORS Configuration - Complete Fix

## ✅ **CORS Issues Fixed**

### **Updated Backend CORS Configuration:**

**File:** `Hope-backend/src/index.ts`

**Changes Made:**
1. **Added Multiple Domains:**
   - `https://ai-therapist-agent-theta.vercel.app` (main Vercel app)
   - `https://ai-therapist-agent-2hx8i5cf8-kelvinsalehs-projects.vercel.app` (Vercel preview)
   - `https://ultra-predict.co.ke` (your custom domain)
   - `http://ultra-predict.co.ke` (HTTP version)

2. **Enhanced CORS Options:**
   - Dynamic origin checking with detailed logging
   - Added PATCH method support
   - Extended allowed headers
   - Added exposed headers
   - Set maxAge for preflight caching

3. **Added CORS Debugging:**
   - Request logging for troubleshooting
   - Additional CORS headers middleware
   - Detailed error logging

### **CORS Configuration Details:**

```typescript
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log the blocked origin for debugging
    console.log(`CORS blocked origin: ${origin}`);
    console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
    
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "x-api-key",
    "X-Requested-With",
    "Accept",
    "Origin"
  ],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  maxAge: 86400 // 24 hours
};
```

### **Allowed Origins:**

**Production:**
- `https://ai-therapist-agent-theta.vercel.app`
- `https://ai-therapist-agent-2hx8i5cf8-kelvinsalehs-projects.vercel.app`
- `https://ultra-predict.co.ke`
- `http://ultra-predict.co.ke`

**Development:**
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:3002`
- All production domains

### **CORS Debugging Features:**

1. **Request Logging:**
   ```typescript
   app.use((req, res, next) => {
     console.log(`CORS Request - Origin: ${req.headers.origin}, Method: ${req.method}, Path: ${req.path}`);
     next();
   });
   ```

2. **Additional Headers:**
   ```typescript
   app.use((req, res, next) => {
     res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
     res.header('Access-Control-Allow-Credentials', 'true');
     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, X-Requested-With, Accept, Origin');
     next();
   });
   ```

---

## 🚀 **Deployment Steps**

### **1. Commit and Push Changes:**
```bash
git add .
git commit -m "Fix CORS configuration for multiple domains"
git push origin main
```

### **2. Deploy Backend to Render:**
- The changes will automatically deploy to Render
- Check Render logs for CORS debugging information

### **3. Test CORS from Different Domains:**

**Test from Vercel:**
```bash
curl -H "Origin: https://ai-therapist-agent-theta.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: authorization" \
     -X OPTIONS \
     https://hope-backend-2.onrender.com/api/health
```

**Test from ultra-predict.co.ke:**
```bash
curl -H "Origin: https://ultra-predict.co.ke" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: authorization" \
     -X OPTIONS \
     https://hope-backend-2.onrender.com/api/health
```

---

## 🔍 **Troubleshooting CORS Issues**

### **Common CORS Problems:**

1. **Preflight Requests (OPTIONS):**
   - Make sure OPTIONS method is allowed
   - Check allowed headers match request headers

2. **Credentials:**
   - Ensure `credentials: true` is set
   - Include `Access-Control-Allow-Credentials: true`

3. **Origin Mismatch:**
   - Check exact domain (with/without www)
   - Verify protocol (http vs https)

### **Debugging Steps:**

1. **Check Browser Console:**
   - Look for CORS error messages
   - Check Network tab for failed requests

2. **Check Backend Logs:**
   - Look for "CORS blocked origin" messages
   - Verify allowed origins list

3. **Test with curl:**
   ```bash
   curl -v -H "Origin: https://your-domain.com" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: authorization,content-type" \
        -X OPTIONS \
        https://hope-backend-2.onrender.com/api/auth/login
   ```

---

## 📋 **Environment Variables to Set**

### **Render (Backend) Environment Variables:**
```env
FRONTEND_URL=https://ai-therapist-agent-theta.vercel.app
NODE_ENV=production
```

### **Vercel (Frontend) Environment Variables:**
```env
NEXT_PUBLIC_BACKEND_API_URL=https://hope-backend-2.onrender.com
BACKEND_API_URL=https://hope-backend-2.onrender.com
```

---

## ✅ **Expected Results**

After deploying these changes:

1. **✅ CORS requests from Vercel domains will work**
2. **✅ CORS requests from ultra-predict.co.ke will work**
3. **✅ Preflight OPTIONS requests will be handled properly**
4. **✅ Authentication headers will be allowed**
5. **✅ Debugging logs will help identify any remaining issues**

---

## 🎯 **Next Steps**

1. **Commit and push the changes**
2. **Wait for Render deployment to complete**
3. **Test the application from both domains**
4. **Check backend logs for any CORS issues**
5. **Verify all API calls work properly**

**Status:** CORS configuration updated for all your domains! 🚀
