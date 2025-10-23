# 🚀 Start Development Servers

## ✅ What's Already Set Up

### Frontend Configuration
- ✅ `.env.local` created with all required variables
- ✅ GEMINI_API_KEY configured
- ✅ NEXTAUTH_SECRET generated
- ✅ Backend URL set to `http://localhost:3001`
- ✅ Payment keys configured
- ✅ All dependencies installed

### Backend Configuration  
- ✅ `.env` file configured
- ✅ MongoDB connection string set
- ✅ JWT_SECRET generated
- ✅ GEMINI_API_KEY configured
- ✅ Payment keys configured
- ✅ Backend compiled successfully

### ⚠️ Email Configuration Needed
The backend `.env` has email placeholders:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

**Options:**
1. **Use Development Mode** (Recommended for testing)
   - Leave as is
   - OTP will display on screen during signup
   - No actual email sent

2. **Configure Gmail** (For production)
   - Go to https://myaccount.google.com/apppasswords
   - Generate App Password
   - Update `Hope-backend/.env` with your credentials

---

## 🚀 How to Start

### Option 1: Manual Start (Recommended)

**Terminal 1 - Backend:**
```powershell
cd Hope-backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

### Option 2: PowerShell Script

**Start both servers:**
```powershell
# Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Hope-backend; npm run dev"

# Wait 5 seconds, then start frontend
Start-Sleep -Seconds 5
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
```

---

## ✅ Verification Steps

### 1. Check Backend is Running
Open browser to: http://localhost:3001/health

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "..."
}
```

### 2. Check Backend Logs
Look for these messages:
```
✅ Connected to MongoDB
✅ Email service initialized successfully
OR
❌ EMAIL SERVICE NOT CONFIGURED (This is OK for dev mode)
🚀 Server running on port 3001
```

### 3. Check Frontend is Running
Open browser to: http://localhost:3000

Should see the homepage.

### 4. Test the System

#### Quick Test Flow:
1. **Signup**
   - Go to http://localhost:3000/signup
   - Fill in the form
   - Submit

2. **Verify Email**
   - If email configured: Check inbox for OTP
   - If dev mode: OTP will display on verification screen
   - Enter the 6-digit code

3. **Login**
   - Use your credentials
   - Should redirect to dashboard

4. **Test Features**
   - Edit profile
   - Add goals
   - Start therapy session
   - Log mood

---

## 🐛 Troubleshooting

### Backend won't start
**Check:**
- MongoDB connection string is correct
- Port 3001 is not in use
- Node modules installed: `cd Hope-backend && npm install`

**Fix:**
```powershell
cd Hope-backend
npm install
npm run build
npm run dev
```

### Frontend won't start
**Check:**
- Port 3000 is not in use
- `.env.local` file exists
- Node modules installed: `npm install`

**Fix:**
```powershell
npm install
npm run dev
```

### Email not working
**This is expected in development!**

The system will display OTP on screen instead of sending email.

To fix:
- See `Hope-backend/QUICK_FIX_EMAIL.md`
- Update `EMAIL_USER` and `EMAIL_PASSWORD` in `Hope-backend/.env`

### Database connection error
**Check:**
- MongoDB URI in `Hope-backend/.env` is correct
- IP address is whitelisted in MongoDB Atlas
- Database user has correct permissions

### CORS errors
**Check:**
- Backend is running on port 3001
- Frontend `.env.local` has `NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001`

---

## 📊 Port Usage

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 3001 | http://localhost:3001 |
| Backend Health | 3001 | http://localhost:3001/health |

---

## 🎯 What to Do Next

### First Time Setup
1. Start both servers (see above)
2. Open http://localhost:3000
3. Click "Sign Up"
4. Create test account
5. Verify with OTP (displayed on screen in dev mode)
6. Explore the app!

### Development Workflow
1. Make code changes
2. Servers auto-reload (hot reload enabled)
3. Refresh browser to see changes
4. Check console for errors

### Testing
See `TESTING_GUIDE.md` for comprehensive testing procedures.

---

## 🔧 Useful Commands

### Backend
```powershell
cd Hope-backend

# Start dev server
npm run dev

# Build for production
npm run build

# Start production
npm start

# Check for errors
npm run lint
```

### Frontend
```powershell
# Start dev server
npm run dev

# Build for production  
npm run build

# Start production
npm start

# Check for errors
npm run lint
```

---

## 📝 Environment Files Summary

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001
GEMINI_API_KEY=AIzaSy...
NEXTAUTH_SECRET=K6c8+TQo...
NEXTAUTH_URL=http://localhost:3000
```

### Backend (`Hope-backend/.env`)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=SsaZ6qoy...
GEMINI_API_KEY=AIzaSy...
EMAIL_USER=your-email@gmail.com (⚠️ Update for production)
EMAIL_PASSWORD=your-app-password (⚠️ Update for production)
```

---

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Backend shows "Server running on port 3001"
- ✅ Frontend shows "Ready in X ms"
- ✅ http://localhost:3000 loads
- ✅ http://localhost:3001/health returns JSON
- ✅ Can sign up and verify email (OTP shows on screen)
- ✅ Can log in and access dashboard

---

## 📚 Additional Resources

- **Complete Setup**: `COMPLETE_SETUP_GUIDE.md`
- **Email Setup**: `Hope-backend/EMAIL_SETUP_GUIDE.md`
- **Quick Email Fix**: `Hope-backend/QUICK_FIX_EMAIL.md`
- **Testing Guide**: `TESTING_GUIDE.md`
- **System Status**: `SYSTEM_STATUS.md`

---

**Status**: ✅ Configuration Complete - Ready to Start!

