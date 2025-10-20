"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/contexts/session-context";
import { backendService } from "@/lib/api/backend-service";
import { dashboardService } from "@/lib/api/dashboard-service";
import { getMoodHistory, getMoodStats } from "@/lib/api/mood";
import { paystackService } from "@/lib/payments/paystack-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Settings, 
  TrendingUp, 
  Activity, 
  MessageSquare,
  Heart,
  BookOpen,
  Headphones,
  Calendar,
  Clock,
  Edit,
  Save,
  X,
  Loader2,
  Crown,
  Mail,
  Lock,
  Brain,
  Target,
  Smile,
  ChevronDown,
  BarChart3,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

interface UserProfile {
  bio: string;
  age: number;
  challenges: string[];
  goals: string[];
  communicationStyle: "gentle" | "direct" | "supportive";
  experienceLevel: "beginner" | "intermediate" | "experienced";
  interests: string[];
}

const COMMUNICATION_STYLES = [
  { value: "gentle", label: "Gentle", description: "Soft and empathetic approach" },
  { value: "direct", label: "Direct", description: "Clear and straightforward communication" },
  { value: "supportive", label: "Supportive", description: "Encouraging and affirming style" }
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", description: "New to mental health journey" },
  { value: "intermediate", label: "Intermediate", description: "Some experience with therapy/self-care" },
  { value: "experienced", label: "Experienced", description: "Well-versed in mental health practices" }
];

const COMMON_CHALLENGES = [
  "Anxiety", "Depression", "Stress", "PTSD", "OCD", "Bipolar Disorder",
  "Eating Disorders", "Social Anxiety", "Panic Attacks", "Insomnia",
  "ADHD", "Addiction", "Grief", "Trauma", "Burnout"
];

const COMMON_GOALS = [
  "Better Sleep", "Stress Management", "Mindfulness", "Emotional Regulation",
  "Improved Relationships", "Self-Confidence", "Work-Life Balance",
  "Reduce Anxiety", "Overcome Depression", "Build Resilience",
  "Develop Coping Skills", "Increase Self-Awareness", "Find Purpose"
];

