// User Memory System for AI Therapist
// This system stores and retrieves user context from journals, meditations, and therapy sessions

import { ChatMessage } from '../api/chat';

export interface UserMemory {
  userId: string;
  profile: {
    name: string;
    preferences: {
      communicationStyle: 'gentle' | 'direct' | 'supportive';
      topicsToAvoid: string[];
      preferredTechniques: string[];
    };
    goals: string[];
    challenges: string[];
  };
  journalEntries: JournalMemory[];
  meditationHistory: MeditationMemory[];
  therapySessions: TherapyMemory[];
  moodPatterns: MoodPattern[];
  insights: UserInsight[];
  concerns?: string[];
  lastUpdated: Date;
}

export interface JournalMemory {
  id: string;
  date: Date;
  mood: number;
  content: string;
  tags: string[];
  keyThemes: string[];
  emotionalState: string;
  concerns: string[];
  achievements: string[];
  insights: string[];
}

export interface MeditationMemory {
  id: string;
  date: Date;
  type: string;
  duration: number;
  completionRate: number;
  moodBefore: number;
  moodAfter: number;
  effectiveness: number;
  notes?: string;
}

export interface TherapyMemory {
  sessionId: string;
  date: Date;
  topics: string[];
  techniques: string[];
  breakthroughs: string[];
  concerns: string[];
  goals: string[];
  mood: number;
  summary: string;
  messages?: ChatMessage[];
}

export interface MoodPattern {
  date: Date;
  mood: number;
  triggers: string[];
  activities: string[];
  sleep: number;
  stress: number;
}

export interface UserInsight {
  id: string;
  type: 'pattern' | 'breakthrough' | 'concern' | 'achievement';
  content: string;
  confidence: number;
  date: Date;
  source: 'journal' | 'therapy' | 'meditation' | 'mood';
}

class UserMemoryManager {
  private memory: UserMemory | null = null;

  // Load user memory (with backend sync)
  async loadUserMemory(userId: string): Promise<UserMemory> {
    if (this.memory && this.memory.userId === userId) {
      return this.memory;
    }

    // Try to load from backend first
    try {
      if (typeof window !== 'undefined') {
        const { backendService } = await import("@/lib/api/backend-service");
        const journalResponse = await backendService.getJournalEntries();
        
        if (journalResponse.success && journalResponse.data) {
          // Create memory from backend data
          this.memory = {
            userId,
            profile: {
              name: "User",
              preferences: {
                communicationStyle: 'supportive',
                topicsToAvoid: [],
                preferredTechniques: [],
              },
              goals: [],
              challenges: [],
            },
            journalEntries: journalResponse.data.map((entry: any) => ({
              id: entry._id,
              date: new Date(entry.createdAt),
              mood: entry.mood,
              content: entry.content,
              tags: entry.tags || [],
              keyThemes: this.extractKeyThemes(entry.content),
              emotionalState: this.analyzeEmotionalState(entry.content, entry.mood),
              concerns: this.extractConcerns(entry.content),
              achievements: this.extractAchievements(entry.content),
              insights: entry.insights || []
            })),
            meditationHistory: [],
            therapySessions: [],
            moodPatterns: [],
            insights: [],
            lastUpdated: new Date(),
          };
          
          await this.saveUserMemory();
          return this.memory;
        }
      }
    } catch (error) {
      console.log("Backend sync failed, using local storage:", error);
    }

    // Fallback to localStorage
    const stored = localStorage.getItem(`userMemory_${userId}`);
    if (stored) {
      this.memory = JSON.parse(stored);
      this.memory!.lastUpdated = new Date(this.memory!.lastUpdated);
      return this.memory!;
    }

    // Create new memory
    this.memory = {
      userId,
      profile: {
        name: "User",
        preferences: {
          communicationStyle: 'supportive',
          topicsToAvoid: [],
          preferredTechniques: [],
        },
        goals: [],
        challenges: [],
      },
      journalEntries: [],
      meditationHistory: [],
      therapySessions: [],
      moodPatterns: [],
      insights: [],
      lastUpdated: new Date(),
    };

    await this.saveUserMemory();
    return this.memory;
  }

