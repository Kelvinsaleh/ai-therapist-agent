# 🚀 Complete Setup Guide - AI Therapist Agent

## Overview
This guide covers the complete setup of the AI Therapist application, including frontend (Next.js), backend (Express), and all required services.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Email Service Setup](#email-service-setup)
5. [Payment Integration](#payment-integration)
6. [Database Setup](#database-setup)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: v18+ (recommended: v20)
- **npm**: v9+ or yarn v1.22+
- **Git**: Latest version
- **MongoDB**: Atlas account (cloud) or local MongoDB

### Required Accounts
- **Google Account**: For Gemini AI API
- **MongoDB Atlas**: For database
- **Paystack Account**: For payments (optional)
- **Email Service**: Gmail with App Password or SMTP service
- **Vercel**: For frontend deployment (optional)
- **Render/Railway**: For backend deployment (optional)

---

## 🔧 Backend Setup

### Step 1: Install Dependencies
```bash
cd Hope-backend
npm install
```

### Step 2: Create Environment File
Create `.env` file in `Hope-backend/` directory:

```env
# ========================================
# REQUIRED CONFIGURATION
# ========================================

# Environment
NODE_ENV=production
PORT=3001

# Database Connection (CRITICAL)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=YourApp

# JWT Secret (Generate secure random string)
JWT_SECRET=your-secure-jwt-secret-here

# Gemini AI API Key (CRITICAL for AI features)
GEMINI_API_KEY=your-gemini-api-key-here

# ========================================
# EMAIL SERVICE (CRITICAL for OTP)
# ========================================
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# ========================================
# FRONTEND CONFIGURATION
# ========================================
FRONTEND_URL=https://your-frontend-url.vercel.app
CORS_ORIGIN=https://your-frontend-url.vercel.app

# ========================================
# PAYMENT CONFIGURATION (Optional)
# ========================================
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_MONTHLY_PLAN_CODE=PLN_your_monthly_plan
PAYSTACK_ANNUAL_PLAN_CODE=PLN_your_annual_plan

# ========================================
# BACKEND API URLS
# ========================================
BACKEND_API_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-url.onrender.com
```

### Step 3: Setup Email Service
See `Hope-backend/EMAIL_SETUP_GUIDE.md` for detailed instructions.

**Quick Gmail Setup:**
1. Go to https://myaccount.google.com/apppasswords
2. Generate App Password
3. Add to `.env` file

### Step 4: Get Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Create new API key
3. Add to `.env` as `GEMINI_API_KEY`

### Step 5: Build and Start
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### Step 6: Verify Backend
- Check logs for: `✅ Email service initialized successfully`
- Check logs for: `✅ Connected to MongoDB`
- Visit: `http://localhost:3001/health`

---

## 💻 Frontend Setup

### Step 1: Install Dependencies
```bash
cd ..  # Back to root directory
npm install
```

### Step 2: Create Environment File
Create `.env.local` file in root directory:

```env
# ========================================
# BACKEND API CONFIGURATION
# ========================================
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001
BACKEND_API_URL=http://localhost:3001

# For production:
# NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-url.onrender.com
# BACKEND_API_URL=https://your-backend-url.onrender.com

# ========================================
# AI CONFIGURATION
# ========================================
GEMINI_API_KEY=your-gemini-api-key-here

# ========================================
# PAYMENT CONFIGURATION
# ========================================
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key

# ========================================
# FILE STORAGE (Vercel Blob)
# ========================================
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# ========================================
# AUTHENTICATION
# ========================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# For production:
# NEXTAUTH_URL=https://your-frontend-url.vercel.app
```

### Step 3: Run Development Server
```bash
npm run dev
```

### Step 4: Verify Frontend
- Visit: `http://localhost:3000`
- Check browser console for errors
- Test signup/login flow

---

## 📧 Email Service Setup

### Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" → "Other (Custom name)"
   - Name it "AI Therapist Backend"
   - Copy the 16-character password

3. **Update Backend .env**
   ```env
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASSWORD=xxxxxxxxxxxxxxxx
   ```

### SendGrid (Recommended for Production)

1. **Create Account**: https://sendgrid.com/
2. **Get API Key**: Settings → API Keys
3. **Update Backend .env**:
   ```env
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your-sendgrid-api-key
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   ```

---

## 💳 Payment Integration (Paystack)

### Step 1: Create Paystack Account
- Go to https://paystack.com/
- Sign up and verify account

### Step 2: Get API Keys
- Dashboard → Settings → API Keys & Webhooks
- Copy Test and Live keys

### Step 3: Create Payment Plans
```bash
# Create monthly plan
curl -X POST https://api.paystack.co/plan \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Monthly",
    "amount": 500000,
    "interval": "monthly"
  }'

# Create annual plan
curl -X POST https://api.paystack.co/plan \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Annual",
    "amount": 5000000,
    "interval": "annually"
  }'
```

### Step 4: Update Environment Variables
Add plan codes to both frontend and backend `.env` files.

---

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create Cluster
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Log in
3. Create new cluster (Free M0 tier available)

### Step 2: Configure Access
1. **Database Access**: Create database user
2. **Network Access**: Add IP address (0.0.0.0/0 for development)

### Step 3: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with your database user password

### Step 4: Update Backend .env
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-therapist?retryWrites=true&w=majority
```

---

## 🚀 Deployment

### Backend Deployment (Render/Railway)

#### Render
1. Go to https://render.com/
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - **Build Command**: `cd Hope-backend && npm install && npm run build`
   - **Start Command**: `cd Hope-backend && npm start`
   - **Environment Variables**: Add all from `.env`

#### Railway
1. Go to https://railway.app/
2. New Project → Deploy from GitHub
3. Add environment variables
4. Deploy

### Frontend Deployment (Vercel)

1. Go to https://vercel.com/
2. Import Project from GitHub
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Environment Variables**: Add all from `.env.local`
4. Deploy

### Post-Deployment
1. Update `FRONTEND_URL` in backend `.env`
2. Update `NEXT_PUBLIC_BACKEND_API_URL` in frontend `.env`
3. Redeploy both services

---

## 🐛 Troubleshooting

### OTP Emails Not Sending
```
❌ EMAIL SERVICE NOT CONFIGURED
```
**Solution**: See `Hope-backend/EMAIL_SETUP_GUIDE.md` or `QUICK_FIX_EMAIL.md`

### Database Connection Failed
```
MongoServerError: bad auth
```
**Solution**: Check MONGODB_URI credentials, ensure IP is whitelisted

### CORS Errors
```
Access to fetch blocked by CORS policy
```
**Solution**: Ensure `CORS_ORIGIN` in backend matches frontend URL exactly

### Gemini API Errors
```
API key not valid
```
**Solution**: Get new API key from https://makersuite.google.com/app/apikey

### Payment Webhook Not Working
**Solution**: 
1. Update webhook URL in Paystack dashboard
2. Ensure backend is publicly accessible
3. Check webhook signature verification

---

## ✅ Verification Checklist

### Backend
- [ ] Email service initialized successfully
- [ ] MongoDB connected
- [ ] Gemini API working
- [ ] Health endpoint returns 200
- [ ] User registration sends OTP
- [ ] User can verify email and login

### Frontend
- [ ] Can access homepage
- [ ] Can sign up new user
- [ ] Can receive and enter OTP
- [ ] Can log in
- [ ] Can access dashboard
- [ ] Can start therapy session
- [ ] Payments work (if configured)

### Integration
- [ ] Frontend communicates with backend
- [ ] API routes work properly
- [ ] Authentication flow complete
- [ ] Session persistence works
- [ ] Error handling proper

---

## 📚 Additional Resources

- **Email Setup**: `Hope-backend/EMAIL_SETUP_GUIDE.md`
- **Quick Email Fix**: `Hope-backend/QUICK_FIX_EMAIL.md`
- **Environment Template**: `Hope-backend/env-email-template.txt`
- **API Documentation**: Check backend routes in `Hope-backend/src/routes/`

---

## 🆘 Getting Help

### Common Issues
1. Check server logs for detailed error messages
2. Verify all environment variables are set
3. Ensure all services (MongoDB, Email) are configured
4. Check network connectivity

### Support
- Review error logs in backend console
- Check browser console for frontend errors
- Verify API responses in Network tab
- Test with curl/Postman for API debugging

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** to Git
2. Use different credentials for dev/prod
3. Rotate secrets regularly
4. Enable 2FA on all service accounts
5. Use strong JWT secrets
6. Whitelist specific IPs when possible
7. Monitor API usage and costs
8. Keep dependencies updated

---

**Last Updated**: October 2025
**Version**: 1.0.0

