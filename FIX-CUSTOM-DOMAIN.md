# Fix Custom Domain (ultra-predict.co.ke) for AI Therapist App

## Current Problem
Your app is deployed at `ai-therapist-agent-theta.vercel.app` but you're trying to access it from `ultra-predict.co.ke`, which causes DNS errors.

## Solution: Configure Custom Domain in Vercel

### Step 1: Add Domain in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **ai-therapist-agent-theta**
3. Go to **Settings** → **Domains**
4. Click **Add** and enter: `ultra-predict.co.ke`
5. Vercel will show you DNS records to configure

### Step 2: Configure DNS at Your Domain Provider
Go to where you registered `ultra-predict.co.ke` (e.g., Namecheap, GoDaddy, etc.) and add:

**For Root Domain (ultra-predict.co.ke):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For WWW subdomain (www.ultra-predict.co.ke):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**OR use CNAME for root (if your DNS provider supports it):**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### Step 3: Wait for DNS Propagation
- DNS changes can take 1-48 hours to propagate
- Check status: https://dnschecker.org/#A/ultra-predict.co.ke

### Step 4: Update Environment Variables in Vercel
Once domain is verified:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Update: `NEXTAUTH_URL = https://ultra-predict.co.ke`
3. Click **Redeploy** to apply changes

### Step 5: Verify Backend CORS (Already Configured)
Your backend already allows `ultra-predict.co.ke`:
```typescript
// Hope-backend/src/index.ts (lines 52-53)
'https://ultra-predict.co.ke',
'http://ultra-predict.co.ke'
```

## Quick Test: Use Vercel URL Now

While waiting for DNS setup, access your app at:
**https://ai-therapist-agent-theta.vercel.app**

This should work immediately with no DNS issues.

## Troubleshooting Chat Session Issues

### Issue: "Chat session not found" (404)

**Fix 1: Clear Browser Storage**
```javascript
// Open browser DevTools (F12) → Console, run:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

**Fix 2: Create New Session**
1. Go to `/therapy/new` - this creates a fresh session
2. Or click "New Session" button in the therapy page

**Fix 3: Check Backend is Running**
```bash
# Test backend health
curl https://hope-backend-2.onrender.com/health

# Should return:
{"status":"ok","timestamp":"..."}
```

### Issue: Backend Cold Start (Render Free Tier)
If backend on Render is on free tier, it "sleeps" after inactivity.

**Symptoms:**
- First request takes 30-60 seconds
- Timeouts on first chat message

**Solutions:**
- Wait for backend to wake up (first request is slow)
- Upgrade to paid Render plan for always-on backend
- Use Render's "Keep Alive" service

## Testing Checklist

### ✅ Test 1: Access from Vercel URL
```
URL: https://ai-therapist-agent-theta.vercel.app
Expected: App loads, no DNS errors
```

### ✅ Test 2: Check Backend Health
```bash
curl https://hope-backend-2.onrender.com/health
Expected: {"status":"ok"}
```

### ✅ Test 3: Create Chat Session
```
1. Go to /therapy/new
2. Check browser Network tab
3. Should see POST to /api/chat/sessions
4. Should get 200 response with sessionId
```

### ✅ Test 4: Send Message
```
1. Type message in chat
2. Check Network tab
3. Should see POST to /api/chat/sessions/[id]/messages
4. Should get 200 with AI response
```

### ✅ Test 5: Check Browser Console
```
Open DevTools (F12) → Console
Should NOT see:
- ERR_NAME_NOT_RESOLVED
- Failed to fetch
- CORS errors
```

## Current DNS Status Check

Run this to check if your domain resolves:
```bash
# Windows PowerShell
nslookup ultra-predict.co.ke

# Expected if NOT configured:
# Server: UnKnown
# Address: ...
# *** UnKnown can't find ultra-predict.co.ke: Non-existent domain

# Expected if CONFIGURED:
# Non-authoritative answer:
# Name:    ultra-predict.co.ke
# Address: 76.76.21.21
```

## Summary

**Immediate Action:**
1. Access app from `https://ai-therapist-agent-theta.vercel.app` (works NOW)
2. Clear browser storage if you see "session not found"

**For Custom Domain:**
1. Add `ultra-predict.co.ke` in Vercel Dashboard → Domains
2. Configure DNS at your domain registrar
3. Wait 1-48 hours for DNS propagation
4. Update NEXTAUTH_URL in Vercel environment variables
5. Redeploy

**Backend Issues:**
- Render free tier has cold starts (30-60s first request)
- Check health endpoint: `https://hope-backend-2.onrender.com/health`
- Backend CORS already configured for your domains

---

Need help with any specific step? Let me know!