  // Save user memory
  async saveUserMemory(): Promise<void> {
    if (!this.memory) return;
    
    this.memory.lastUpdated = new Date();
    localStorage.setItem(`userMemory_${this.memory.userId}`, JSON.stringify(this.memory));
  }

  // Add journal entry to memory
  async addJournalEntry(entry: Omit<JournalMemory, 'id'>): Promise<void> {
    if (!this.memory) return;

    const journalMemory: JournalMemory = {
      ...entry,
      id: Date.now().toString(),
      keyThemes: this.extractKeyThemes(entry.content),
      emotionalState: this.analyzeEmotionalState(entry.content, entry.mood),
      concerns: this.extractConcerns(entry.content),
      achievements: this.extractAchievements(entry.content),
      insights: this.generateInsights(entry.content, entry.mood)
    };

    this.memory.journalEntries.push(journalMemory);
    
    // Update mood patterns
    this.updateMoodPattern(entry.date, entry.mood, entry.tags);
    
    // Generate new insights
    await this.generateUserInsights();
    await this.saveUserMemory();

    // Sync with backend if available
    try {
      if (typeof window !== 'undefined') {
        const { backendService } = await import("@/lib/api/backend-service");
        await backendService.createJournalEntry({
          title: `Entry ${entry.date.toLocaleDateString()}`,
          content: entry.content,
          mood: entry.mood,
          tags: entry.tags,
          createdAt: entry.date,
          insights: journalMemory.insights,
          emotionalState: journalMemory.emotionalState,
          keyThemes: journalMemory.keyThemes,
          concerns: journalMemory.concerns,
          achievements: journalMemory.achievements
        });
      }
    } catch (error) {
      console.log("Failed to sync journal entry with backend:", error);
      // Continue anyway - local storage is sufficient
    }
  }

  // Add meditation session to memory
  async addMeditationSession(session: Omit<MeditationMemory, 'id'>): Promise<void> {
    if (!this.memory) return;

    const meditationMemory: MeditationMemory = {
      ...session,
      id: Date.now().toString()
    };

    this.memory.meditationHistory.push(meditationMemory);
    await this.saveUserMemory();
  }

  // Add therapy session to memory
  async addTherapySession(session: Omit<TherapyMemory, 'sessionId'>): Promise<void> {
    if (!this.memory) return;

    const therapyMemory: TherapyMemory = {
      ...session,
      sessionId: Date.now().toString()
    };

    this.memory.therapySessions.push(therapyMemory);
    await this.generateUserInsights();
    await this.saveUserMemory();
  }

  // Get context for therapy session
  getTherapyContext(): string {
    if (!this.memory) return '';

    const recentEntries = this.memory.journalEntries
      .slice(-5)
      .map(entry => `Journal (${entry.date.toLocaleDateString()}): Mood ${entry.mood}/6 - ${entry.content.substring(0, 200)}...`)
      .join('\n');

    const recentMeditations = this.memory.meditationHistory
      .slice(-3)
      .map(med => `Meditation: ${med.type} (${med.duration}min) - Mood change: ${med.moodBefore} → ${med.moodAfter}`)
      .join('\n');

    const moodTrend = this.getMoodTrend();
    const keyInsights = this.memory.insights
      .slice(-3)
      .map(insight => `Insight: ${insight.content}`)
      .join('\n');

    return `
USER CONTEXT FOR THERAPY SESSION:

RECENT JOURNAL ENTRIES:
${recentEntries}

RECENT MEDITATIONS:
${recentMeditations}

MOOD TREND:
${moodTrend}

KEY INSIGHTS:
${keyInsights}

USER PREFERENCES:
- Communication style: ${this.memory.profile.preferences.communicationStyle}
- Goals: ${this.memory.profile.goals.join(', ')}
- Challenges: ${this.memory.profile.challenges.join(', ')}
- Topics to avoid: ${this.memory.profile.preferences.topicsToAvoid.join(', ')}
    `.trim();
  }

