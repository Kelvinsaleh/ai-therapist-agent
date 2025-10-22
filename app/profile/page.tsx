"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/contexts/session-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { backendService } from "@/lib/api/backend-service";
import { dashboardService } from "@/lib/api/dashboard-service";
import { getMoodHistory, getMoodStats } from "@/lib/api/mood";
import { paystackService } from "@/lib/payments/paystack-service";
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
  Smile,
  ChevronDown,
  BarChart3,
  CheckCircle,
  Target,
  Plus,
  Trash2
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
  
  // New goal input (goals themselves are in userProfile.goals)
  const [newGoal, setNewGoal] = useState("");
  
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
      
      // Load all data in parallel with error handling for each
      const [profileRes, statsData, activityData, moodHistoryData, moodStatsData, subscriptionData] = await Promise.all([
        backendService.getUserProfile().catch((e) => {
          console.warn("Profile fetch failed:", e);
          return { success: false, data: null };
        }),
        dashboardService.getDashboardStats().catch((e) => {
          console.warn("Stats fetch failed:", e);
          return {
            totalSessions: 0,
            sessionsThisWeek: 0,
            totalMessages: 0,
            averageSessionDuration: 0,
            moodTrend: 'stable' as const
          };
        }),
        dashboardService.getRecentActivity().catch((e) => {
          console.warn("Activity fetch failed:", e);
          return [];
        }),
        getMoodHistory({ limit: 90 }).catch((e) => {
          console.warn("Mood history fetch failed (endpoint may not exist):", e);
          return { success: false, data: [] };
        }),
        getMoodStats("week").catch((e) => {
          console.warn("Mood stats fetch failed (endpoint may not exist):", e);
          return { success: false, data: null };
        }),
        paystackService.getSubscriptionStatus(user?._id || '').catch((e) => {
          console.warn("Subscription status fetch failed:", e);
          return { isActive: false, plan: null };
        })
      ]);

      // Set profile data
      if (profileRes.success && profileRes.data) {
        // Ensure goals array exists
        const profile = {
          ...profileRes.data,
          goals: profileRes.data.goals || [],
          challenges: profileRes.data.challenges || [],
          interests: profileRes.data.interests || []
        };
        setUserProfile(profile);
        setEditedProfile(profile);
      } else {
        // Initialize with empty profile if none exists
        const emptyProfile: UserProfile = {
          bio: "",
          age: 0,
          challenges: [],
          goals: [],
          communicationStyle: "gentle",
          experienceLevel: "beginner",
          interests: []
        };
        setUserProfile(emptyProfile);
        setEditedProfile(emptyProfile);
      }
      
      // Set user basic info for editing
      if (user) {
        setEditedName(user.name);
        setEditedEmail(user.email);
      }

      // Set analytics data
      setStats(statsData);
      setRecentActivity(activityData || []);
      
      // Set mood data only if available
      if (moodHistoryData && moodHistoryData.success && moodHistoryData.data) {
        const historyArray = Array.isArray(moodHistoryData.data) 
          ? moodHistoryData.data 
          : [];
        setMoodHistory(historyArray);
      } else {
        setMoodHistory([]);
      }
      
      if (moodStatsData && moodStatsData.success && moodStatsData.data) {
        setMoodStats(moodStatsData.data);
      } else {
        setMoodStats(null);
      }
      
      // Set subscription data
      setSubscriptionStatus(subscriptionData);
    } catch (error) {
      console.error("Error loading profile data:", error);
      // Don't show error toast for partial failures
      // toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const saveGoalsToBackend = async (goals: string[]) => {
    try {
      console.log("Saving goals to backend:", goals);
      // Only send the goals field that changed
      const profileRes = await backendService.updateUserProfile({ goals });
      console.log("Backend response:", profileRes);
      
      if (profileRes.success) {
        toast.success("Goal saved!");
        // Update local state with the saved data
        if (profileRes.data) {
          console.log("Updated profile data:", profileRes.data);
          const updatedProfile = {
            ...profileRes.data,
            goals: profileRes.data.goals || [],
            challenges: profileRes.data.challenges || [],
            interests: profileRes.data.interests || []
          };
          setUserProfile(updatedProfile);
          setEditedProfile(updatedProfile);
        }
      } else {
        console.error("Failed to save goal:", profileRes.error);
        toast.error(profileRes.error || "Failed to save goal");
      }
    } catch (error) {
      console.error("Error saving goal:", error);
      toast.error("Failed to save goal");
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

  const moodChartData = getMoodChartData();
  const activityChartData = getActivityChartData();

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


  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6 pt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Simple Profile Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-6 h-6" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <p className="text-lg font-medium">{user?.name || 'Not set'}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-lg font-medium">{user?.email || 'Not set'}</p>
              </div>
              <div>
                <Label>Account Tier</Label>
                <Badge className="mt-2">{userTier}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goal Setting Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              My Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add new goal */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a new goal..."
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newGoal.trim()) {
                      const currentGoals = userProfile?.goals || [];
                      setEditedProfile(prev => ({ 
                        ...prev!, 
                        goals: [...currentGoals, newGoal.trim()] 
                      }));
                      setUserProfile(prev => ({
                        ...prev!,
                        goals: [...currentGoals, newGoal.trim()]
                      }));
                      setNewGoal("");
                      // Auto-save the new goal
                      saveGoalsToBackend([...currentGoals, newGoal.trim()]);
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    if (newGoal.trim()) {
                      const currentGoals = userProfile?.goals || [];
                      setEditedProfile(prev => ({ 
                        ...prev!, 
                        goals: [...currentGoals, newGoal.trim()] 
                      }));
                      setUserProfile(prev => ({
                        ...prev!,
                        goals: [...currentGoals, newGoal.trim()]
                      }));
                      setNewGoal("");
                      // Auto-save the new goal
                      saveGoalsToBackend([...currentGoals, newGoal.trim()]);
                    }
                  }}
                  disabled={!newGoal.trim()}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              {/* Goals list */}
              {(!userProfile?.goals || userProfile.goals.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No goals yet. Add your first goal above!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(userProfile?.goals || []).map((goal, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">{goal}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newGoals = userProfile.goals.filter((_, i) => i !== index);
                          setEditedProfile(prev => ({ ...prev!, goals: newGoals }));
                          setUserProfile(prev => ({ ...prev!, goals: newGoals }));
                          // Auto-save the removal
                          saveGoalsToBackend(newGoals);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Suggested goals */}
              {(!userProfile?.goals || userProfile.goals.length < 5) && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Suggested goals:</p>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_GOALS.filter(g => !(userProfile?.goals || []).includes(g)).slice(0, 6).map((goal) => (
                      <Button
                        key={goal}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentGoals = userProfile?.goals || [];
                          const newGoals = [...currentGoals, goal];
                          setEditedProfile(prev => ({ ...prev!, goals: newGoals }));
                          setUserProfile(prev => ({ ...prev!, goals: newGoals }));
                          // Auto-save the goal
                          saveGoalsToBackend(newGoals);
                        }}
                        className="text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {goal}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mood Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Mood Chart</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Your emotional journey over time
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={moodPeriod === "7days" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMoodPeriod("7days")}
                      >
                        7D
                      </Button>
                      <Button
                        variant={moodPeriod === "30days" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMoodPeriod("30days")}
                      >
                        30D
                      </Button>
                      <Button
                        variant={moodPeriod === "90days" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMoodPeriod("90days")}
                      >
                        90D
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {moodChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={moodChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="mood"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      <div className="text-center">
                        <Smile className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No mood data available</p>
                        <p className="text-sm">Start tracking your mood to see insights</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Activity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Breakdown</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your recent therapeutic activities
                  </p>
                </CardHeader>
                <CardContent>
                  {activityChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={activityChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      <div className="text-center">
                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No activity data available</p>
                        <p className="text-sm">Engage with the platform to see activity insights</p>
                      </div>
                    </div>
                  )}
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
                                onClick={async () => {
                                  if (confirm("Are you sure you want to cancel your premium subscription? You'll lose access to premium features at the end of your billing period.")) {
                                    try {
                                      const res = await paystackService.cancelSubscription(user?._id || '');
                                      if (res.success) {
                                        toast.success("Subscription cancelled successfully");
                                        await loadProfileData();
                                      } else {
                                        toast.error(res.error || "Failed to cancel subscription");
                                      }
                                    } catch (error) {
                                      console.error("Error cancelling subscription:", error);
                                      toast.error("Failed to cancel subscription");
                                    }
                                  }
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

