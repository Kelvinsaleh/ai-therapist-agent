# Frontend Environment Variables Template

## 📋 Create `.env.local` File
Copy the content below into a new file called `.env.local` in the root directory of the project.

```env
# ========================================
# BACKEND API CONFIGURATION
# ========================================
# For development (local backend):
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001
BACKEND_API_URL=http://localhost:3001

# For production (deployed backend):
# NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-url.onrender.com
# BACKEND_API_URL=https://your-backend-url.onrender.com

# ========================================
# AI CONFIGURATION
# ========================================
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key-here

# ========================================
# PAYMENT CONFIGURATION (Optional)
# ========================================
# Get from: https://dashboard.paystack.com/#/settings/developers
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here

# ========================================
# FILE STORAGE (Vercel Blob - Optional)
# ========================================
# Get from: https://vercel.com/dashboard/stores
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here

# ========================================
# AUTHENTICATION
# ========================================
# For development:
NEXTAUTH_URL=http://localhost:3000
# For production:
# NEXTAUTH_URL=https://your-frontend-url.vercel.app

# Generate a secure secret: openssl rand -base64 32
NEXTAUTH_SECRET=your-nextauth-secret-here
```

## 🔑 How to Get Each Value

### GEMINI_API_KEY
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

### NEXTAUTH_SECRET
Generate a secure random string:
```bash
# On Linux/Mac:
openssl rand -base64 32

# Or use online generator:
# https://generate-secret.vercel.app/32
```

### NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
1. Go to https://paystack.com/
2. Sign up / Log in
3. Settings → API Keys & Webhooks
4. Copy Test Public Key (starts with `pk_test_`)

### BLOB_READ_WRITE_TOKEN
1. Go to https://vercel.com/dashboard/stores
2. Create new Blob store
3. Copy the read-write token

## ⚠️ Important Notes

1. **Never commit `.env.local`** to Git (it's already in `.gitignore`)
2. Use **different values** for development and production
3. For **production**, update URLs to your deployed backend
4. The `NEXT_PUBLIC_` prefix makes variables accessible in the browser
5. Variables without `NEXT_PUBLIC_` are only available server-side

## ✅ Verification

After creating `.env.local`:
1. Restart your development server: `npm run dev`
2. Check browser console for any "undefined" environment variable warnings
3. Test API connections to backend
4. Verify authentication flow works

## 🔗 See Also
- **Complete Setup Guide**: `COMPLETE_SETUP_GUIDE.md`
- **Backend ENV Template**: `Hope-backend/env-email-template.txt`

