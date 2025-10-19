# 🔐 Authentication Debug Guide

## Common Sign-In Issues and Solutions

### **Issue 1: "Network connection issue" Error**

**Symptoms:**
- Error message: "Network connection issue. Please check your internet connection and try again."
- Appears even when internet is working

**Causes:**
1. **CORS Issues** - Backend not allowing frontend domain
2. **Backend Down** - Render service not responding
3. **Wrong Backend URL** - Environment variable not set correctly
4. **Token Validation Failing** - JWT secret mismatch

### **Issue 2: "Invalid credentials" Error**

**Symptoms:**
- Error message: "Invalid email or password"
- Appears even with correct credentials

**Causes:**
1. **Backend Database Connection** - MongoDB not connected
2. **User Not Found** - User doesn't exist in database
3. **Password Hash Mismatch** - Backend password hashing issue

### **Issue 3: "Already Connected" but Still Shows Sign-In**

**Symptoms:**
- User appears logged in but sign-in page still shows
- Session context not updating properly

**Causes:**
1. **Token Storage Issue** - Token not saved in localStorage
2. **Session Validation Failing** - Backend `/auth/me` endpoint failing
3. **CORS Blocking Session Check** - Session API call being blocked

---

## 🔍 **Debugging Steps**

### **Step 1: Check Browser Console**

Open browser DevTools (F12) and look for:

```javascript
// Check for these errors:
- CORS errors
- Network errors
- Authentication errors
- Token validation errors
```

### **Step 2: Check Network Tab**

1. Go to Network tab in DevTools
2. Try to sign in
3. Look for failed requests:
   - `/api/auth/session` - Should return 200
   - Backend calls to `https://hope-backend-2.onrender.com` - Should return 200

### **Step 3: Check localStorage**

```javascript
// In browser console, check:
localStorage.getItem('token')
localStorage.getItem('authToken')
```

### **Step 4: Test Backend Directly**

```bash
# Test if backend is responding
curl https://hope-backend-2.onrender.com/api/health

# Test authentication endpoint
curl -X POST https://hope-backend-2.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## 🛠️ **Quick Fixes**

### **Fix 1: Clear Browser Data**

```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
// Then refresh the page
```

### **Fix 2: Check Environment Variables**

Make sure these are set in Vercel:
- `NEXT_PUBLIC_BACKEND_API_URL=https://hope-backend-2.onrender.com`
- `BACKEND_API_URL=https://hope-backend-2.onrender.com`

### **Fix 3: Test CORS**

```javascript
// In browser console:
fetch('https://hope-backend-2.onrender.com/api/health', {
  method: 'GET',
  headers: {
    'Origin': window.location.origin
  }
})
.then(response => console.log('CORS Test:', response.status))
.catch(error => console.error('CORS Error:', error));
```

---

## 🚨 **Emergency Fixes**

### **Fix 1: Force Re-authentication**

```javascript
// In browser console:
localStorage.removeItem('token');
localStorage.removeItem('authToken');
sessionStorage.clear();
window.location.reload();
```

### **Fix 2: Bypass Session Check (Temporary)**

If session check is failing, you can temporarily bypass it by modifying the session context.

### **Fix 3: Check Backend Logs**

1. Go to Render dashboard
2. Check service logs for:
   - CORS errors
   - Database connection errors
   - Authentication errors

---

## 📋 **Checklist for Authentication Issues**

- [ ] Backend is running (check Render dashboard)
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Database is connected
- [ ] JWT_SECRET is set in backend
- [ ] Frontend can reach backend
- [ ] Token is being saved in localStorage
- [ ] Session validation is working

---

## 🎯 **Most Common Solutions**

1. **Clear browser data and try again**
2. **Check if backend is running on Render**
3. **Verify CORS configuration**
4. **Check environment variables in Vercel**
5. **Test backend endpoints directly**

**Need more specific help?** Please share:
- The exact error message you see
- Browser console errors
- Network tab failed requests
- Your current domain (Vercel or ultra-predict.co.ke)
