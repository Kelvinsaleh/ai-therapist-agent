# Production Deployment Guide

## Overview
This guide covers deploying the AI Therapist Web App to production with all security and performance optimizations.

## Pre-Deployment Checklist

### ✅ Security Fixes Applied
- [x] Removed exposed API keys from source code
- [x] Fixed localStorage usage in SSR contexts
- [x] Added input validation to API routes
- [x] Implemented production-safe logging
- [x] Added error boundaries with proper error handling
- [x] Fixed useEffect dependency warnings
- [x] Added null checks for array operations
- [x] Fixed race conditions in state updates

### ✅ Code Quality Improvements
- [x] Replaced console.log with production logger
- [x] Added TypeScript strict mode compliance
- [x] Fixed client-side rendering warnings
- [x] Added Suspense boundaries for dynamic imports
- [x] Implemented proper error handling patterns

### ✅ Dependencies
- [x] Updated vulnerable packages where possible
- [x] Fixed peer dependency conflicts
- [x] Verified build success

## Environment Setup

### 1. Environment Variables
Copy the example files and configure:

```bash
# Copy environment templates
cp .env.local.example .env.local
cp .env.production.example .env.production

# Edit with your production values
nano .env.production
```

### Required Environment Variables:
```bash
# Backend Configuration
NEXT_PUBLIC_BACKEND_URL=https://your-production-backend.com
BACKEND_API_URL=https://your-production-backend.com

# Payment Configuration  
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_production_paystack_key

# Environment
NODE_ENV=production

# Optional: Monitoring
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### 2. Backend Configuration
Ensure your backend has:
- Proper CORS configuration for your domain
- Rate limiting enabled
- Input validation on all endpoints
- Secure session management
- Environment variables properly configured

## Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# or via CLI:
vercel env add NEXT_PUBLIC_BACKEND_URL production
vercel env add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY production
```

### Option 2: Docker
```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

### Option 3: Traditional Server
```bash
# Build the application
npm run build

# Start production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "ai-therapist" -- start
pm2 save
pm2 startup
```

## Security Considerations

### 1. HTTPS Enforcement
Ensure your deployment platform enforces HTTPS:
- Vercel: Automatic HTTPS
- Custom server: Configure reverse proxy (nginx/Apache)

### 2. Security Headers
Add security headers in `next.config.mjs`:
```javascript
const nextConfig = {
  // ... existing config
  async headers() {
    return [
      {
        source: '/(.*)',
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
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

### 3. Rate Limiting
Implement rate limiting on your backend:
- Login attempts: 5 per minute per IP
- API calls: 100 per minute per user
- File uploads: 10 per hour per user

### 4. Content Security Policy
Add CSP headers to prevent XSS attacks:
```javascript
{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://your-backend.com;",
}
```

## Performance Optimization

### 1. Image Optimization
- Use Next.js Image component for all images
- Implement lazy loading
- Use WebP format where supported

### 2. Bundle Analysis
```bash
# Analyze bundle size
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

### 3. Caching Strategy
- Static assets: Cache for 1 year
- API responses: Cache for 5 minutes
- User data: No cache, always fresh

### 4. Database Optimization
- Use connection pooling
- Implement query optimization
- Add database indexes for frequently queried fields

## Monitoring & Logging

### 1. Error Tracking
Integrate Sentry or similar service:
```javascript
// In your error boundary
import * as Sentry from '@sentry/nextjs';

Sentry.captureException(error);
```

### 2. Performance Monitoring
- Use Vercel Analytics or Google Analytics
- Monitor Core Web Vitals
- Set up alerts for performance degradation

### 3. Logging
The app uses a production-safe logger:
- Development: All logs visible
- Production: Only errors and warnings
- Consider integrating with log aggregation service

## Testing in Production

### 1. Smoke Tests
Test critical user flows:
- [ ] User registration
- [ ] User login
- [ ] Therapy session creation
- [ ] Payment processing
- [ ] Mood tracking

### 2. Performance Tests
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] No memory leaks
- [ ] Proper error handling

### 3. Security Tests
- [ ] HTTPS enforced
- [ ] No exposed sensitive data
- [ ] Input validation working
- [ ] Rate limiting active

## Maintenance

### 1. Regular Updates
- Update dependencies monthly
- Monitor security advisories
- Keep Node.js version current

### 2. Backup Strategy
- Database backups daily
- Code repository backups
- Environment variable backups

### 3. Monitoring Alerts
Set up alerts for:
- High error rates
- Slow response times
- High memory usage
- Failed deployments

## Troubleshooting

### Common Issues:

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Environment Variable Issues**
   - Verify all required variables are set
   - Check variable names match exactly
   - Ensure no trailing spaces

3. **API Connection Issues**
   - Verify backend URL is correct
   - Check CORS configuration
   - Test backend health endpoint

4. **Performance Issues**
   - Run bundle analyzer
   - Check for memory leaks
   - Optimize images and assets

## Support

For deployment issues:
1. Check the logs in your deployment platform
2. Verify environment variables
3. Test locally with production environment
4. Contact support with specific error messages

---

**Last Updated:** $(date)
**Version:** 1.0.0
**Status:** Production Ready ✅