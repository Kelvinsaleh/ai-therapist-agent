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
  _id?: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  token?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
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
        signal: AbortSignal.timeout(10000),
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
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('authToken', response.data.token);
        this.authToken = response.data.token;
      }
    }

    return response;
  }

  async register(userData: { name: string; email: string; password: string }): Promise<ApiResponse<RegisterResponse>> {
    const response = await this.makeRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('authToken', response.data.token);
        this.authToken = response.data.token;
      }
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.makeRequest('/auth/logout', {
      method: 'POST',
    });

    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      this.authToken = null;
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/auth/me');
  }

  // Journal methods (needed for memory-enhanced chat integration)
  async createJournalEntry(entryData: any): Promise<ApiResponse> {
    return this.makeRequest('/journal', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  }

  async getJournalEntries(): Promise<ApiResponse> {
    return this.makeRequest('/journal');
  }

  async updateJournalEntry(entryId: string, entryData: any): Promise<ApiResponse> {
    return this.makeRequest(`/journal/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    });
  }

  async deleteJournalEntry(entryId: string): Promise<ApiResponse> {
    return this.makeRequest(`/journal/${entryId}`, {
      method: 'DELETE',
    });
  }

  // Memory-enhanced chat method
  async sendMemoryEnhancedMessage(messageData: any): Promise<ApiResponse> {
    return this.makeRequest('/memory-enhanced-chat', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // User Profile methods (needed for rescue pair matching)
  async createUserProfile(profileData: any): Promise<ApiResponse> {
    return this.makeRequest('/user/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async getUserProfile(): Promise<ApiResponse> {
    return this.makeRequest('/user/profile');
  }

  async updateUserProfile(profileData: any): Promise<ApiResponse> {
    return this.makeRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Rescue Pair methods - Updated to match backend API
  async getRescuePairList(): Promise<ApiResponse> {
    return this.makeRequest('/rescue-pairs');
  }

  async findMatches(preferences?: any): Promise<ApiResponse> {
    return this.makeRequest('/rescue-pairs/matches');
  }

  async acceptMatch(pairId: string): Promise<ApiResponse> {
    return this.makeRequest(`/rescue-pairs/${pairId}/accept`, {
      method: 'POST',
    });
  }

  async rejectMatch(pairId: string): Promise<ApiResponse> {
    return this.makeRequest(`/rescue-pairs/${pairId}/reject`, {
      method: 'POST',
    });
  }

  async createRescuePair(data: { targetUserId: string; preferences?: any }): Promise<ApiResponse> {
    return this.makeRequest('/rescue-pairs', {
      method: 'POST',
      body: JSON.stringify({ targetUserId: data.targetUserId }),
    });
  }

  async getRescuePairDetails(pairId: string): Promise<ApiResponse> {
    return this.makeRequest(`/rescue-pairs/${pairId}`);
  }

  async updateRescuePairStatus(pairId: string, status: string): Promise<ApiResponse> {
    return this.makeRequest(`/rescue-pairs/${pairId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.makeRequest('/health');
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.healthCheck();
      return response.success;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }

  // Meditation methods (for admin and user access)
  async getMeditations(params?: { search?: string; category?: string; isPremium?: boolean; limit?: number; page?: number }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/meditations${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.makeRequest(endpoint);
  }

  async getMeditation(meditationId: string): Promise<ApiResponse> {
    return this.makeRequest(`/meditations/${meditationId}`);
  }

  async createMeditation(meditationData: {
    title: string;
    description: string;
    duration: number;
    audioUrl: string;
    category: string;
    isPremium: boolean;
    tags: string[];
  }): Promise<ApiResponse> {
    return this.makeRequest('/meditations', {
      method: 'POST',
      body: JSON.stringify(meditationData),
    });
  }

  async uploadMeditationFile(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // Get auth token directly
    let token = this.authToken;
    if (typeof window !== 'undefined') {
      token = token || localStorage.getItem('token') || localStorage.getItem('authToken') || null;
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.makeRequest('/meditations/upload', {
      method: 'POST',
      body: formData,
      headers,
    });
  }

  async deleteMeditation(meditationId: string): Promise<ApiResponse> {
    return this.makeRequest(`/meditations/${meditationId}`, {
      method: 'DELETE',
    });
  }

  async updateMeditation(meditationId: string, meditationData: Partial<{
    title: string;
    description: string;
    duration: number;
    category: string;
    isPremium: boolean;
    tags: string[];
  }>): Promise<ApiResponse> {
    return this.makeRequest(`/meditations/${meditationId}`, {
      method: 'PUT',
      body: JSON.stringify(meditationData),
    });
  }
}

export const backendService = new BackendService();
