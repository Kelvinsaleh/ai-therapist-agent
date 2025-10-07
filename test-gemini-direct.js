const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiDirect() {
  console.log('🧪 Testing Gemini API directly...');
  
  // Test with the API key
  const apiKey = 'AIzaSyCCRSas8dVBP3ye4ZY5RBP sYqw7m_2jro8';
  console.log('API Key:', apiKey.substring(0, 10) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ GoogleGenerativeAI initialized');
    
    // Try different model names
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];
    
    for (const modelName of models) {
      try {
        console.log(`\n🔍 Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { 
            temperature: 0.9,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1024
          } 
        });
        
        const result = await model.generateContent('Hello, please respond with: "Gemini AI is working correctly"');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ SUCCESS with ${modelName}:`, text);
        console.log(`🎉 WORKING MODEL FOUND: ${modelName}`);
        return modelName;
        
      } catch (error) {
        console.log(`❌ FAILED with ${modelName}:`, error.message);
      }
    }
    
    console.log('\n❌ No working model found');
    return null;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

testGeminiDirect().then(workingModel => {
  if (workingModel) {
    console.log(`\n🎯 RESULT: Use model "${workingModel}" in the backend`);
  } else {
    console.log('\n💥 RESULT: Gemini API not working - check API key');
  }
});