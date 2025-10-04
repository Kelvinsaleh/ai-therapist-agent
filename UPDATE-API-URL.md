# 🔧 How to Update Your API URL

## 🎯 Quick Fix for AI Chat Not Working

Your AI chat is not working because it's still using the old backend URL. Here's how to fix it:

### 📝 Step 1: Update Environment Variables

Edit your `.env.local` file and replace the backend URL with your new API URL:

```bash
# Replace this line in .env.local:
NEXT_PUBLIC_BACKEND_URL=https://your-new-api-url.com
NEXT_PUBLIC_BACKEND_API_URL=https://your-new-api-url.com
BACKEND_API_URL=https://your-new-api-url.com
```

### 📝 Step 2: Update API Configuration (Optional)

If you want to update the default URL in the code, edit `lib/config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 
           process.env.NEXT_PUBLIC_BACKEND_API_URL || 
           process.env.BACKEND_API_URL || 
           "https://your-new-api-url.com", // Update this line
  // ... rest of config
};
```

### 🧪 Step 3: Test the AI Chat

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Go to the AI chat page** (`/therapy`)

3. **Send a test message** and check the browser console for any errors

4. **Check the network tab** to see if requests are going to your new API URL

### 🔍 Debugging Steps

If AI chat still doesn't work:

1. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for error messages when sending a message

2. **Check Network Tab**:
   - Go to Network tab in Developer Tools
   - Send a message in AI chat
   - Look for failed requests (red status codes)

3. **Common Issues**:
   - **CORS Error**: Your new API needs to allow requests from your frontend domain
   - **Authentication Error**: Make sure you're logged in
   - **API Endpoint Missing**: Verify your new API has the required endpoints

### 📋 Required API Endpoints

Your new API should have these endpoints:

```
POST /auth/login
POST /auth/register
GET  /auth/me
POST /chat/sessions
POST /chat/sessions/{sessionId}/messages
GET  /chat/sessions/{sessionId}/history
POST /memory-enhanced-chat
```

### 🚀 Quick Test

To quickly test if your new API is working:

1. **Open browser console** on `/therapy` page
2. **Send a message** in AI chat
3. **Look for these logs**:
   ```
   Creating new chat session...
   Sending message to session...
   Message sent successfully:
   ```

If you see errors, check what the error message says and let me know!

### 💡 Need Help?

If you're still having issues, please share:
1. Your new API URL
2. Any error messages from browser console
3. What happens when you try to send a message

I can help you debug the specific issue!