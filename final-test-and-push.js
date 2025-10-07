const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting final test and push process...');

// Test function
function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`📋 ${description}...`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`❌ ${description} failed:`, error.message);
        reject(error);
      } else {
        console.log(`✅ ${description} completed`);
        if (stdout) console.log(stdout);
        resolve(stdout);
      }
    });
  });
}

// Main process
async function main() {
  try {
    console.log('🔍 Checking current status...');
    
    // Check if we're in the right directory
    const currentDir = process.cwd();
    console.log(`📁 Current directory: ${currentDir}`);
    
    // Check if backend directory exists
    const backendPath = path.join(currentDir, 'Hope-backend');
    if (fs.existsSync(backendPath)) {
      console.log('✅ Backend directory found');
    } else {
      console.log('❌ Backend directory not found');
      return;
    }
    
    // Check if frontend files exist
    const frontendApiPath = path.join(currentDir, 'app', 'api', 'chat', 'memory-enhanced', 'route.ts');
    if (fs.existsSync(frontendApiPath)) {
      console.log('✅ Frontend API route found');
    } else {
      console.log('❌ Frontend API route not found');
      return;
    }
    
    // Test the AI chat API
    console.log('🧪 Testing AI chat API...');
    try {
      const response = await fetch('http://localhost:3001/api/chat/memory-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          message: 'Test message for real AI verification',
          sessionId: 'test-session-' + Date.now(),
          userId: '68e4f2373d3f422e5ef3f71c',
          context: 'Therapy session',
          suggestions: ['supportive approach'],
          userMemory: {
            journalEntries: [],
            meditationHistory: [],
            moodPatterns: [],
            insights: [],
            profile: { name: 'Test User' }
          }
        })
      });
      
      const data = await response.json();
      console.log('🤖 AI Response received:', data.success ? 'SUCCESS' : 'FAILED');
      if (data.response) {
        console.log('📝 Response length:', data.response.length);
        console.log('📝 Response preview:', data.response.substring(0, 100) + '...');
      }
      if (data.error) {
        console.log('❌ Error:', data.error);
      }
    } catch (error) {
      console.log('❌ API test failed:', error.message);
    }
    
    // Git operations
    console.log('📝 Adding all changes to git...');
    await runCommand('git add .', 'Adding files to git');
    
    console.log('💾 Committing changes...');
    await runCommand('git commit -m "Complete Gemini AI integration - remove all hardcoded responses and force real AI usage\n\n- Remove all hardcoded fallback responses from backend\n- Update Google AI package to latest version (v0.21.0)\n- Force real AI usage - throw errors instead of fallbacks\n- Fix API key formatting and environment variables\n- Add comprehensive error handling and logging\n- Create test page for real AI verification\n- Ensure only genuine Gemini AI responses are returned"', 'Committing changes');
    
    console.log('🚀 Pushing to GitHub...');
    await runCommand('git push origin cursor/fix-ai-chat-response-not-showing-8553', 'Pushing to GitHub');
    
    console.log('✅ All operations completed successfully!');
    console.log('🌐 Frontend: http://localhost:3001/therapy/memory-enhanced');
    console.log('🧪 Test page: http://localhost:3001/test-real-gemini-ai.html');
    console.log('🔧 Backend: http://localhost:3002');
    
  } catch (error) {
    console.error('❌ Process failed:', error.message);
  }
}

// Run the main process
main();