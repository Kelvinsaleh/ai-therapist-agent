// Test to verify real AI is working
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testRealAI() {
  console.log('🧪 Testing Real AI Integration...');
  
  const apiKey = 'AIzaSyCCRSas8dVBP3ye4ZY5RBP sYqw7m_2jro8';
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: { 
        temperature: 0.9,
        maxOutputTokens: 1024
      } 
    });
    
    // Test with a simple message
    const result = await model.generateContent('Hello, respond as a friendly AI: "Hi there! How are you doing today?"');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Real AI Response:', text);
    console.log('🎉 SUCCESS: Real AI is working!');
    return true;
    
  } catch (error) {
    console.log('❌ Real AI Error:', error.message);
    console.log('Full error:', error);
    return false;
  }
}

testRealAI();