"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  MessageSquare, 
  PlusCircle, 
  Loader2,
  Heart,
  Activity,
  TrendingUp,
  Calendar,
  BookOpen,
  Lightbulb
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MemoryEnhancedChat } from "@/components/therapy/memory-enhanced-chat";
import { userMemoryManager, UserMemory } from "@/lib/memory/user-memory";
import { format } from "date-fns";

export default function MemoryEnhancedTherapyPage() {
  const params = useParams();
  const router = useRouter();
  const [userMemory, setUserMemory] = useState<UserMemory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMemoryStats, setShowMemoryStats] = useState(false);

  // Mock user ID - in real app, this would come from authentication
  const userId = "user_123";

  useEffect(() => {
    loadUserMemory();
  }, []);

  const loadUserMemory = async () => {
    try {
      setIsLoading(true);
      const memory = await userMemoryManager.loadUserMemory(userId);
      setUserMemory(memory);
    } catch (error) {
      console.error("Failed to load user memory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMemoryStats = () => {
    if (!userMemory) return null;

    return {
      journalEntries: userMemory.journalEntries.length,
      meditationSessions: userMemory.meditationHistory.length,
      therapySessions: userMemory.therapySessions.length,
      insights: userMemory.insights.length,
      recentMood: userMemory.moodPatterns[userMemory.moodPatterns.length - 1]?.mood || 3,
      moodTrend: userMemory.moodPatterns.length >= 7 ? 
        (userMemory.moodPatterns.slice(-7).reduce((sum, p) => sum + p.mood, 0) / 7) : 3
    };
  };

  const getRecentInsights = () => {
    if (!userMemory) return [];
    return userMemory.insights.slice(-3);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your mental health context...</p>
        </div>
      </div>
    );
  }

  const stats = getMemoryStats();
  const recentInsights = getRecentInsights();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-semibold">AI Therapist with Memory</h1>
                <p className="text-sm text-muted-foreground">
                  Personalized therapy based on your mental health journey
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMemoryStats(!showMemoryStats)}
              >
                <Brain className="w-4 h-4 mr-2" />
                Memory Stats
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/therapy/new")}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                New Session
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Memory Stats Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <AnimatePresence>
              {showMemoryStats && stats && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        Your Mental Health Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{stats.journalEntries}</div>
                          <div className="text-xs text-muted-foreground">Journal Entries</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-500">{stats.meditationSessions}</div>
                          <div className="text-xs text-muted-foreground">Meditations</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">{stats.therapySessions}</div>
                          <div className="text-xs text-muted-foreground">Therapy Sessions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-500">{stats.insights}</div>
                          <div className="text-xs text-muted-foreground">AI Insights</div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Current Mood</span>
                          <span className={`text-sm font-bold ${
                            stats.recentMood <= 2 ? 'text-red-500' : 
                            stats.recentMood <= 4 ? 'text-yellow-500' : 'text-green-500'
                          }`}>
                            {stats.recentMood}/6
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              stats.recentMood <= 2 ? 'bg-red-500' : 
                              stats.recentMood <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(stats.recentMood / 6) * 100}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {recentInsights.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-500" />
                          Recent Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {recentInsights.map((insight, index) => (
                          <div key={index} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant={
                                  insight.type === 'achievement' ? 'default' :
                                  insight.type === 'concern' ? 'destructive' :
                                  insight.type === 'breakthrough' ? 'secondary' : 'outline'
                                }
                                className="text-xs"
                              >
                                {insight.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(insight.date, 'MMM dd')}
                              </span>
                            </div>
                            <p className="text-sm">{insight.content}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-200px)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Therapy Session
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      Memory Enhanced
                    </Badge>
                    {stats && (
                      <Badge variant="outline">
                        {stats.journalEntries + stats.meditationSessions} data points
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <MemoryEnhancedChat 
                  sessionId={params.sessionId as string || "memory-enhanced"} 
                  userId={userId}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
