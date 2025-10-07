// Simple Gemini API test
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log('🧪 Testing Gemini API...');
  
  const apiKey = 'AIzaSyCCRSas8dVBP3ye4ZY5RBP sYqw7m_2jro8';
  console.log('API Key:', apiKey.substring(0, 10) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ GoogleGenerativeAI initialized');
    
    // Try gemini-1.5-pro
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: { 
        temperature: 0.9,
        maxOutputTokens: 1024
      } 
    });
    
    console.log('✅ Model initialized');
    
    const result = await model.generateContent('Hello, respond with: "Gemini AI is working correctly"');
    const response = await result.response;
    const text = response.text();
    
    console.log('🎉 SUCCESS! Gemini response:', text);
    return true;
    
  } catch (error) {
    console.log('❌ Gemini error:', error.message);
    console.log('Full error:', error);
    return false;
  }
}

testGemini().then(success => {
  if (success) {
    console.log('\n✅ Gemini API is working!');
  } else {
    console.log('\n❌ Gemini API is not working');
  }
});