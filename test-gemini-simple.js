const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    // Use the API key from the .env file
    const apiKey = 'AIzaSyCCRSas8dVBP3ye4ZY5RBP sYqw7m_2jro8';
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('Testing Gemini API with different model names...');
    
    // Try different model names
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    
    for (const modelName of models) {
      try {
        console.log(`\nTrying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello, respond with: AI is working');
        const response = await result.response;
        const text = response.text();
        console.log(`✅ SUCCESS with ${modelName}:`, text);
        return modelName; // Return the working model name
      } catch (error) {
        console.log(`❌ FAILED with ${modelName}:`, error.message);
      }
    }
    
    console.log('\n❌ No working model found');
    return null;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

testGemini().then(workingModel => {
  if (workingModel) {
    console.log(`\n🎉 Working model found: ${workingModel}`);
  } else {
    console.log('\n💥 No working model found');
  }
});