export default function ProfilePage() {
  const { user, isAuthenticated, userTier, isLoading, refreshUser } = useSession();
  const router = useRouter();
  
  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // User data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  
  // Analytics data
  const [stats, setStats] = useState<any>(null);
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [moodStats, setMoodStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [moodPeriod, setMoodPeriod] = useState<"7days" | "30days" | "90days">("7days");
  
  // Subscription data
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      loadProfileData();
    }
  }, [isAuthenticated, isLoading]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [profileRes, statsData, activityData, moodHistoryData, moodStatsData, subscriptionData] = await Promise.all([
        backendService.getUserProfile(),
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivity(),
        getMoodHistory({ limit: 90 }).catch(() => ({ success: false, data: [] })),
        getMoodStats("week").catch(() => ({ success: false, data: null })),
        paystackService.getSubscriptionStatus(user?._id || '').catch(() => ({ isActive: false, plan: null }))
      ]);

      // Set profile data
      if (profileRes.success && profileRes.data) {
        setUserProfile(profileRes.data);
        setEditedProfile(profileRes.data);
      }
      
      // Set user basic info for editing
      if (user) {
        setEditedName(user.name);
        setEditedEmail(user.email);
      }

      // Set analytics data
      setStats(statsData);
      setRecentActivity(activityData);
      
      if (moodHistoryData.success && moodHistoryData.data) {
        setMoodHistory(moodHistoryData.data);
      }
      
      if (moodStatsData.success && moodStatsData.data) {
        setMoodStats(moodStatsData.data);
      }
      
      // Set subscription data
      setSubscriptionStatus(subscriptionData);
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      
      // Update basic user info if changed
      if (editedName !== user?.name || editedEmail !== user?.email) {
        const userRes = await backendService.updateUser({
          name: editedName,
          email: editedEmail
        });
        if (!userRes.success) {
          throw new Error("Failed to update basic info");
        }
        // Refresh session user so header and other components reflect changes
        await refreshUser();
      }
      
      // Update user profile (therapeutic preferences)
      if (editedProfile) {
        const profileRes = await backendService.updateUserProfile(editedProfile);
        if (!profileRes.success) {
          throw new Error("Failed to update profile");
        }
        setUserProfile(editedProfile);
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      await loadProfileData();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(userProfile);
    setEditedName(user?.name || "");
    setEditedEmail(user?.email || "");
    setIsEditing(false);
  };

  const toggleChallenge = (challenge: string) => {
    if (!editedProfile) return;
    const challenges = editedProfile.challenges || [];
    const updated = challenges.includes(challenge)
      ? challenges.filter(c => c !== challenge)
      : [...challenges, challenge];
    setEditedProfile({ ...editedProfile, challenges: updated });
  };

  const toggleGoal = (goal: string) => {
    if (!editedProfile) return;
    const goals = editedProfile.goals || [];
    const updated = goals.includes(goal)
      ? goals.filter(g => g !== goal)
      : [...goals, goal];
    setEditedProfile({ ...editedProfile, goals: updated });
  };

  // Process mood data for charts
  const getMoodChartData = () => {
    if (!moodHistory || moodHistory.length === 0) return [];
    
    const days = moodPeriod === "7days" ? 7 : moodPeriod === "30days" ? 30 : 90;
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const filtered = moodHistory
      .filter((entry: any) => new Date(entry.timestamp) >= startDate)
      .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    return filtered.map((entry: any) => ({
      date: new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: entry.score,
      fullDate: entry.timestamp
    }));
  };

  const getActivityChartData = () => {
    if (!recentActivity || recentActivity.length === 0) return [];
    
    const activityCounts: { [key: string]: number } = {};
    
    recentActivity.forEach((activity: any) => {
      const type = activity.type;
      activityCounts[type] = (activityCounts[type] || 0) + 1;
    });
    
    return Object.entries(activityCounts).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count
    }));
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile</h2>
          <Button onClick={() => router.push("/login")}>Sign In</Button>
        </div>
      </div>
    );
  }

  const moodChartData = getMoodChartData();
  const activityChartData = getActivityChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <User className="w-8 h-8 text-primary" />
              My Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your profile and track your CBT therapy progress
            </p>
          </div>
          <Badge variant={userTier === "premium" ? "default" : "secondary"} className="text-sm">
            <Crown className="w-3 h-3 mr-1" />
            {userTier === "premium" ? "Premium" : "Free"} Plan
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Therapy Sessions</CardTitle>
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

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Messages</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalMessages || 0}</div>
                    <p className="text-xs text-muted-foreground">Total conversations</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Mood</CardTitle>
                    <Smile className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {moodStats?.average ? Math.round(moodStats.average) : "--"}
                    </div>
                    <p className="text-xs text-muted-foreground">Out of 100</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mood Trend</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">{stats?.moodTrend || "stable"}</div>
                    <p className="text-xs text-muted-foreground">Recent changes</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* CBT Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CBT Progress Tracker */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    CBT Progress Tracker
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track your cognitive behavioral therapy journey
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Thought Records Progress */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <Brain className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Thought Records</p>
                          <p className="text-xs text-muted-foreground">Challenge negative thoughts</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{stats?.thoughtRecordsCompleted || 0}</p>
                        <p className="text-xs text-muted-foreground">completed</p>
                      </div>
                    </div>

                    {/* Mood Tracking Progress */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                          <Heart className="w-4 h-4 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Mood Entries</p>
                          <p className="text-xs text-muted-foreground">Track emotional patterns</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{stats?.moodEntries || 0}</p>
                        <p className="text-xs text-muted-foreground">entries</p>
                      </div>
                    </div>

                    {/* Relaxation Sessions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                          <Wind className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Relaxation Sessions</p>
                          <p className="text-xs text-muted-foreground">Meditation & breathing</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{stats?.relaxationSessions || 0}</p>
                        <p className="text-xs text-muted-foreground">sessions</p>
                      </div>
                    </div>

                    {/* Weekly Streak */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                          <Target className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Weekly Streak</p>
                          <p className="text-xs text-muted-foreground">Consistent practice</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{stats?.weeklyStreak || 0}</p>
                        <p className="text-xs text-muted-foreground">weeks</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <Button asChild className="w-full">
                      <Link href="/cbt/dashboard">
                        <Brain className="w-4 h-4 mr-2" />
                        View Full CBT Dashboard
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* CBT Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    CBT Quick Actions
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Quick access to therapeutic tools
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Thought Record */}
                    <Button asChild variant="outline" className="w-full justify-start h-auto p-4">
                      <Link href="/journaling">
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">Thought Record</p>
                            <p className="text-xs text-muted-foreground">Challenge negative thoughts</p>
                          </div>
                        </div>
                      </Link>
                    </Button>

                    {/* Mood Check-in */}
                    <Button asChild variant="outline" className="w-full justify-start h-auto p-4">
                      <Link href="/dashboard">
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                            <Heart className="w-4 h-4 text-pink-600" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">Mood Check-in</p>
                            <p className="text-xs text-muted-foreground">Track your current mood</p>
                          </div>
                        </div>
                      </Link>
                    </Button>

                    {/* Meditation */}
                    <Button asChild variant="outline" className="w-full justify-start h-auto p-4">
                      <Link href="/meditations">
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <Wind className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">Relaxation</p>
                            <p className="text-xs text-muted-foreground">Meditation & breathing</p>
                          </div>
                        </div>
                      </Link>
                    </Button>

                    {/* AI Chat */}
                    <Button asChild variant="outline" className="w-full justify-start h-auto p-4">
                      <Link href="/therapy/memory-enhanced">
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">AI Therapy Chat</p>
                            <p className="text-xs text-muted-foreground">Memory-enhanced support</p>
                          </div>
                        </div>
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Your CBT Journey</p>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div className="w-2 h-2 rounded-full bg-muted"></div>
                        <div className="w-2 h-2 rounded-full bg-muted"></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">3 of 5 tools active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.slice(0, 10).map((activity, index) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {activity.type === 'session' && <MessageSquare className="w-4 h-4 text-primary" />}
                          {activity.type === 'journal' && <BookOpen className="w-4 h-4 text-primary" />}
                          {activity.type === 'meditation' && <Headphones className="w-4 h-4 text-primary" />}
                          {activity.type === 'mood' && <Heart className="w-4 h-4 text-primary" />}
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
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-sm">Start a session or journal entry</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Basic Information</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your personal details and account information
                    </p>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="mt-2"
                      />
                    ) : (
                      <div className="mt-2 p-3 rounded-lg bg-muted/50">
                        {user?.name || "Not set"}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        className="mt-2"
                      />
                    ) : (
                      <div className="mt-2 p-3 rounded-lg bg-muted/50">
                        {user?.email || "Not set"}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Member Since</Label>
                    <div className="mt-2 p-3 rounded-lg bg-muted/50 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                    </div>
                  </div>
                  <div>
                    <Label>Subscription</Label>
                    <div className="mt-2 p-3 rounded-lg bg-muted/50">
                      <Badge variant={userTier === "premium" ? "default" : "secondary"}>
                        <Crown className="w-3 h-3 mr-1" />
                        {userTier === "premium" ? "Premium" : "Free"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Therapeutic Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Therapeutic Profile</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your mental health preferences and goals
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Communication Style */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Communication Style</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {COMMUNICATION_STYLES.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => isEditing && setEditedProfile({ ...editedProfile!, communicationStyle: style.value as any })}
                        disabled={!isEditing}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          (isEditing ? editedProfile?.communicationStyle : userProfile?.communicationStyle) === style.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        } ${!isEditing && "cursor-default"}`}
                      >
                        <div className="font-medium">{style.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{style.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Experience Level</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => isEditing && setEditedProfile({ ...editedProfile!, experienceLevel: level.value as any })}
                        disabled={!isEditing}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          (isEditing ? editedProfile?.experienceLevel : userProfile?.experienceLevel) === level.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        } ${!isEditing && "cursor-default"}`}
                      >
                        <div className="font-medium">{level.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mental Health Challenges */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Mental Health Challenges</Label>
                  <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_CHALLENGES.map((challenge) => {
                      const isSelected = (isEditing ? editedProfile?.challenges : userProfile?.challenges)?.includes(challenge);
                      return (
                        <Badge
                          key={challenge}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer ${isEditing ? "hover:bg-primary/20" : "cursor-default"}`}
                          onClick={() => isEditing && toggleChallenge(challenge)}
                        >
                          {challenge}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Mental Health Goals</Label>
                  <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_GOALS.map((goal) => {
                      const isSelected = (isEditing ? editedProfile?.goals : userProfile?.goals)?.includes(goal);
                      return (
                        <Badge
                          key={goal}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer ${isEditing ? "hover:bg-primary/20" : "cursor-default"}`}
                          onClick={() => isEditing && toggleGoal(goal)}
                        >
                          {goal}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Bio */}
                {isEditing ? (
                  <div>
                    <Label htmlFor="bio" className="text-base font-semibold">Bio</Label>
                    <textarea
                      id="bio"
                      value={editedProfile?.bio || ""}
                      onChange={(e) => setEditedProfile({ ...editedProfile!, bio: e.target.value })}
                      className="w-full mt-2 p-3 rounded-lg border border-input bg-background min-h-[100px]"
                      placeholder="Tell us a bit about yourself..."
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {editedProfile?.bio?.length || 0}/500 characters
                    </p>
                  </div>
                ) : userProfile?.bio && (
                  <div>
                    <Label className="text-base font-semibold">Bio</Label>
                    <p className="mt-2 p-3 rounded-lg bg-muted/50">{userProfile.bio}</p>
                  </div>
                )}

                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button onClick={handleSaveProfile} disabled={isSaving} className="flex-1">
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline" disabled={isSaving}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your account security and preferences
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold">Password & Security</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        For security reasons, password changes must be done through your email.
                      </p>
                      <Button variant="outline" className="mt-3" onClick={() => router.push("/forgot-password")}>
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start gap-3">
                    <Crown className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold">Subscription</h4>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm">
                          Current plan: <strong>{userTier === "premium" ? "Premium" : "Free"}</strong>
                        </p>
                        
                        {subscriptionStatus && subscriptionStatus.isActive && subscriptionStatus.plan && (
                          <div className="text-sm text-muted-foreground">
                            <p>Plan: {subscriptionStatus.plan.name}</p>
                            {subscriptionStatus.expiresAt && (
                              <p>Expires: {new Date(subscriptionStatus.expiresAt).toLocaleDateString()}</p>
                            )}
                          </div>
                        )}
                        
                        {userTier === "free" ? (
                          <Button className="mt-3" onClick={() => router.push("/pricing")}>
                            <Crown className="w-4 h-4 mr-2" />
                            Upgrade to Premium
                          </Button>
                        ) : (
                          <div className="mt-3 space-y-2">
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active Premium
                            </Badge>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push("/pricing")}
                              >
                                Manage Subscription
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Add cancel subscription functionality
                                  toast.info("Subscription cancellation will be available soon");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

