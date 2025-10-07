require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest', 
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-pro',
    'gemini-pro-vision',
    'gemini-1.0-pro',
    'gemini-1.0-pro-latest'
  ];
  
  for (const modelName of models) {
    try {
      console.log(`\nTesting model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hello, respond with: AI working');
      const response = await result.response;
      const text = response.text();
      console.log(`✅ SUCCESS with ${modelName}:`, text);
      break; // Stop at first successful model
    } catch (error) {
      console.log(`❌ FAILED with ${modelName}:`, error.message);
    }
  }
}

testGeminiModels().catch(console.error);