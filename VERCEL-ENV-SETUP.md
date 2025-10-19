# 🔧 Vercel Environment Variables Setup

## 🚨 **CRITICAL: Environment Variables Missing**

Since both domains are failing, the issue is likely **missing environment variables in Vercel**.

---

## 🛠️ **Step 1: Set Vercel Environment Variables**

### **Go to Vercel Dashboard:**
1. Visit: https://vercel.com/dashboard
2. Select your project: `ai-therapist-agent`
3. Go to **Settings** → **Environment Variables**

### **Add These Variables:**

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_BACKEND_API_URL` | `https://hope-backend-2.onrender.com` | Production, Preview, Development |
| `BACKEND_API_URL` | `https://hope-backend-2.onrender.com` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://ai-therapist-agent-theta.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://ultra-predict.co.ke` | Production |
| `NEXTAUTH_SECRET` | `568eb71487b9f26500740b1d9eac270451f78a887ef30f27038f2ad55594b6ca` | All |
| `BLOB_READ_WRITE_TOKEN` | `your-vercel-blob-token` | All |

---

## 🛠️ **Step 2: Set Render Environment Variables**

### **Go to Render Dashboard:**
1. Visit: https://dashboard.render.com
2. Select your backend service: `hope-backend-2`
3. Go to **Environment**

### **Add These Variables:**

| Variable | Value |
|----------|-------|
| `FRONTEND_URL` | `https://ai-therapist-agent-theta.vercel.app` |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `79b6d65ed0ad2b6e2526430621dd88d54723d5b2db053efa50645964d39661b3` |
| `GEMINI_API_KEY` | `your-gemini-api-key` |
| `PORT` | `8000` |

---

## 🧪 **Step 3: Test After Setting Variables**

### **Test 1: Check Environment Variables**
After setting variables, redeploy and test:

```javascript
// In browser console on your site
console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_API_URL);
// Should show: https://hope-backend-2.onrender.com
```

### **Test 2: Test Backend Connection**
```javascript
// In browser console
fetch('https://hope-backend-2.onrender.com/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email:'test',password:'test'})
})
.then(r => console.log('Backend Status:', r.status))
.catch(e => console.error('Backend Error:', e));
```

### **Test 3: Test CORS**
```javascript
// In browser console
fetch('https://hope-backend-2.onrender.com/auth/login', {
  method: 'OPTIONS',
  headers: {
    'Origin': window.location.origin,
    'Access-Control-Request-Method': 'POST'
  }
})
.then(r => console.log('CORS Status:', r.status))
.catch(e => console.error('CORS Error:', e));
```

---

## 🚀 **Step 4: Redeploy After Setting Variables**

### **Vercel:**
1. After setting environment variables
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment

### **Render:**
1. After setting environment variables
2. Go to **Events** tab
3. Click **Manual Deploy**

---

## 🔍 **Step 5: Verify Fix**

After redeploying both services:

1. **Test from Vercel domain:** `https://ai-therapist-agent-theta.vercel.app`
2. **Test from your domain:** `https://ultra-predict.co.ke`
3. **Check browser console** for any remaining errors
4. **Try to sign in** with valid credentials

---

## 🎯 **Expected Results**

After setting environment variables and redeploying:

✅ **Frontend can reach backend**  
✅ **CORS errors resolved**  
✅ **Authentication works**  
✅ **Both domains work properly**  

---

## 🚨 **If Still Not Working**

If you still see "Unable to connect to the server" after setting environment variables:

1. **Check Render logs** for CORS errors
2. **Check Vercel logs** for environment variable issues
3. **Verify backend is running** at `https://hope-backend-2.onrender.com`
4. **Test backend directly** with curl or browser

**Status:** Need to set environment variables in both Vercel and Render! 🔧
