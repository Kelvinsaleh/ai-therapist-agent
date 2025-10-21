// Dashboard Service - Real backend integration
import { backendService } from './backend-service';

export interface DashboardStats {
  totalSessions: number;
  sessionsThisWeek: number;
  totalMessages: number;
  averageSessionDuration: number;
  moodTrend: 'up' | 'down' | 'stable';
  lastSessionDate?: string;
}

export interface RecentActivity {
  id: string;
  type: 'session' | 'journal' | 'meditation' | 'mood';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface ChatHistory {
  id: string;
  userId: string;
  message: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  context?: any;
}

export interface Session {
  id: string;
  userId: string;
  title: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  summary: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  duration?: number;
  mood?: number;
  timestamp: Date;
}

class DashboardService {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [sessionsResponse, journalResponse, moodResponse] = await Promise.all([
        backendService.getChatSessions().catch(() => ({ success: false, data: [] })),
        backendService.getJournalEntries().catch(() => ({ success: false, data: [] })),
        backendService.getMoodEntries?.().catch(() => ({ success: false, data: [] })) || Promise.resolve({ success: false, data: [] })
      ]);

      // Ensure we always have arrays, handle both array and object responses
      let sessions = sessionsResponse.success && sessionsResponse.data ? sessionsResponse.data : [];
      if (!Array.isArray(sessions)) {
        // If data is an object with a sessions array property
        sessions = (sessions as any).sessions || [];
      }

      let journalEntries = journalResponse.success && journalResponse.data ? journalResponse.data : [];
      if (!Array.isArray(journalEntries)) {
        journalEntries = (journalEntries as any).entries || [];
      }

      let moodEntries = moodResponse.success && moodResponse.data ? moodResponse.data : [];
      if (!Array.isArray(moodEntries)) {
        moodEntries = (moodEntries as any).moods || [];
      }

      // Calculate statistics
      const totalSessions = Array.isArray(sessions) ? sessions.length : 0;
      
      // Sessions this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const sessionsThisWeek = Array.isArray(sessions) 
        ? sessions.filter((session: any) => 
            session?.createdAt && new Date(session.createdAt) > oneWeekAgo
          ).length 
        : 0;

      // Total messages across all sessions
      const totalMessages = Array.isArray(sessions)
        ? sessions.reduce((total: number, session: any) => 
            total + (Array.isArray(session?.messages) ? session.messages.length : 0), 0
          )
        : 0;

      // Average session duration (mock for now)
      const averageSessionDuration = totalSessions > 0 ? 25 : 0;

      // Mood trend calculation
      let moodTrend: 'up' | 'down' | 'stable' = 'stable';
      if (Array.isArray(moodEntries) && moodEntries.length >= 2) {
        const recentMoods = moodEntries.slice(-2);
        const currentMood = recentMoods[1]?.mood || recentMoods[1]?.score || 3;
        const previousMood = recentMoods[0]?.mood || recentMoods[0]?.score || 3;
        
        if (currentMood > previousMood) moodTrend = 'up';
        else if (currentMood < previousMood) moodTrend = 'down';
      }

      // Last session date
      const lastSessionDate = Array.isArray(sessions) && sessions.length > 0 
        ? [...sessions].sort((a: any, b: any) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          )[0]?.createdAt
        : undefined;

