export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    technique: string;
    goal: string;
    progress: any[];
    analysis?: {
      emotionalState: string;
      themes: string[];
      riskLevel: number;
      recommendedApproach: string;
      progressIndicators: string[];
    };
  };
}

export interface ChatSession {
  id?: string;
  sessionId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  messageCount?: number;
}

export interface ApiResponse {
  message: string;
  response?: string;
  analysis?: {
    emotionalState: string;
    themes: string[];
    riskLevel: number;
    recommendedApproach: string;
    progressIndicators: string[];
  };
  metadata?: {
    technique: string;
    goal: string;
    progress: any[];
  };
}

import { API_CONFIG, getAuthHeaders } from '../config/api';

const API_BASE = API_CONFIG.BASE_URL;

export const createChatSession = async (): Promise<string> => {
  try {
    console.log("Creating new chat session...");
    const response = await fetch(`${API_BASE}/chat/sessions`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to create chat session:", error);
      throw new Error(error.error || "Failed to create chat session");
    }

    const data = await response.json();
    console.log("Chat session created:", data);
    return data.sessionId;
  } catch (error) {
    console.error("Error creating chat session:", error);
    throw error;
  }
};

export const sendChatMessage = async (
  sessionId: string,
  message: string
): Promise<ChatMessage> => {
  try {
    console.log(`Sending message to session ${sessionId}:`, message);
    const response = await fetch(
      `${API_BASE}/chat/sessions/${sessionId}/messages`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          message,
          timestamp: new Date().toISOString()
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Failed to send message:", { status: response.status, error });
      throw new Error(error.error || `Failed to send message: ${response.status}`);
    }

    const data = await response.json();
    console.log("Message sent successfully:", data);

    // Handle different response formats
    const aiResponse = data.response || data.message || data.content || data.answer;
    
    if (!aiResponse) {
      console.error("No AI response found in data:", data);
      
      // Provide a fallback response if the AI doesn't respond
      const fallbackResponses = [
        "I'm here to listen and help. Could you tell me more about what's on your mind?",
        "I understand you're reaching out. What would you like to talk about today?",
        "I'm ready to support you. What's been going on lately?",
        "Thank you for sharing. How can I help you feel better today?",
        "I'm listening. What's been weighing on your mind?"
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      return {
        id: Date.now().toString(),
        role: "assistant",
        content: randomResponse,
        timestamp: new Date(),
        metadata: { 
          technique: "supportive_response",
          goal: "provide_comfort",
          progress: []
        },
      };
    }

    return {
      id: Date.now().toString(),
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
      metadata: data.metadata || data.analysis,
    };
  } catch (error) {
    console.error("Error sending chat message:", error);
    
    // Try Gemini as fallback
    try {
      console.log("Trying Gemini as fallback...");
      const geminiResponse = await fetch('/api/chat/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          mode: 'therapy',
          context: { sessionId }
        })
      });

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json();
        console.log("Gemini fallback successful:", geminiData);
        
        return {
          id: Date.now().toString(),
          role: "assistant",
          content: geminiData.response || geminiData.message || geminiData.content,
          timestamp: new Date(),
          metadata: {
            technique: "gemini_fallback",
            goal: "provide_support",
            progress: []
          },
        };
      }
    } catch (geminiError) {
      console.error("Gemini fallback also failed:", geminiError);
    }
    
    throw error;
  }
};

export const getChatHistory = async (
  sessionId: string
): Promise<ChatMessage[]> => {
  try {
    console.log(`Fetching chat history for session ${sessionId}`);
    const response = await fetch(
      `${API_BASE}/chat/sessions/${sessionId}/history`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to fetch chat history:", error);
      throw new Error(error.error || "Failed to fetch chat history");
    }

    const data = await response.json();
    console.log("Received chat history:", data);

    if (!Array.isArray(data)) {
      console.error("Invalid chat history format:", data);
      throw new Error("Invalid chat history format");
    }

    // Ensure each message has the correct format
    return data.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      metadata: msg.metadata,
    }));
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
};

export const getAllChatSessions = async (): Promise<ChatSession[]> => {
  try {
    console.log("Fetching all chat sessions...");
    const response = await fetch(`${API_BASE}/chat/sessions`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to fetch chat sessions:", error);
      throw new Error(error.error || "Failed to fetch chat sessions");
    }

    const data = await response.json();
    console.log("Received chat sessions:", data);

    return data.map((session: any) => {
      // Ensure dates are valid
      const createdAt = new Date(session.createdAt || Date.now());
      const updatedAt = new Date(session.updatedAt || Date.now());

      return {
        ...session,
        createdAt: isNaN(createdAt.getTime()) ? new Date() : createdAt,
        updatedAt: isNaN(updatedAt.getTime()) ? new Date() : updatedAt,
        messages: (session.messages || []).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp || Date.now()),
        })),
      };
    });
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    throw error;
  }
};
