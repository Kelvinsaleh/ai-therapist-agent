# 🚨 IMMEDIATE FIXES REQUIRED BEFORE PRODUCTION

## Critical Issues That MUST Be Fixed Now

### 1. Fix Backend File Encoding (30 minutes)
**BLOCKER:** Backend cannot start due to UTF-16 encoding

**Quick Fix:**
```powershell
# Run from project root
.\fix-encoding-issues.ps1
```

Or manually: Open each file in VSCode and "Save with Encoding" → UTF-8

**Files to fix:**
- `Hope-backend/src/controllers/analyticsController.ts`
- `Hope-backend/src/controllers/rescuePairController.ts`
- `Hope-backend/src/middleware/premiumAccess.ts`
- `Hope-backend/src/models/Subscription.ts`
- `Hope-backend/src/models/UserProfile.ts`
- `Hope-backend/src/routes/index.ts`
- `Hope-backend/src/routes/meditation.ts`
- `Hope-backend/src/routes/memoryEnhancedChat.ts`
- `Hope-backend/src/routes/rescuePairs.ts`
- `Hope-backend/src/routes/user.ts`

---

### 2. Remove Mock Authentication (15 minutes)
**SECURITY RISK:** Anyone can bypass auth with test credentials

**File:** `app/api/auth/session/route.ts`
**Remove lines 13-23:**
```typescript
// DELETE THIS
if (token === "mock-jwt-token-for-testing") {
  return NextResponse.json({
    isAuthenticated: true,
    user: {
      id: "test-user-id",
      email: "test@example.com",
      name: "Test User",
      _id: "test-user-id"
    }
  });
}
```

**File:** `app/api/auth/signin/route.ts`
**Delete entire file** - it's only for testing. Real auth goes through `/api/auth/login`

---

### 3. Set Environment Variables (10 minutes)

**Create `.env.local` in project root:**
```env
# Backend API
NEXT_PUBLIC_BACKEND_API_URL=https://hope-backend-2.onrender.com
BACKEND_API_URL=https://hope-backend-2.onrender.com

# NextAuth
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=generate-random-secret-here

# Vercel Blob (for meditation uploads)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

**Set in Render.com dashboard (Hope-backend):**
```env
GEMINI_API_KEY=your-google-gemini-key
JWT_SECRET=generate-random-secret-here
MONGODB_URI=your-mongodb-atlas-uri
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
PORT=8000
```

**Generate secrets:**
```bash
# For NextAuth and JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 4. Remove Console.log Statements (Optional but Recommended)

**Quick find and comment:**
```typescript
// Replace in all app/api files
console.log(...) → // console.log(...) 
console.error(...) → console.error(...) // Keep errors
```

Or add environment guard:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log(...);
}
```

---

## Verification Steps

### 1. Test Backend Starts
```bash
cd Hope-backend
npm run build
npm run dev
```

Expected: Server starts on port 8000 without errors

### 2. Test Auth Flow
1. Go to http://localhost:3001/login
2. Sign in with real credentials
3. Should redirect to /therapy/memory-enhanced
4. Refresh page - should stay logged in

### 3. Test CBT Features
1. Go to /cbt/dashboard
2. Create a thought record
3. View insights
4. Check that AI generates real responses

### 4. Test Production Build
```bash
# Frontend
npm run build
npm start

# Should build without errors
```

---

## Priority Order

**Do These First (1 hour):**
1. ✅ Run `fix-encoding-issues.ps1`
2. ✅ Remove mock auth from `/api/auth/session` and `/api/auth/signin`
3. ✅ Set environment variables

**Do These Today (2-3 hours):**
4. ✅ Test backend starts successfully
5. ✅ Test authentication end-to-end
6. ✅ Comment out console.log statements
7. ✅ Test production build

**Do Before Launch (4-6 hours):**
8. ✅ Add rate limiting to API routes
9. ✅ Set up Sentry error monitoring
10. ✅ Add security headers to next.config.mjs
11. ✅ Load test with 100+ concurrent users
12. ✅ Test from multiple devices/browsers

---

## Quick Security Headers Fix

**Add to `next.config.mjs`:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## Quick Rate Limiting Fix

**Create `lib/rate-limit.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server';

const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(req: NextRequest, maxRequests = 10, windowMs = 60000) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  const record = rateLimit.get(ip);
  
  if (!record || record.resetTime < now) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return null;
  }
  
  if (record.count >= maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  record.count++;
  return null;
}
```

**Use in API routes:**
```typescript
export async function POST(req: NextRequest) {
  const rateLimitError = checkRateLimit(req, 10, 60000);
  if (rateLimitError) return rateLimitError;
  
  // Your code here...
}
```

---

## Emergency Rollback

If something breaks:

```bash
# Frontend
vercel --prod rollback

# Backend (Render)
# Go to Render dashboard → Deployments → Rollback to previous
```

---

## Support Checklist

Before going live, ensure you have:
- [ ] Sentry account set up
- [ ] Render dashboard access
- [ ] Vercel dashboard access
- [ ] MongoDB Atlas access
- [ ] Google Cloud Console access (for Gemini API)
- [ ] Domain registrar access (if custom domain)

---

## Production URLs

**Update these after deployment:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://hope-backend-2.onrender.com`
- Database: MongoDB Atlas cluster

---

## Contact for Production Issues

- Backend crashes: Check Render logs
- Frontend errors: Check Vercel deployment logs
- Database issues: Check MongoDB Atlas metrics
- API errors: Check Sentry dashboard (after setup)

---

**Time to Production Ready:** ~2-4 hours for critical fixes
**Recommended:** Fix critical issues today, deploy tomorrow after testing

