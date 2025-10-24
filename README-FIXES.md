# 🔧 Quick Fix Guide - AI Therapist Agent

## Issues Fixed

### ✅ Issue #1: Meditation Upload File Size (FIXED)
**Status:** Complete - No action required

Meditation files up to **200MB** can now be uploaded.

**What was changed:**
- Backend Multer limit: 50MB → 200MB
- Backend Express body parser: 10MB → 200MB
- Frontend upload route: Default 4MB → 200MB
- Next.js global config: Added 200MB limit

---

### ⚠️ Issue #2: OTP Emails Not Sending (REQUIRES SETUP)
**Status:** Requires user action

Users not receiving email verification codes because email service is not configured.

---

## 🚀 Quick Start (2 Minutes)

### Option 1: Automated Setup (Recommended)
```powershell
.\FIX-ALL-ISSUES.ps1
```

This script will:
- ✅ Verify all code fixes are applied
- ⚠️ Guide you through email setup
- ✅ Create `.env` file with your credentials
- ✅ Verify installation

### Option 2: Manual Setup

1. **Verify code fixes:**
   ```powershell
   .\VERIFY-FIXES.ps1
   ```

2. **Set up email:**
   ```powershell
   .\setup-email.ps1
   ```

3. **Restart servers:**
   ```bash
   # Terminal 1 - Backend
   cd Hope-backend
   npm run dev

   # Terminal 2 - Frontend  
   npm run dev
   ```

---

## 📧 Email Setup (Required for OTP)

### Quick Steps:

1. **Enable 2FA on Gmail:**
   https://myaccount.google.com/security

2. **Generate App Password:**
   https://myaccount.google.com/apppasswords
   - Select: Mail → Other (name it "Hope Backend")
   - Copy the 16-character password

3. **Run setup script:**
   ```powershell
   .\setup-email.ps1
   ```
   
   Or manually create `Hope-backend/.env`:
   ```env
   PORT=8000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://knsalee:SyB11T1OcCTa0BGz@hope-ai.yzbppbz.mongodb.net/?retryWrites=true&w=majority&appName=HOPE-AI
   JWT_SECRET=your-secret-key-here
   GEMINI_API_KEY=your-gemini-key-here
   FRONTEND_URL=http://localhost:3000
   
   # EMAIL SERVICE (Required!)
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password-without-spaces
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   ```

4. **Restart backend server**

---

## 🧪 Testing

### Test Meditation Uploads
1. Login as admin (knsalee@gmail.com)
2. Go to `/admin/meditations`
3. Upload a file between 50-200MB
4. Should succeed (previously failed at 50MB)

### Test OTP Emails
1. Register a new account with real email
2. Check email for 6-digit verification code
3. Should arrive within 1-2 minutes
4. Enter code to verify account

---

## 📁 Available Scripts

| Script | Purpose |
|--------|---------|
| `FIX-ALL-ISSUES.ps1` | Complete automated setup |
| `VERIFY-FIXES.ps1` | Verify all fixes are applied |
| `setup-email.ps1` | Email service setup only |

---

## 📚 Detailed Documentation

For more information, see:

- **`SESSION_FIXES_SUMMARY.md`** - Complete overview of all fixes
- **`MEDITATION_UPLOAD_FIX_SUMMARY.md`** - Meditation upload details
- **`OTP_EMAIL_FIX.md`** - Comprehensive email setup guide
- **`UPLOAD_TEST_CHECKLIST.md`** - Testing procedures
- **`Hope-backend/EMAIL_SETUP_GUIDE.md`** - Detailed email config guide

---

## ⚡ TL;DR - Just Fix It!

```powershell
# Run this one command:
.\FIX-ALL-ISSUES.ps1

# Then follow the prompts for email setup
# Restart servers
# Done!
```

---

## 🐛 Troubleshooting

### Meditation uploads still fail
- Restart backend server
- Restart frontend server
- Run `.\VERIFY-FIXES.ps1` to check configuration

### OTP emails not sending
- Run `.\VERIFY-FIXES.ps1` to check email config
- Ensure using Gmail App Password (not regular password)
- Check backend logs for errors
- Check spam folder

### "Email service not configured" in logs
- Email credentials missing or incorrect
- Run `.\setup-email.ps1` to reconfigure
- Ensure `.env` file exists in `Hope-backend/`

---

## 📞 Need Help?

1. Run verification: `.\VERIFY-FIXES.ps1`
2. Check detailed guides in documentation files
3. Review backend console logs for specific errors

---

**Last Updated:** October 24, 2025  
**Status:** All code fixes applied ✅ | Email setup required ⚠️

