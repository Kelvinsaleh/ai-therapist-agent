# 🔧 Backend Connection Debug - Step by Step

## ✅ **Backend Status: RUNNING**

**Test Results:**
- ✅ Backend is responding at `https://hope-backend-2.onrender.com`
- ✅ Authentication endpoint is working (401 for invalid credentials is expected)
- ❌ Health endpoint returns 404 (might not exist)

## 🔍 **Root Cause Analysis**

The error "Unable to connect to the server" is likely caused by:

1. **CORS Issues** - Backend not allowing your frontend domain
2. **Environment Variables** - Frontend not using correct backend URL
3. **Network Configuration** - Render service configuration issues

---

## 🛠️ **Immediate Fixes**

### **Fix 1: Check Environment Variables**

Make sure these are set in **Vercel Dashboard**:

```env
NEXT_PUBLIC_BACKEND_API_URL=https://hope-backend-2.onrender.com
BACKEND_API_URL=https://hope-backend-2.onrender.com
```

### **Fix 2: Test CORS from Your Domain**

Open browser console on your site and run:

```javascript
// Test CORS from your domain
fetch('https://hope-backend-2.onrender.com/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': window.location.origin
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test'
  })
})
.then(response => {
  console.log('CORS Test Status:', response.status);
  console.log('CORS Test Headers:', Object.fromEntries(response.headers.entries()));
})
.catch(error => {
  console.error('CORS Test Error:', error);
});
```

### **Fix 3: Check Backend Logs**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service
3. Check the logs for:
   - CORS errors
   - Request logs
   - Any error messages

---

## 🚨 **Quick Diagnostic Steps**

### **Step 1: Check What Domain You're Using**

Are you testing from:
- `https://ai-therapist-agent-theta.vercel.app` (Vercel)
- `https://ultra-predict.co.ke` (Your domain)
- `http://localhost:3000` (Local development)

### **Step 2: Check Browser Console**

Open DevTools (F12) and look for:
- CORS errors
- Network errors
- Failed requests to backend

### **Step 3: Test Backend Directly**

Try accessing: `https://hope-backend-2.onrender.com/auth/login`

Should return a 401 error (this is good - means backend is working)

---

## 🔧 **Backend Configuration Check**

### **CORS Configuration (Should Include Your Domain):**

The backend should allow these origins:
- `https://ai-therapist-agent-theta.vercel.app`
- `https://ultra-predict.co.ke`
- `http://ultra-predict.co.ke`

### **Environment Variables in Render:**

Make sure these are set in Render:
```env
FRONTEND_URL=https://ai-therapist-agent-theta.vercel.app
NODE_ENV=production
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your-gemini-key
```

---

## 🎯 **Most Likely Solutions**

### **Solution 1: CORS Issue**
If CORS is blocking your domain:
1. Check Render logs for CORS errors
2. Verify your domain is in allowed origins
3. Test with the CORS test script above

### **Solution 2: Environment Variables**
If frontend can't find backend:
1. Check Vercel environment variables
2. Verify `NEXT_PUBLIC_BACKEND_API_URL` is set
3. Redeploy frontend after setting variables

### **Solution 3: Backend Not Fully Deployed**
If backend is partially working:
1. Check Render deployment status
2. Wait for full deployment
3. Check backend logs for errors

---

## 🧪 **Testing Steps**

### **1. Test Backend Health:**
```bash
curl https://hope-backend-2.onrender.com/auth/login
# Should return 401 (this is good)
```

### **2. Test CORS:**
```javascript
// In browser console on your site
fetch('https://hope-backend-2.onrender.com/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email:'test',password:'test'})
})
.then(r => console.log('Status:', r.status))
.catch(e => console.error('Error:', e));
```

### **3. Check Environment Variables:**
```javascript
// In browser console
console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_API_URL);
```

---

## 🚀 **Next Steps**

1. **Check which domain you're testing from**
2. **Run the CORS test in browser console**
3. **Check Vercel environment variables**
4. **Check Render backend logs**
5. **Share the results** so I can provide a targeted fix

**Status:** Backend is running, need to identify the connection issue! 🔍
