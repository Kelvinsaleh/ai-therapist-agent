# 🚀 Vercel Gemini AI Setup Guide

## ❌ **Current Issue:**
Your Vercel deployment is failing because the `GOOGLE_GEMINI_API_KEY` environment variable is not configured.

## ✅ **Solution: Add Environment Variable in Vercel**

### **Step 1: Go to Vercel Dashboard**
1. Visit [vercel.com](https://vercel.com)
2. Sign in to your account
3. Find your project: `ai-therapist-agent`

### **Step 2: Add Environment Variable**
1. Click on your project
2. Go to **Settings** tab
3. Click **Environment Variables** in the left sidebar
4. Click **Add New** button

### **Step 3: Configure the Variable**
- **Name**: `GOOGLE_GEMINI_API_KEY`
- **Value**: `AIzaSyCCRSas8dVBP3ye4ZY5RBPsYqw7m_2jro8`
- **Environment**: Select all (Production, Preview, Development)

### **Step 4: Redeploy**
1. After adding the environment variable
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Or push a new commit to trigger automatic deployment

## 🔧 **Alternative: Use Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variable
vercel env add GOOGLE_GEMINI_API_KEY

# When prompted, enter: AIzaSyCCRSas8dVBP3ye4ZY5RBPsYqw7m_2jro8
# Select all environments (Production, Preview, Development)

# Redeploy
vercel --prod
```

## 🧪 **Test After Setup**

1. **Visit your deployed app**
2. **Go to `/test-gemini` page**
3. **Click "Test Connection"**
4. **Should show "Gemini API connection successful!"**

## 📊 **Expected Result**

After adding the environment variable and redeploying:
- ✅ Build will succeed
- ✅ Gemini AI will be available
- ✅ AI chat will work with Gemini fallback
- ✅ Test page will show successful connection

## 🚨 **Important Notes**

- **Environment variables are case-sensitive**
- **Make sure to select all environments** (Production, Preview, Development)
- **Redeploy is required** after adding environment variables
- **The API key is already configured** in your local `.env.local` file

## 🎯 **What This Fixes**

- ✅ Vercel build errors
- ✅ Gemini AI integration
- ✅ AI chat functionality
- ✅ Fallback system for when backend is unavailable

**Once you add the environment variable and redeploy, your AI chat will work perfectly with Gemini AI!** 🚀