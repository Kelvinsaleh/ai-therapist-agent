# AI Chat Page Issues - Diagnosis and Solutions

## Issues Identified

### 1. **DNS Resolution Error - Wrong Domain**
**Error:** `GET https://ultra-predict.co.ke/api/chat/sessions net::ERR_NAME_NOT_RESOLVED`

**Problem:** 
- You're accessing the app from `ultra-predict.co.ke` which has DNS issues
- This domain either doesn't exist or isn't properly configured

**Solution:** Access the app from the correct URLs:
- **Local Development:** `http://localhost:3000`
- **Production:** `https://ai-therapist-agent-theta.vercel.app`

### 2. **Missing Environment Variables**
**Problem:** No `.env.local` file exists for local development

**Solution:** Created `.env.local` with proper configuration:
```env
NEXT_PUBLIC_BACKEND_API_URL=https://hope-backend-2.onrender.com
BACKEND_API_URL=https://hope-backend-2.onrender.com
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
```

### 3. **Chat Session Not Found (404)**
**Error:** `POST https://ultra-predict.co.ke/api/chat/sessions/session-1761344559181-to92i0oqi/messages 404 (Not Found)`

**Problem:** 
- Session created in frontend doesn't exist in backend
- Possible mismatch between local storage and backend database

**Solutions:**
- Clear browser localStorage and create a new session
- Ensure backend is running and accessible
- Check backend logs for session creation

### 4. **Network Connectivity Issues**
**Errors:** `ERR_NETWORK_CHANGED`, `ERR_INTERNET_DISCONNECTED`

**Problem:** Intermittent network issues or unstable connection

**Solution:** 
- Ensure stable internet connection
- Backend on Render may have cold starts - first request can be slow

## How the Chat System Works

### Architecture Flow
```
User Browser → Next.js Frontend (localhost:3000 or Vercel)
              ↓ (calls /api/chat/*)
            Next.js API Routes (app/api/chat/*)
              ↓ (proxies to)
            Backend API (hope-backend-2.onrender.com)
              ↓ (stores in)
            MongoDB Atlas Database
```

### Key Files
1. **Frontend API Client:** `lib/api/chat.ts`
   - Handles all chat API calls
   - Uses `/api/chat` as base URL (Next.js API routes)

2. **Next.js API Proxy:** `app/api/chat/sessions/route.ts`
   - Proxies requests to backend
   - Adds authentication headers
   - Handles retries and timeouts

3. **Backend API:** `Hope-backend/src/routes/chat.ts`
   - Manages chat sessions in MongoDB
   - Processes AI responses via Gemini API

## Immediate Actions Required

### For Local Development:

1. **Use Correct URL**
   ```bash
   # Start the dev server
   npm run dev
   
   # Access at http://localhost:3000 (NOT ultra-predict.co.ke)
   ```

2. **Clear Browser Data**
   - Open DevTools (F12)
   - Go to Application tab
   - Clear Storage → localStorage
   - Refresh the page

3. **Verify Environment Variables**
   ```bash
   # Check .env.local exists
   cat .env.local
   
   # Restart dev server after changes
   npm run dev
   ```

### For Production:

1. **Access from Correct Domain**
   - Use: `https://ai-therapist-agent-theta.vercel.app`
   - NOT: `ultra-predict.co.ke`

2. **Verify Vercel Environment Variables**
   Go to Vercel Dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_BACKEND_API_URL = https://hope-backend-2.onrender.com
   BACKEND_API_URL = https://hope-backend-2.onrender.com
   NEXTAUTH_URL = https://ai-therapist-agent-theta.vercel.app
   NEXTAUTH_SECRET = <secure-secret>
   BLOB_READ_WRITE_TOKEN = <your-token>
   ```

3. **Check Backend Health**
   ```bash
   # Test backend is running
   curl https://hope-backend-2.onrender.com/health
   ```

4. **If Using Custom Domain (ultra-predict.co.ke)**
   You need to:
   - Configure DNS properly to point to Vercel
   - Add domain in Vercel Dashboard → Domains
   - Wait for DNS propagation (can take 24-48 hours)
   - Update NEXTAUTH_URL to use the custom domain

## Testing the Chat

### Step 1: Test Backend Connection
```bash
# From your terminal
curl https://hope-backend-2.onrender.com/health

# Expected response:
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Step 2: Test Session Creation
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to `/therapy` or `/therapy/new`
4. Check for:
   - POST request to `/api/chat/sessions`
   - Should return 200 with sessionId

### Step 3: Test Message Sending
1. Type a message in chat
2. Check Network tab for:
   - POST to `/api/chat/sessions/[sessionId]/messages`
   - Should return 200 with AI response

### Step 4: Check Browser Console
- Should NOT see CORS errors
- Should NOT see 404 errors
- Should see "Message sent successfully" logs

## Common Errors and Fixes

### Error: "Failed to fetch"
**Cause:** Backend not accessible or CORS issue
**Fix:** 
- Check backend is running: `https://hope-backend-2.onrender.com/health`
- Verify CORS allows your domain in `Hope-backend/src/index.ts`

### Error: "Chat session not found"
**Cause:** Session expired or not created
**Fix:**
- Clear localStorage
- Create new session via `/therapy/new`

### Error: "Authentication required"
**Cause:** No auth token
**Fix:**
- Login at `/login`
- Check token exists in localStorage: `localStorage.getItem('token')`

## Monitoring

### Frontend Logs (Browser Console)
```javascript
// Check current configuration
console.log('API Base:', '/api/chat');
console.log('Auth Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
```

### Backend Logs (Render Dashboard)
- Go to Render Dashboard → Your Service → Logs
- Look for:
  - "POST /chat/sessions" - Session creation
  - "POST /chat/sessions/:id/messages" - Message handling
  - Any errors or timeouts

## Next Steps

1. ✅ Access app from correct URL (localhost:3000 or Vercel URL)
2. ✅ Verify .env.local is created with correct values
3. ✅ Clear browser localStorage
4. ✅ Test backend health endpoint
5. ✅ Create new chat session
6. ✅ Send test message
7. ✅ Check browser console and network tab for errors

## If Problems Persist

If you still see errors after following the above steps:

1. **Share the following info:**
   - What URL are you accessing? (localhost or production)
   - Browser console errors (full stack trace)
   - Network tab showing failed requests
   - Backend logs from Render dashboard

2. **Check Backend:**
   ```bash
   cd Hope-backend
   npm run dev
   # Test if backend works locally
   ```

3. **Verify Database Connection:**
   - Check MongoDB Atlas is accessible
   - Verify connection string in backend .env
   - Check backend logs for database errors

## Domain Configuration (If Using ultra-predict.co.ke)

If you want to use `ultra-predict.co.ke` as your custom domain:

### Step 1: Configure DNS
Point your domain to Vercel:
```
Type: CNAME
Name: @ (or www)
Value: cname.vercel-dns.com
```

### Step 2: Add Domain in Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Domains
4. Add `ultra-predict.co.ke`
5. Wait for DNS propagation

### Step 3: Update Environment Variables
Update in Vercel:
```
NEXTAUTH_URL = https://ultra-predict.co.ke
```

Update backend CORS (it's already configured):
```typescript
// Hope-backend/src/index.ts (line 52-53)
'https://ultra-predict.co.ke',
'http://ultra-predict.co.ke'
```

### Step 4: Redeploy
- Frontend: Trigger new deployment in Vercel
- Backend: Ensure it's running on Render

---

**Status:** Issues identified and solutions provided
**Last Updated:** {{currentDate}}