      return {
        totalSessions,
        sessionsThisWeek,
        totalMessages,
        averageSessionDuration,
        moodTrend,
        lastSessionDate
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalSessions: 0,
        sessionsThisWeek: 0,
        totalMessages: 0,
        averageSessionDuration: 0,
        moodTrend: 'stable'
      };
    }
  }

  // Get recent chat history
  async getChatHistory(): Promise<ChatHistory[]> {
    try {
      const response = await backendService.getChatSessions();
      
      if (!response.success || !response.data) {
        return [];
      }

      const sessions = response.data;
      const chatHistory: ChatHistory[] = [];

      // Get recent messages from all sessions
      sessions.forEach((session: any) => {
        if (session.messages && Array.isArray(session.messages)) {
          session.messages.forEach((message: any) => {
            chatHistory.push({
              id: message.id || `${session.id}-${message.timestamp}`,
              userId: session.userId,
              message: message.content,
              role: message.role,
              timestamp: new Date(message.timestamp),
              sentiment: this.analyzeSentiment(message.content),
              context: {
                sessionId: session.id,
                sessionTitle: session.title
              }
            });
          });
        }
      });

      // Sort by timestamp and return last 10
      return chatHistory
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  // Get recent sessions
  async getRecentSessions(): Promise<Session[]> {
    try {
      const response = await backendService.getChatSessions();
      
      if (!response.success || !response.data) {
        return [];
      }

      return response.data
        .map((session: any) => ({
          id: session.id,
          userId: session.userId,
          title: session.title || `Session ${new Date(session.createdAt).toLocaleDateString()}`,
          status: session.status || 'completed',
          summary: session.summary || session.messages?.[0]?.content?.substring(0, 100) + "..." || "No summary available",
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt)
        }))
        .sort((a: Session, b: Session) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);
    } catch (error) {
      console.error('Error getting recent sessions:', error);
      return [];
    }
  }

  // Get recent activities
  async getRecentActivities(): Promise<Activity[]> {
    try {
      const [journalResponse, meditationResponse] = await Promise.all([
        backendService.getJournalEntries().catch(() => ({ success: false, data: [] })),
        backendService.getMeditationSessions().catch(() => ({ success: false, data: [] }))
      ]);

      const activities: Activity[] = [];

      // Add journal entries - handle both array and object responses
      if (journalResponse.success && journalResponse.data) {
        let journalData = journalResponse.data;
        if (!Array.isArray(journalData)) {
          journalData = (journalData as any).entries || (journalData as any).journals || [];
        }
        
        if (Array.isArray(journalData)) {
          journalData.forEach((entry: any) => {
            if (entry && entry.id) {
              activities.push({
                id: entry.id || entry._id,
                userId: entry.userId,
                type: 'journal',
                title: entry.title || 'Journal Entry',
                description: entry.content?.substring(0, 100) + "..." || "Journal entry",
                mood: entry.mood,
                timestamp: new Date(entry.createdAt || entry.date || Date.now())
              });
            }
          });
        }
      }

      // Add meditation sessions - handle both array and object responses
      if (meditationResponse.success && meditationResponse.data) {
        let meditationData = meditationResponse.data;
        if (!Array.isArray(meditationData)) {
          meditationData = (meditationData as any).sessions || (meditationData as any).meditations || [];
        }
        
        if (Array.isArray(meditationData)) {
          meditationData.forEach((session: any) => {
            if (session && session.id) {
              activities.push({
                id: session.id || session._id,
                userId: session.userId,
                type: 'meditation',
                title: session.title || 'Meditation Session',
                description: `${session.duration || 10} minute meditation`,
                duration: session.duration,
                timestamp: new Date(session.createdAt || session.date || Date.now())
              });
            }
          });
        }
      }

      // Sort by timestamp and return last 10
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }

  // Get recent activity (combined)
  async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      const activities = await this.getRecentActivities();
      
      return activities.map(activity => ({
        id: activity.id,
        type: activity.type as 'session' | 'journal' | 'meditation' | 'mood',
        title: activity.title,
        description: activity.description,
        timestamp: activity.timestamp.toISOString(),
        metadata: {
          duration: activity.duration,
          mood: activity.mood
        }
      }));
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  // Helper method to analyze sentiment
  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['good', 'great', 'happy', 'excited', 'amazing', 'wonderful', 'fantastic', 'love', 'enjoy'];
    const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'angry', 'frustrated', 'hate', 'worried', 'anxious'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Add new activity
  async addActivity(activity: Omit<Activity, 'id' | 'userId' | 'timestamp'>): Promise<boolean> {
    try {
      const response = await backendService.createActivity?.(activity);
      return response?.success || false;
    } catch (error) {
      console.error('Error adding activity:', error);
      return false;
    }
  }

  // Add new chat message
  async addChatMessage(sessionId: string, message: string): Promise<boolean> {
    try {
      const response = await backendService.sendChatMessage(sessionId, message);
      return response.success;
    } catch (error) {
      console.error('Error adding chat message:', error);
      return false;
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();

// Export individual methods for convenience
export const {
  getDashboardStats,
  getChatHistory,
  getRecentSessions,
  getRecentActivities,
  getRecentActivity,
  addActivity,
  addChatMessage,
} = dashboardService; 