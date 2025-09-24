// Backend Service Layer for Hope Backend Integration
// This service handles all communication with your backend API

const BACKEND_BASE_URL = "https://hope-backend-2.onrender.com";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  _id?: string; // Add MongoDB _id field
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  token?: string;
  matchingPreferences?: {
    challenges: string[];
    goals: string[];
    experienceLevel: "beginner" | "intermediate" | "experienced";
    ageRange: [number, number];
    timezone: string;
    communicationStyle: "gentle" | "direct" | "supportive";
    preferredCheckInFrequency: "daily" | "weekly" | "as-needed";
    allowVideoCalls: boolean;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  title?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: any;
}

export interface MemoryEnhancedRequest {
  message: string;
  sessionId: string;
  userId: string;
  context: string;
  suggestions: string[];
  userMemory: {
    journalEntries: any[];
    meditationHistory: any[];
    moodPatterns: any[];
    insights: any[];
    profile: any;
  };
}

export interface MemoryEnhancedResponse {
  response: string;
  insights: string[];
  techniques: string[];
  breakthroughs: string[];
  moodAnalysis?: {
    current: number;
    trend: string;
    triggers: string[];
  };
  personalizedSuggestions: string[];
  isFailover?: boolean;
}

class BackendService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = BACKEND_BASE_URL;
    this.loadAuthToken();
  }

  private loadAuthToken(): void {
    if (typeof window !== 'undefined') {
      const persistedToken =
        localStorage.getItem('token') ||
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('authToken') ||
        null;
      this.authToken = persistedToken;
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Always try to read the freshest token from storage in the browser
    let token = this.authToken;
    if (typeof window !== 'undefined') {
      token =
        token ||
        localStorage.getItem('token') ||
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('authToken') ||
        null;
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log(`Making request to: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        let errorText = `HTTP ${response.status}`;
        try {
          const data = await response.json();
          errorText = typeof (data?.error) === 'string'
            ? data.error
            : (typeof (data?.message) === 'string' ? data.message : errorText);
        } catch (e) {
          // If response is not JSON, use status text
          errorText = response.statusText || errorText;
        }
        
        return {
          success: false,
          error: errorText,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      // Provide more specific error messages
      let errorMessage = 'Network error';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout - server is not responding';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Cannot connect to server - check your internet connection';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.makeRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.token) {
      this.authToken = response.data.token;
      if (typeof window !== 'undefined') {
        // Standardize: store under both keys for compatibility
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('authToken', response.data.token);
      }
    }

    return response;
  }

  async register(userData: { name: string; email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.makeRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.token) {
      this.authToken = response.data.token;
      if (typeof window !== 'undefined') {
        // Standardize: store under both keys for compatibility
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('authToken', response.data.token);
      }
    }

    return response;
  }

  async logout(): Promise<void> {
    this.authToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    }
  }

  // Chat session methods
  async createChatSession(): Promise<ApiResponse<ChatSession>> {
    return this.makeRequest<ChatSession>('/chat/sessions', {
      method: 'POST',
    });
  }

  async getChatSessions(): Promise<ApiResponse<ChatSession[]>> {
    return this.makeRequest<ChatSession[]>('/chat/sessions');
  }

  async getChatSession(sessionId: string): Promise<ApiResponse<ChatSession>> {
    return this.makeRequest<ChatSession>(`/chat/sessions/${sessionId}`);
  }

  async getChatHistory(sessionId: string): Promise<ApiResponse<ChatMessage[]>> {
    return this.makeRequest<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`);
  }

  async sendChatMessage(
    sessionId: string,
    message: string
  ): Promise<ApiResponse<ChatMessage>> {
    return this.makeRequest<ChatMessage>(`/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Memory-enhanced chat
  async sendMemoryEnhancedMessage(
    request: MemoryEnhancedRequest
  ): Promise<ApiResponse<MemoryEnhancedResponse>> {
    return this.makeRequest<MemoryEnhancedResponse>('/chat/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // User profile methods
  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/rescue-pairs/profile', {
      method: 'GET',
    });
  }

  async updateUserProfile(profileData: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/rescue-pairs/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Journal methods
  async getJournalEntries(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/journal/entries');
  }

  async createJournalEntry(entry: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/journal/entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async updateJournalEntry(entryId: string, entry: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/journal/entries/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    });
  }

  async deleteJournalEntry(entryId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/journal/entries/${entryId}`, {
      method: 'DELETE',
    });
  }

  // Meditation methods
  async getMeditationSessions(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/meditation/sessions');
  }

  async createMeditationSession(session: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/meditation/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  }

  async updateMeditationSession(sessionId: string, session: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/meditation/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(session),
    });
  }

  // Rescue pairs methods
  async getRescuePairs(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/rescue-pairs');
  }

  async createRescuePair(pairData: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/rescue-pairs', {
      method: 'POST',
      body: JSON.stringify(pairData),
    });
  }

  async updateRescuePair(pairId: string, pairData: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/rescue-pairs/${pairId}`, {
      method: 'PUT',
      body: JSON.stringify(pairData),
    });
  }

  async deleteRescuePair(pairId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/rescue-pairs/${pairId}`, {
      method: 'DELETE',
    });
  }

  // Payment verification
  async verifyPayment(reference: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    });
  }

  // User matching methods
  async updateMatchingPreferences(preferences: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/matching/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async findMatches(preferences: any): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/rescue-pairs/matches', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

  async acceptMatch(matchId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/rescue-pairs/accept/${matchId}`, {
      method: 'POST',
    });
  }

  async rejectMatch(matchId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/rescue-pairs/reject/${matchId}`, {
      method: 'POST',
    });
  }

  async getActiveMatches(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/matching/active');
  }

  async getMatchHistory(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/matching/history');
  }

  // Matched chat methods
  async getMatchedChatHistory(matchId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/matching/${matchId}/messages`);
  }

  async sendMatchedChatMessage(matchId: string, message: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/matching/${matchId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Subscription status
  async getSubscriptionStatus(userId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/subscription/status/${userId}`);
  }

  // Mood methods
  async getMoodEntries(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/mood/entries');
  }

  async createMoodEntry(moodData: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/mood/entries', {
      method: 'POST',
      body: JSON.stringify(moodData),
    });
  }

  // Activity methods
  async getActivities(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/activity/entries');
  }

  async createActivity(activityData: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/activity/entries', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  async updateActivity(activityId: string, activityData: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/activity/entries/${activityId}`, {
      method: 'PUT',
      body: JSON.stringify(activityData),
    });
  }

  async deleteActivity(activityId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/activity/entries/${activityId}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.makeRequest<{ status: string; timestamp: string }>('/health');
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.healthCheck();
      return response.success;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const backendService = new BackendService();

// Export individual methods for convenience
export const {
  login,
  register,
  logout,
  createChatSession,
  getChatSessions,
  getChatSession,
  getChatHistory,
  sendChatMessage,
  sendMemoryEnhancedMessage,
  getUserProfile,
  updateUserProfile,
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getMeditationSessions,
  createMeditationSession,
  updateMeditationSession,
  getRescuePairs,
  createRescuePair,
  updateRescuePair,
  deleteRescuePair,
  verifyPayment,
  updateMatchingPreferences,
  findMatches,
  acceptMatch,
  rejectMatch,
  getActiveMatches,
  getMatchHistory,
  getMatchedChatHistory,
  sendMatchedChatMessage,
  getSubscriptionStatus,
  getMoodEntries,
  createMoodEntry,
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  healthCheck,
  testConnection,
} = backendService;