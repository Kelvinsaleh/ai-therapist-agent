"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Headphones, 
  Play, 
  Pause, 
  Volume2, 
  Clock,
  Heart,
  Brain,
  Waves,
  Leaf,
  Moon,
  Sun,
  CheckCircle,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/hooks/use-session";
import { toast } from "sonner";
import { getFeatureLimits, checkMeditationLimit } from "@/lib/session-limits";
// Remove static import - we'll fetch from backend instead

export default function MeditationsPage() {
  const { user, isAuthenticated } = useSession();
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<"free" | "premium">("free");
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);

  // Helper function to get icons for categories
  function getIconForCategory(category: string) {
    switch (category) {
      case 'breathing': return Heart;
      case 'relaxation': return Brain;
      case 'sleep': return Moon;
      case 'anxiety': return Waves;
      case 'focus': return Sun;
      default: return Headphones;
    }
  }

  // Helper function to get colors for categories
  function getColorForCategory(category: string) {
    switch (category) {
      case 'breathing': return "from-rose-500/20 to-pink-500/20";
      case 'relaxation': return "from-blue-500/20 to-cyan-500/20";
      case 'sleep': return "from-purple-500/20 to-indigo-500/20";
      case 'anxiety': return "from-teal-500/20 to-blue-500/20";
      case 'focus': return "from-amber-500/20 to-orange-500/20";
      default: return "from-gray-500/20 to-slate-500/20";
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch meditation tracks from backend
  const loadMeditationTracks = async () => {
    setIsLoadingTracks(true);
    try {
      const response = await fetch('/api/meditations');
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Transform backend data to frontend format
        const transformedTracks = result.meditations.map((track: any) => ({
          id: track.id,
          title: track.title,
          duration: track.duration,
          description: track.description,
          icon: getIconForCategory(track.category),
          color: getColorForCategory(track.category),
          category: track.category,
          isPremium: track.isPremium,
          url: track.url
        }));
        setTracks(transformedTracks);
      } else {
        toast.error('Failed to load meditation tracks');
        // Fallback to empty array
        setTracks([]);
      }
    } catch (error) {
      console.error('Error loading meditation tracks:', error);
      toast.error('Failed to load meditation tracks');
      // Fallback to empty array
      setTracks([]);
    } finally {
      setIsLoadingTracks(false);
    }
  };

  // Load meditation session history from backend
  const loadSessionHistory = async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingHistory(true);
    try {
      const { backendService } = await import("@/lib/api/backend-service");
      const response = await backendService.getMeditationSessions();
      if (response.success) {
        setSessionHistory(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load meditation history:", error);
      toast.error("Failed to load meditation history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Complete meditation session
  const completeSession = async (sessionId: string, completionRate: number, moodAfter: number) => {
    try {
      const { backendService } = await import("@/lib/api/backend-service");
      await backendService.updateMeditationSession(sessionId, {
        completionRate,
        moodAfter,
        effectiveness: completionRate > 0.8 ? 0.9 : completionRate > 0.5 ? 0.7 : 0.5,
        completedAt: new Date()
      });
      
      // Reload history to show updated session
      await loadSessionHistory();
      toast.success("Meditation session completed!");
    } catch (error) {
      console.error("Failed to complete meditation session:", error);
      toast.error("Failed to save meditation completion");
    }
  };

  // Load history on component mount
  useEffect(() => {
    loadMeditationTracks();
    loadSessionHistory();
  }, [isAuthenticated]);

  const handlePlay = async (trackId: string) => {
    // Check meditation limits for free users
    if (userTier === "free") {
      const currentSessionsThisWeek = sessionHistory.filter(session => {
        const sessionDate = new Date(session.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sessionDate >= weekAgo;
      }).length;
      
      const limitCheck = checkMeditationLimit(userTier, currentSessionsThisWeek);
      
      if (!limitCheck.canStart) {
        toast.error(limitCheck.reason);
        return;
      }
    }

    // Check if track is premium-only
    const track = tracks.find(t => t.id === trackId);
    const featureLimits = getFeatureLimits(userTier);
    
    if (track && track.isPremium && userTier === "free") {
      toast.error("This meditation is a premium feature. Upgrade to access advanced meditations.");
      return;
    }

    if (currentTrack === trackId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(trackId);
      setIsPlaying(true);
      setCurrentTime(0);
      
      if (isAuthenticated) {
        // Add meditation session to memory system
        try {
          const { userMemoryManager } = await import("@/lib/memory/user-memory");
          const track = tracks.find(t => t.id === trackId);
          if (track) {
            await userMemoryManager.addMeditationSession({
              date: new Date(),
              type: track.title,
              duration: track.duration,
              completionRate: 0, // Will be updated when session ends
              moodBefore: 3, // Default mood, could be enhanced with actual mood tracking
              moodAfter: 3,
              effectiveness: 0.7 // Default effectiveness
            });
          }
        } catch (error) {
          console.error("Failed to add meditation session to memory:", error);
        }

        // Save meditation session to backend
        try {
          const { backendService } = await import("@/lib/api/backend-service");
          const track = tracks.find(t => t.id === trackId);
          if (track) {
            const response = await backendService.createMeditationSession({
              type: track.title,
              duration: track.duration,
              startedAt: new Date(),
              completionRate: 0,
              moodBefore: 3,
              moodAfter: 3,
              effectiveness: 0.7,
              userId: user?._id
            });
            
            if (response.success && response.data?.id) {
              setCurrentSessionId(response.data.id);
            }
          }
        } catch (error) {
          console.error("Failed to save meditation session to backend:", error);
          toast.error("Failed to start meditation session");
        }
      }
    }
  };

  const handleCompleteSession = async () => {
    if (!currentSessionId || !selectedTrack) return;
    
    const completionRate = currentTime / selectedTrack.duration;
    const moodAfter = 4; // Could be enhanced with actual mood tracking
    
    await completeSession(currentSessionId, completionRate, moodAfter);
    
    // Reset session state
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentSessionId(null);
  };

  const selectedTrack = tracks.find(t => t.id === currentTrack);

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Guided Meditations
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find peace and clarity through our collection of guided meditation sessions
        </p>
      </div>

      {/* Current Playing Track */}
      <AnimatePresence>
        {selectedTrack && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${selectedTrack.color} flex items-center justify-center`}>
                      <selectedTrack.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{selectedTrack.title}</h3>
                      <p className="text-muted-foreground">{selectedTrack.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-muted-foreground">
                          {formatTime(currentTime)} / {formatTime(selectedTrack.duration)}
                        </span>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                          {selectedTrack.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePlay(selectedTrack.id)}
                      className="w-12 h-12 rounded-full"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </Button>
                    {currentSessionId && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleCompleteSession}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCurrentTrack(null);
                        setCurrentSessionId(null);
                        setIsPlaying(false);
                        setCurrentTime(0);
                      }}
                    >
                      <Volume2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meditation Library */}
      {isLoadingTracks ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${track.color} flex items-center justify-center`}>
                    <track.icon className="w-6 h-6 text-primary" />
                  </div>
                  {/* Premium Badge */}
                  {track.isPremium && userTier === "free" && (
                    <Badge variant="secondary" className="text-xs">
                      Premium
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePlay(track.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {currentTrack === track.id && isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <CardTitle className="text-lg">{track.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{track.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {formatTime(track.duration)}
                  </div>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                    {track.category}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        </div>
      )}

      {/* Categories */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-6 text-center">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Relaxation", "Mindfulness", "Compassion", "Nature", "Sleep"].map((category) => (
            <Button
              key={category}
              variant="outline"
              className="h-16 flex flex-col gap-1 hover:bg-primary/10"
            >
              <span className="text-sm font-medium">{category}</span>
              <span className="text-xs text-muted-foreground">
                {isLoadingTracks ? '...' : tracks.filter(t => t.category === category).length} sessions
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Session History */}
      {isAuthenticated && (
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <History className="w-6 h-6" />
              Your Meditation History
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSessionHistory}
              disabled={isLoadingHistory}
            >
              {isLoadingHistory ? "Loading..." : "Refresh"}
            </Button>
          </div>
          
          {sessionHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessionHistory.slice(0, 6).map((session, index) => (
                <motion.div
                  key={session.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">{session.type}</h3>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {Math.round((session.completionRate || 0) * 100)}% complete
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Clock className="w-3 h-3" />
                        {formatTime(session.duration || 0)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Mood: {session.moodAfter || session.moodBefore || 'N/A'}</span>
                        <span>•</span>
                        <span>{new Date(session.startedAt || session.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No meditation sessions yet</h3>
              <p className="text-muted-foreground">
                Start your first meditation session to see your progress here.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}