  // Get personalized therapy suggestions
  getTherapySuggestions(): string[] {
    if (!this.memory) return [];

    const suggestions = [];
    const recentMood = this.getRecentMood();
    const recentThemes = this.getRecentThemes();

    if (recentMood < 3) {
      suggestions.push("The user has been experiencing low mood recently. Consider gentle, supportive approaches and breathing exercises.");
    }

    if (recentThemes.includes('anxiety')) {
      suggestions.push("Anxiety has been a recurring theme. Grounding techniques and progressive muscle relaxation may be helpful.");
    }

    if (recentThemes.includes('work')) {
      suggestions.push("Work-related stress is present. Consider work-life balance strategies and boundary setting.");
    }

    if (this.memory.meditationHistory.length > 0) {
      const lastMeditation = this.memory.meditationHistory[this.memory.meditationHistory.length - 1];
      if (lastMeditation.effectiveness > 0.7) {
        suggestions.push(`The user found ${lastMeditation.type} meditation very effective. Consider suggesting similar techniques.`);
      }
    }

    return suggestions;
  }

  // Private helper methods
  private extractKeyThemes(content: string): string[] {
    const themes = [];
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('work') || lowerContent.includes('job') || lowerContent.includes('career')) {
      themes.push('work');
    }
    if (lowerContent.includes('relationship') || lowerContent.includes('partner') || lowerContent.includes('family')) {
      themes.push('relationships');
    }
    if (lowerContent.includes('anxiety') || lowerContent.includes('worried') || lowerContent.includes('nervous')) {
      themes.push('anxiety');
    }
    if (lowerContent.includes('depression') || lowerContent.includes('sad') || lowerContent.includes('down')) {
      themes.push('depression');
    }
    if (lowerContent.includes('sleep') || lowerContent.includes('insomnia') || lowerContent.includes('tired')) {
      themes.push('sleep');
    }
    if (lowerContent.includes('health') || lowerContent.includes('exercise') || lowerContent.includes('fitness')) {
      themes.push('health');
    }

