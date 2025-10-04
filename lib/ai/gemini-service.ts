// Google Gemini AI Service for HOPE
// Provides AI chat functionality using Google's Gemini API

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface GeminiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('GOOGLE_GEMINI_API_KEY is not configured - Gemini AI will not be available');
      // Don't throw error during build, just log warning
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      });
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
    }
  }

  // Generate AI response for therapy/mental health chat
  async generateTherapyResponse(userMessage: string, context?: any): Promise<GeminiResponse> {
    if (!this.model) {
      return {
        success: false,
        error: 'Gemini AI is not configured. Please set GOOGLE_GEMINI_API_KEY environment variable.'
      };
    }

    try {
      console.log('Generating Gemini therapy response for:', userMessage.substring(0, 50) + '...');

      const systemPrompt = `You are Hope, a compassionate AI mental health companion. Your role is to provide supportive, empathetic, and helpful responses to users seeking mental health support.

Guidelines:
- Be warm, understanding, and non-judgmental
- Provide practical coping strategies when appropriate
- Encourage professional help for serious mental health concerns
- Use active listening techniques
- Avoid giving medical diagnoses
- Keep responses conversational and supportive
- If someone mentions self-harm or suicide, encourage them to contact crisis hotlines immediately

Context: ${context ? JSON.stringify(context) : 'No additional context'}

User message: ${userMessage}`;

      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();

      console.log('Gemini response generated successfully');
      
      return {
        success: true,
        message: text
      };

    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Provide fallback response
      const fallbackResponses = [
        "I'm here to listen and support you. Could you tell me more about what's on your mind?",
        "I understand you're reaching out. What would you like to talk about today?",
        "I'm ready to help you. What's been going on lately?",
        "Thank you for sharing. How can I support you today?",
        "I'm listening. What's been weighing on your mind?"
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      return {
        success: true,
        message: randomResponse
      };
    }
  }

  // Generate AI response for general chat
  async generateChatResponse(userMessage: string, context?: any): Promise<GeminiResponse> {
    if (!this.model) {
      return {
        success: false,
        error: 'Gemini AI is not configured. Please set GOOGLE_GEMINI_API_KEY environment variable.'
      };
    }

    try {
      console.log('Generating Gemini chat response for:', userMessage.substring(0, 50) + '...');

      const systemPrompt = `You are Hope, a helpful and friendly AI assistant. Provide helpful, accurate, and engaging responses to user questions and conversations.

Guidelines:
- Be helpful and informative
- Provide accurate information
- Be conversational and engaging
- Ask clarifying questions when needed
- Be respectful and appropriate

Context: ${context ? JSON.stringify(context) : 'No additional context'}

User message: ${userMessage}`;

      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();

      console.log('Gemini chat response generated successfully');
      
      return {
        success: true,
        message: text
      };

    } catch (error) {
      console.error('Gemini API error:', error);
      
      return {
        success: false,
        error: 'Failed to generate response. Please try again.'
      };
    }
  }

  // Test the Gemini API connection
  async testConnection(): Promise<boolean> {
    if (!this.model) {
      console.warn('Gemini AI is not configured - cannot test connection');
      return false;
    }

    try {
      const result = await this.model.generateContent("Hello, this is a test message.");
      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini API connection test successful:', text.substring(0, 50) + '...');
      return true;
    } catch (error) {
      console.error('Gemini API connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService();