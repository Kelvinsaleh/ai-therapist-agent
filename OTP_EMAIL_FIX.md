# OTP Email Fix - Complete Guide

## 🔴 Problem
**OTP verification codes are not being sent to user emails** because the email service is not configured in the backend.

## 🔍 Root Cause
The backend's email service requires these environment variables:
- `EMAIL_USER` - Email address to send from
- `EMAIL_PASSWORD` - Email account password/app password  
- `EMAIL_HOST` - SMTP server (default: smtp.gmail.com)
- `EMAIL_PORT` - SMTP port (default: 587)

These variables are **missing** from your `Hope-backend/.env` file.

---

## ✅ Quick Fix (5 Minutes)

### Option 1: Gmail (Easiest for Testing)

#### Step 1: Enable 2FA on Gmail
1. Visit: https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the prompts to enable it

#### Step 2: Generate App Password
1. Visit: https://myaccount.google.com/apppasswords
2. Select **App**: Mail
3. Select **Device**: Other (type "Hope Backend")
4. Click **Generate**
5. **Copy** the 16-character password (looks like: `xxxx xxxx xxxx xxxx`)

#### Step 3: Create `.env` File in Backend
```bash
cd Hope-backend
```

Create a file named `.env` with this content:
```env
# Server
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://knsalee:SyB11T1OcCTa0BGz@hope-ai.yzbppbz.mongodb.net/?retryWrites=true&w=majority&appName=HOPE-AI

# JWT
JWT_SECRET=your-secret-key-change-this-in-production

# AI
GEMINI_API_KEY=your-gemini-key-here

# CORS
FRONTEND_URL=http://localhost:3000

# ✅ EMAIL SERVICE (Add these!)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=xxxxxxxxxxxxxxxx
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Vercel Blob (if you have it)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

**Important:** Replace `your-gmail@gmail.com` and `xxxxxxxxxxxxxxxx` with your actual Gmail and the 16-char app password (**without spaces**).

#### Step 4: Restart Backend
```bash
# Stop the backend (Ctrl+C)
npm run dev
```

#### Step 5: Verify Email Service
Check the backend console logs. You should see:
```
✅ Email service initialized successfully
📧 Using: your-email@gmail.com via smtp.gmail.com:587
```

Instead of:
```
❌ EMAIL SERVICE NOT CONFIGURED - OTP EMAILS WILL NOT BE SENT!
```

---

## 🧪 Testing

### Test Registration Flow
1. Go to your frontend registration page
2. Enter a **real email address** you can access
3. Fill in name and password
4. Click "Register"
5. **Check your email** for the verification code
6. Enter the 6-digit code on the verification page

### Expected Behavior
- ✅ Email arrives within 1-2 minutes
- ✅ Backend logs show: `✅ Email sent successfully to user@example.com`
- ✅ Email subject: "Verify Your Hope Therapy Account"

### If Email Doesn't Arrive
1. **Check spam folder**
2. **Check backend logs** for errors
3. **Verify** EMAIL_USER and EMAIL_PASSWORD are correct
4. **Ensure** you used the App Password (not regular Gmail password)
5. **Restart** backend after changing .env

---

## 🚀 Production Setup

For production (Render, Railway, etc.), add these as **environment variables** in your deployment platform:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### Recommended Production Services
For better deliverability in production, consider:

1. **SendGrid** (Free tier: 100 emails/day)
   ```env
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your-sendgrid-api-key
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   ```
   - Sign up: https://signup.sendgrid.com
   - Get API key: https://app.sendgrid.com/settings/api_keys

2. **AWS SES** (Very cheap, highly reliable)
3. **Mailgun** (Good for transactional emails)
4. **Postmark** (Excellent deliverability)

---

## 📋 Checklist

- [ ] 2FA enabled on Gmail account
- [ ] App Password generated
- [ ] `.env` file created in `Hope-backend/`
- [ ] `EMAIL_USER` set to your Gmail address
- [ ] `EMAIL_PASSWORD` set to 16-char app password (no spaces)
- [ ] `EMAIL_HOST=smtp.gmail.com`
- [ ] `EMAIL_PORT=587`
- [ ] Backend restarted
- [ ] Backend logs show "Email service initialized successfully"
- [ ] Tested registration with real email address
- [ ] Received verification email
- [ ] Verified account successfully

---

## 🐛 Troubleshooting

### Error: "Invalid login"
- **Cause**: Wrong password or not using App Password
- **Fix**: Generate new App Password, ensure 2FA is enabled

### Error: "Connection timeout" 
- **Cause**: Port 587 blocked or wrong SMTP settings
- **Fix**: 
  - Try port 465 instead
  - Check firewall settings
  - Verify EMAIL_HOST is correct

### Emails go to spam
- **Fix**:
  - Ask users to check spam folder
  - Mark email as "Not Spam"
  - In production, use SendGrid/AWS SES for better deliverability

### Backend logs show "Email service not configured"
- **Cause**: .env file not loaded or variables missing
- **Fix**:
  - Ensure .env file is in `Hope-backend/` directory
  - Check variable names are exact (case-sensitive)
  - Restart backend completely

### Development Mode Workaround
If email setup is failing, the backend will show the OTP in:
- **Console logs**: Look for `[DEV MODE] OTP for user@example.com: 123456`
- **API response**: Check for `devOTP` field in registration response

---

## 📁 File Locations

```
Hope-backend/
  ├── .env  ← Create this file (NEVER commit to Git!)
  ├── .env.template  ← Template with all variables
  ├── EMAIL_SETUP_GUIDE.md  ← Detailed email setup guide
  └── src/
      └── services/
          └── email.service.ts  ← Email service code
```

---

## 🔒 Security Notes

1. **Never commit `.env` to Git**
   - Already in `.gitignore`
   - Contains sensitive credentials

2. **Use different credentials for dev/prod**
   - Don't use same email for testing and production

3. **Rotate App Passwords regularly**
   - Generate new password every few months
   - Revoke old passwords

4. **Monitor email logs**
   - Check for suspicious activity
   - Monitor sending limits

---

## 📞 Additional Help

- **Email Setup Guide**: `Hope-backend/EMAIL_SETUP_GUIDE.md`
- **Gmail App Passwords**: https://myaccount.google.com/apppasswords
- **SendGrid Docs**: https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api

---

**Last Updated:** October 24, 2025  
**Status:** ⚠️ Action Required - Email service must be configured

