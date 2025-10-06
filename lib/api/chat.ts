export interface ChatMessage {
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
  sessionId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
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

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://hope-backend-2.onrender.com";

// Helper function to get auth headers
const getAuthHeaders = () => {
  let token: string | null = null;
  try {
    token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");
  } catch {}
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

import { logger } from "@/lib/utils/logger";

export const createChatSession = async (): Promise<string> => {
  try {
    logger.debug("Creating new chat session...");
    const response = await fetch(`${API_BASE}/chat/sessions`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error("Failed to create chat session", error);
      throw new Error(error.error || "Failed to create chat session");
    }

    const data = await response.json();
    logger.debug("Chat session created", data);
    return data.sessionId;
  } catch (error) {
    logger.error("Error creating chat session", error);
    throw error;
  }
};

export const sendChatMessage = async (
  sessionId: string,
  message: string
): Promise<ApiResponse> => {
  try {
    logger.debug(`Sending message to session ${sessionId}`);
    const response = await fetch(
      `${API_BASE}/chat/sessions/${sessionId}/messages`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ message }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      logger.error("Failed to send message", error);
      throw new Error(error.error || "Failed to send message");
    }

    const data = await response.json();
    logger.debug("Message sent successfully", data);
    return data;
  } catch (error) {
    logger.error("Error sending chat message", error);
    throw error;
  }
};

export const getChatHistory = async (
  sessionId: string
): Promise<ChatMessage[]> => {
  try {
    logger.debug(`Fetching chat history for session ${sessionId}`);
    const response = await fetch(
      `${API_BASE}/chat/sessions/${sessionId}/history`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      logger.error("Failed to fetch chat history", error);
      throw new Error(error.error || "Failed to fetch chat history");
    }

    const data = await response.json();
    logger.debug("Received chat history", data);

    if (!Array.isArray(data)) {
      logger.error("Invalid chat history format", undefined, data);
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
    logger.error("Error fetching chat history", error);
    throw error;
  }
};

export const getAllChatSessions = async (): Promise<ChatSession[]> => {
  try {
    logger.debug("Fetching all chat sessions...");
    const response = await fetch(`${API_BASE}/chat/sessions`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error("Failed to fetch chat sessions", error);
      throw new Error(error.error || "Failed to fetch chat sessions");
    }

    const data = await response.json();
    logger.debug("Received chat sessions", data);

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
    logger.error("Error fetching chat sessions", error);
    throw error;
  }
};
