"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/contexts/session-context";
import { dashboardService } from "@/lib/api/dashboard-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Activity,
  Brain,
  Heart,
  Clock,
  Users,
  Loader2,
  AlertCircle,
  Crown,
  Video,
  Filter,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoadingDotsCentered } from "@/components/ui/loading-dots";

export default function DashboardPage() {
  const { user, isAuthenticated, userTier, isLoading } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      loadDashboardData();
    }
  }, [isAuthenticated, isLoading]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, activityData, chatData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivity(),
        dashboardService.getChatHistory()
      ]);

      setStats(statsData);
      setRecentActivity(activityData);
      setChatHistory(chatData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingDotsCentered text="Loading dashboard..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your dashboard</h2>
          <Button onClick={() => router.push("/login")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error loading dashboard</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadDashboardData}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's your mental health journey overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={userTier === "premium" ? "default" : "secondary"} className="text-sm">
              {userTier === "premium" ? "Premium" : "Free"} Plan
            </Badge>
            {userTier === "premium" && (
              <Badge variant="outline" className="text-sm">
                <Crown className="w-3 h-3 mr-1" />
                Unlimited Access
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalSessions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.sessionsThisWeek || 0} this week
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalMessages || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total conversations
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.averageSessionDuration || 0}m</div>
                <p className="text-xs text-muted-foreground">
                  Duration per session
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mood Trend</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{stats?.moodTrend || "stable"}</div>
                <p className="text-xs text-muted-foreground">
                  Recent mood changes
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-sm">Start a session or journal entry</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity?.slice(0, 5).map((activity, index) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {activity.type === 'session' && <MessageSquare className="w-4 h-4 text-primary" />}
                          {activity.type === 'journal' && <Brain className="w-4 h-4 text-primary" />}
                          {activity.type === 'meditation' && <Heart className="w-4 h-4 text-primary" />}
                          {activity.type === 'mood' && <TrendingUp className="w-4 h-4 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Chat History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Recent Conversations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chatHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start your first therapy session</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatHistory?.slice(0, 5).map((message, index) => (
                      <div key={message.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user' ? 'bg-primary/10' : 'bg-secondary/10'
                        }`}>
                          {message.role === 'user' ? (
                            <Users className="w-4 h-4 text-primary" />
                          ) : (
                            <Brain className="w-4 h-4 text-secondary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {message.role === 'user' ? 'You' : 'AI Therapist'}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {message.message}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Premium Features Showcase */}
        {userTier === "premium" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  Premium Features Active
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  You have access to all premium features
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Unlimited Matches</p>
                    <p className="text-xs text-muted-foreground">Find unlimited support partners</p>
                  </div>
                  <div className="text-center">
                    <Video className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Video Calls</p>
                    <p className="text-xs text-muted-foreground">Face-to-face support sessions</p>
                  </div>
                  <div className="text-center">
                    <Filter className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Advanced Filters</p>
                    <p className="text-xs text-muted-foreground">Find perfect matches</p>
                  </div>
                  <div className="text-center">
                    <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Priority Support</p>
                    <p className="text-xs text-muted-foreground">24/7 crisis assistance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => router.push("/therapy")}
                  className="h-20 flex flex-col gap-2"
                >
                  <MessageSquare className="w-6 h-6" />
                  <span>Start Therapy Session</span>
                </Button>
                <Button 
                  onClick={() => router.push("/journaling")}
                  variant="outline"
                  className="h-20 flex flex-col gap-2"
                >
                  <Brain className="w-6 h-6" />
                  <span>Write Journal Entry</span>
                </Button>
                <Button 
                  onClick={() => router.push("/meditations")}
                  variant="outline"
                  className="h-20 flex flex-col gap-2"
                >
                  <Heart className="w-6 h-6" />
                  <span>Start Meditation</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
