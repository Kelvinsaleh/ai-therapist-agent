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
        backendService.getChatSessions(),
        backendService.getJournalEntries(),
        backendService.getMoodEntries?.() || Promise.resolve({ success: true, data: [] })
      ]);

      const sessions = sessionsResponse.success ? sessionsResponse.data || [] : [];
      const journalEntries = journalResponse.success ? journalResponse.data || [] : [];
      const moodEntries = moodResponse.success ? moodResponse.data || [] : [];

      // Calculate statistics
      const totalSessions = sessions.length;
      
      // Sessions this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const sessionsThisWeek = sessions.filter((session: any) => 
        new Date(session.createdAt) > oneWeekAgo
      ).length;

      // Total messages across all sessions
      const totalMessages = sessions.reduce((total: number, session: any) => 
        total + (session.messages?.length || 0), 0
      );

      // Average session duration (mock for now)
      const averageSessionDuration = totalSessions > 0 ? 25 : 0;

      // Mood trend calculation
      let moodTrend: 'up' | 'down' | 'stable' = 'stable';
      if (moodEntries.length >= 2) {
        const recentMoods = moodEntries.slice(-2);
        const currentMood = recentMoods[1]?.mood || 3;
        const previousMood = recentMoods[0]?.mood || 3;
        
        if (currentMood > previousMood) moodTrend = 'up';
        else if (currentMood < previousMood) moodTrend = 'down';
      }

      // Last session date
      const lastSessionDate = sessions.length > 0 
        ? sessions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
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
        .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime())
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
        backendService.getJournalEntries(),
        backendService.getMeditationSessions()
      ]);

      const activities: Activity[] = [];

      // Add journal entries
      if (journalResponse.success && journalResponse.data) {
        journalResponse.data.forEach((entry: any) => {
          activities.push({
            id: entry.id,
            userId: entry.userId,
            type: 'journal',
            title: entry.title || 'Journal Entry',
            description: entry.content?.substring(0, 100) + "..." || "Journal entry",
            mood: entry.mood,
            timestamp: new Date(entry.createdAt)
          });
        });
      }

      // Add meditation sessions
      if (meditationResponse.success && meditationResponse.data) {
        meditationResponse.data.forEach((session: any) => {
          activities.push({
            id: session.id,
            userId: session.userId,
            type: 'meditation',
            title: session.title || 'Meditation Session',
            description: `${session.duration || 10} minute meditation`,
            duration: session.duration,
            timestamp: new Date(session.createdAt)
          });
        });
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
      const response = await backendService.sendChatMessage({ sessionId, message });
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