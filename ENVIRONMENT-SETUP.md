# Environment Variables Setup Guide

## Frontend (.env.local)

Create a file named `.env.local` in the project root with these variables:

```env
# ========================================
# REQUIRED FOR PRODUCTION
# ========================================

# Backend API Configuration
NEXT_PUBLIC_BACKEND_API_URL=https://hope-backend-2.onrender.com
BACKEND_API_URL=https://hope-backend-2.onrender.com

# NextAuth Configuration
NEXTAUTH_URL=https://your-app.vercel.app
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

### Generate NEXTAUTH_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Get BLOB_READ_WRITE_TOKEN:
1. Go to Vercel Dashboard → Your Project
2. Navigate to Storage → Blob
3. Create a new store or use existing
4. Copy the token from Settings

---

## Backend (.env in Hope-backend/)

Create a file named `.env` in the `Hope-backend/` directory:

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

### Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Get GEMINI_API_KEY:
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create new API key
4. Copy the key

**⚠️ IMPORTANT:** Never commit `.env` files to git!

---

## Vercel Deployment Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_BACKEND_API_URL` | `https://hope-backend-2.onrender.com` | Production, Preview, Development |
| `BACKEND_API_URL` | `https://hope-backend-2.onrender.com` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production |
| `NEXTAUTH_URL` | Auto-generated preview URL | Preview |
| `NEXTAUTH_URL` | `http://localhost:3000` | Development |
| `NEXTAUTH_SECRET` | Generated secret | All |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | All |

---

## Render Deployment Environment Variables

Set these in Render Dashboard → Your Service → Environment:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Generated secret (32+ characters) |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://ai-therapist-agent-theta.vercel.app` |
| `PORT` | `8000` |

---

## Security Best Practices

### 1. Secret Generation
Never use simple passwords. Generate cryptographically secure secrets:

```bash
# On Mac/Linux
openssl rand -base64 32

# Using Node.js (Works everywhere)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# PowerShell (Windows)
[Convert]::ToBase64String((1..32|%{Get-Random -Min 0 -Max 256}))
```

### 2. Rotate Secrets Regularly
- Change JWT_SECRET every 90 days
- Change NEXTAUTH_SECRET every 90 days
- Revoke old tokens after rotation

### 3. Separate Environments
Use different secrets for:
- Development
- Staging
- Production

### 4. Never Hardcode
❌ **Bad:**
```typescript
const API_KEY = "sk-abc123...";
```

✅ **Good:**
```typescript
const API_KEY = process.env.GEMINI_API_KEY!;
```

---

## Validation Checklist

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

## Testing Environment Variables

### Test Frontend:
```bash
npm run build
```
Should build without "missing environment variable" warnings

### Test Backend:
```bash
cd Hope-backend
npm run build
npm start
```
Should start without "undefined" errors in logs

### Test Authentication:
1. Login with real credentials
2. Check browser console for errors
3. Verify token is saved in localStorage
4. Refresh page - should stay logged in

### Test CBT AI:
1. Go to /cbt/dashboard
2. Create a thought record
3. Generate AI insights
4. Should return real AI-generated content (not errors)

---

## Troubleshooting

### "Cannot read environment variable"
- Check variable name spelling
- Restart development server after adding variables
- For NEXT_PUBLIC_* variables, rebuild the app

### "CORS error"
- Verify FRONTEND_URL in backend matches deployed URL
- Check allowed origins in Hope-backend/src/index.ts

### "Authentication failed"
- Verify JWT_SECRET is set in backend
- Check NEXTAUTH_SECRET is set in frontend
- Clear browser localStorage and try again

### "AI insights not working"
- Verify GEMINI_API_KEY is set correctly
- Check Google Cloud Console for API quotas
- Look for errors in Render logs

---

## Production URLs

**Update these after deployment:**

**Frontend (Vercel):**
- Production: `https://ai-therapist-agent-theta.vercel.app`
- Or custom domain: `https://yourdomain.com`

**Backend (Render):**
- Production: `https://hope-backend-2.onrender.com`

**Database (MongoDB Atlas):**
- Connection managed through MONGODB_URI

---

## Quick Reference

**Get Vercel Blob Token:**
Vercel Dashboard → Storage → Blob → Settings → Token

**Get Gemini API Key:**
https://makersuite.google.com/app/apikey

**Generate Secure Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Check Environment in Code:**
```typescript
console.log('ENV:', process.env.NODE_ENV);
console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_API_URL);
```

---

## Support

If environment variables aren't working:
1. Check Vercel deployment logs
2. Check Render deployment logs
3. Verify variable names (case-sensitive)
4. Restart services after changing variables
5. Redeploy if variables were added after deployment

