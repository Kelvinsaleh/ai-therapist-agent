#!/bin/bash

echo "🚀 Starting complete Gemini AI setup and testing..."

# Navigate to workspace
cd /workspace

echo "📁 Current directory: $(pwd)"

# Check if backend directory exists
if [ -d "Hope-backend" ]; then
    echo "✅ Backend directory found"
    cd Hope-backend
    
    echo "📦 Installing backend dependencies..."
    npm install
    
    echo "🔨 Building backend..."
    npm run build
    
    echo "🚀 Starting backend in background..."
    PORT=3002 npm start &
    BACKEND_PID=$!
    
    echo "⏳ Waiting for backend to start..."
    sleep 5
    
    echo "🧪 Testing backend health..."
    curl -s http://localhost:3002/health || echo "❌ Backend health check failed"
    
    cd /workspace
else
    echo "❌ Backend directory not found"
    exit 1
fi

# Check if frontend is running
echo "🧪 Testing frontend..."
curl -s http://localhost:3001 | head -5 || echo "❌ Frontend not running"

# Test the AI chat API
echo "🤖 Testing AI chat API..."
curl -X POST http://localhost:3001/api/chat/memory-enhanced \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"message":"Test message for real AI","sessionId":"test-session","userId":"68e4f2373d3f422e5ef3f71c","context":"Therapy session","suggestions":["supportive approach"],"userMemory":{"journalEntries":[],"meditationHistory":[],"moodPatterns":[],"insights":[],"profile":{"name":"Test User"}}}' \
  || echo "❌ AI chat API test failed"

echo "📝 Committing changes to git..."
git add .
git commit -m "Complete Gemini AI integration - remove all hardcoded responses and force real AI usage

- Remove all hardcoded fallback responses from backend
- Update Google AI package to latest version (v0.21.0)
- Force real AI usage - throw errors instead of fallbacks
- Fix API key formatting and environment variables
- Add comprehensive error handling and logging
- Create test page for real AI verification
- Ensure only genuine Gemini AI responses are returned"

echo "🚀 Pushing to GitHub..."
git push origin cursor/fix-ai-chat-response-not-showing-8553

echo "✅ Setup complete! Backend PID: $BACKEND_PID"
echo "🌐 Frontend: http://localhost:3001/therapy/memory-enhanced"
echo "🧪 Test page: http://localhost:3001/test-real-gemini-ai.html"
echo "🔧 Backend: http://localhost:3002"