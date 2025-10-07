// Test Gemini API with proper error handling
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  console.log('🔍 Testing Gemini API...');
  
  // Test with the API key from the backend
  const apiKey = 'AIzaSyCCRSas8dVBP3ye4ZY5RBP sYqw7m_2jro8';
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ GoogleGenerativeAI initialized');
    
    // Try the model that should work
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { temperature: 0.7 }
    });
    console.log('✅ Model initialized');
    
    // Test with a simple prompt
    const result = await model.generateContent('Hello, please respond with exactly: "Gemini AI is working correctly"');
    const response = await result.response;
    const text = response.text();
    
    console.log('🎉 SUCCESS! Gemini API Response:', text);
    console.log('✅ Gemini AI is working correctly!');
    return true;
    
  } catch (error) {
    console.log('❌ Gemini API Error:', error.message);
    console.log('Full error:', JSON.stringify(error, null, 2));
    return false;
  }
}

// Run the test
testGeminiAPI().then(success => {
  if (success) {
    console.log('\n🎯 RESULT: Gemini API is working - backend can use real AI');
  } else {
    console.log('\n💥 RESULT: Gemini API is not working - need to fix API key or model name');
  }
});