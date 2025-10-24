# ⚡ Deploy to Production NOW

## Quick Deployment Guide

### 1. Generate Production Secrets (2 minutes)

Run these commands in PowerShell:

```powershell
# Generate JWT Secret
Write-Host "JWT_SECRET=" -NoNewline; [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Generate NextAuth Secret  
Write-Host "NEXTAUTH_SECRET=" -NoNewline; [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Copy these values - you'll need them!

---

### 2. Deploy Backend to Render (5 minutes)

1. **Go to Render Dashboard:** https://dashboard.render.com

2. **Find your backend service** (hope-backend-2)

3. **Click "Environment" → Add these variables:**

```
PORT=8000
NODE_ENV=production
MONGODB_URI=mongodb+srv://knsalee:SyB11T1OcCTa0BGz@hope-ai.yzbppbz.mongodb.net/?retryWrites=true&w=majority&appName=HOPE-AI
JWT_SECRET=<paste-from-step-1>
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=gtgctqxedceacrsz
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
GEMINI_API_KEY=your-gemini-key-if-you-have-it
FRONTEND_URL=https://ai-therapist-agent-theta.vercel.app
BLOB_READ_WRITE_TOKEN=your-blob-token-if-you-have-it
```

4. **Click "Manual Deploy" → "Deploy latest commit"**

5. **Wait 2-3 minutes for deployment**

6. **Test:** Visit https://hope-backend-2.onrender.com/health
   - Should return: `{"status":"ok"}`

---

### 3. Deploy Frontend to Vercel (3 minutes)

1. **Go to Vercel Dashboard:** https://vercel.com/dashboard

2. **Find your project** (ai-therapist-agent)

3. **Click "Settings" → "Environment Variables"**

4. **Add these variables:**

```
NEXT_PUBLIC_BACKEND_API_URL=https://hope-backend-2.onrender.com
BACKEND_API_URL=https://hope-backend-2.onrender.com
NEXTAUTH_URL=https://ai-therapist-agent-theta.vercel.app
NEXTAUTH_SECRET=<paste-from-step-1>
NODE_ENV=production
```

If you have Vercel Blob token:
```
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

5. **Click "Deployments" → "..." → "Redeploy"**

6. **Wait 1-2 minutes**

7. **Test:** Visit https://ai-therapist-agent-theta.vercel.app

---

### 4. Verify Everything Works (2 minutes)

**Test 1: Registration**
1. Go to your app
2. Register new account
3. Check email for OTP
4. Verify account
5. ✅ Should receive welcome email

**Test 2: Large Upload (if admin)**
1. Login as admin
2. Upload 100MB meditation file
3. ✅ Should succeed

---

## 🎉 Done!

Your app is now in production with:
- ✅ 200MB meditation uploads
- ✅ Email OTP working
- ✅ All security configured
- ✅ Production secrets
- ✅ Optimized performance

---

## ⚠️ Important Notes

1. **Use different secrets** in production vs development
2. **Monitor Render logs** for any errors
3. **Check Vercel analytics** for performance
4. **Test thoroughly** after deployment

---

## 🐛 If Something Goes Wrong

**Backend not responding:**
- Check Render logs
- Verify environment variables
- Check MongoDB Atlas is accessible

**Frontend errors:**
- Check Vercel deployment logs
- Verify environment variables match
- Check browser console

**Emails not sending:**
- Verify EMAIL_USER and EMAIL_PASSWORD in Render
- Check backend logs for SMTP errors

---

## 📚 Full Documentation

See **PRODUCTION-READY.md** for complete details.

---

**Total Time:** ~10 minutes  
**Status after deployment:** Production Ready ✅

