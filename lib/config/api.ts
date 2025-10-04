// API Configuration
// Update this file when you change your backend API URL

export const API_CONFIG = {
  // Primary backend URL - update this with your new API URL
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 
           process.env.NEXT_PUBLIC_BACKEND_API_URL || 
           process.env.BACKEND_API_URL || 
           "https://hope-backend-2.onrender.com",
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      ME: "/auth/me",
      SESSION: "/auth/session"
    },
    CHAT: {
      SESSIONS: "/chat/sessions",
      MEMORY_ENHANCED: "/memory-enhanced-chat",
      MESSAGES: (sessionId: string) => `/chat/sessions/${sessionId}/messages`,
      HISTORY: (sessionId: string) => `/chat/sessions/${sessionId}/history`
    },
    PAYMENTS: {
      INITIALIZE: "/payments/initialize",
      VERIFY: "/payments/verify"
    },
    HEALTH: "/health"
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  let token: string | null = null;
  try {
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token') || localStorage.getItem('authToken');
    }
  } catch (error) {
    console.warn('Failed to get auth token:', error);
  }

  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};