    return themes;
  }

  private analyzeEmotionalState(content: string, mood: number): string {
    if (mood <= 2) return 'very low';
    if (mood <= 3) return 'low';
    if (mood <= 4) return 'neutral';
    if (mood <= 5) return 'good';
    return 'excellent';
  }

  private extractConcerns(content: string): string[] {
    const concerns = [];
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('worried') || lowerContent.includes('concerned')) {
      concerns.push('general worry');
    }
    if (lowerContent.includes('stressed') || lowerContent.includes('overwhelmed')) {
      concerns.push('stress');
    }
    if (lowerContent.includes('lonely') || lowerContent.includes('isolated')) {
      concerns.push('loneliness');
    }

    return concerns;
  }

  private extractAchievements(content: string): string[] {
    const achievements = [];
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('accomplished') || lowerContent.includes('achieved')) {
      achievements.push('accomplishment');
    }
    if (lowerContent.includes('grateful') || lowerContent.includes('thankful')) {
      achievements.push('gratitude practice');
    }
    if (lowerContent.includes('proud') || lowerContent.includes('success')) {
      achievements.push('success');
    }

    return achievements;
  }

  private generateInsights(content: string, mood: number): string[] {
    const insights = [];

    if (content.length > 200) {
      insights.push('Detailed reflection shows good self-awareness');
    }

    if (mood >= 5) {
      insights.push('Positive mood indicates good mental state');
    } else if (mood <= 2) {
      insights.push('Low mood may need attention and support');
    }

    return insights;
  }

  private updateMoodPattern(date: Date, mood: number, tags: string[]): void {
    if (!this.memory) return;

    this.memory.moodPatterns.push({
      date,
      mood,
      triggers: tags,
      activities: [],
      sleep: 0,
      stress: 0
    });

    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.memory.moodPatterns = this.memory.moodPatterns.filter(
      pattern => pattern.date >= thirtyDaysAgo
    );
  }

  private async generateUserInsights(): Promise<void> {
    if (!this.memory) return;

    // Analyze mood trends
    const recentMoods = this.memory.moodPatterns.slice(-7);
    if (recentMoods.length >= 3) {
      const avgMood = recentMoods.reduce((sum, p) => sum + p.mood, 0) / recentMoods.length;
      if (avgMood < 3) {
        this.addInsight('pattern', 'Recent mood trend shows consistently low mood. Consider reaching out for additional support.', 0.8);
      } else if (avgMood > 4) {
        this.addInsight('achievement', 'Mood has been consistently positive recently. Great progress!', 0.7);
      }
    }

    // Analyze journal themes
    const recentThemes = this.getRecentThemes();
    if (recentThemes.includes('anxiety') && recentThemes.length > 2) {
      this.addInsight('concern', 'Anxiety appears frequently in recent entries. This may be an area to focus on in therapy.', 0.9);
    }

    // Analyze meditation effectiveness
    const recentMeditations = this.memory.meditationHistory.slice(-5);
    if (recentMeditations.length > 0) {
      const avgEffectiveness = recentMeditations.reduce((sum, m) => sum + m.effectiveness, 0) / recentMeditations.length;
      if (avgEffectiveness > 0.7) {
        this.addInsight('achievement', 'Meditation practice is showing positive results. Keep it up!', 0.8);
      }
    }
  }

  private addInsight(type: UserInsight['type'], content: string, confidence: number): void {
    if (!this.memory) return;

    const insight: UserInsight = {
      id: Date.now().toString(),
      type,
      content,
      confidence,
      date: new Date(),
      source: 'journal'
    };

    this.memory.insights.push(insight);

    // Keep only last 20 insights
    this.memory.insights = this.memory.insights.slice(-20);
  }

  private getMoodTrend(): string {
    if (!this.memory || this.memory.moodPatterns.length < 2) {
      return 'Insufficient data for mood trend analysis';
    }

    const recent = this.memory.moodPatterns.slice(-7);
    const older = this.memory.moodPatterns.slice(-14, -7);

    if (recent.length === 0 || older.length === 0) {
      return 'Insufficient data for mood trend analysis';
    }

    const recentAvg = recent.reduce((sum, p) => sum + p.mood, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p.mood, 0) / older.length;

    if (recentAvg > olderAvg + 0.5) {
      return 'Mood is improving over the past week';
    } else if (recentAvg < olderAvg - 0.5) {
      return 'Mood has declined over the past week';
    } else {
      return 'Mood has been relatively stable';
    }
  }

  private getRecentMood(): number {
    if (!this.memory || this.memory.moodPatterns.length === 0) return 3;
    
    const recent = this.memory.moodPatterns.slice(-3);
    return recent.reduce((sum, p) => sum + p.mood, 0) / recent.length;
  }

  private getRecentThemes(): string[] {
    if (!this.memory) return [];

    const recentEntries = this.memory.journalEntries.slice(-5);
    const allThemes = recentEntries.flatMap(entry => entry.keyThemes);
    
    // Count theme frequency
    const themeCount: { [key: string]: number } = {};
    allThemes.forEach(theme => {
      themeCount[theme] = (themeCount[theme] || 0) + 1;
    });

    // Return themes that appear more than once
    return Object.entries(themeCount)
      .filter(([_, count]) => count > 1)
      .map(([theme, _]) => theme);
  }
}

// Export singleton instance
export const userMemoryManager = new UserMemoryManager();
