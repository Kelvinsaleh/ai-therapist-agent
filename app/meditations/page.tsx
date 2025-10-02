"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Headphones, 
  Play, 
  Pause, 
  Volume2, 
  Clock,
  Crown,
  Search,
  Loader2,
  ListPlus,
  PlayCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/hooks/use-session";
import { toast } from "sonner";
import { useAudioPlayer } from "@/lib/contexts/audio-player-context";
import { LoadingDots } from "@/components/ui/loading-dots";
import { PageLoading } from "@/components/ui/page-loading";

interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  audioUrl: string;
  category: string;
  isPremium: boolean;
  tags: string[];
  createdAt: string;
}

export default function MeditationsPage() {
  const { user, isAuthenticated } = useSession();
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPremium, setFilterPremium] = useState<boolean | null>(null);
  const [userTier, setUserTier] = useState<"free" | "premium">("free");
  
  // Use ONLY the global audio player - no local audio state
  const { 
    play, 
    pause, 
    currentTrack, 
    isPlaying, 
    addToPlaylist, 
    playPlaylist,
    togglePlayPause 
  } = useAudioPlayer();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const loadMeditations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/meditations/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          query: searchQuery,
          filterPremium: filterPremium
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMeditations(data.meditations || []);
      } else {
        console.error('Failed to load meditations');
        setMeditations([]);
      }
    } catch (error) {
      console.error('Error loading meditations:', error);
      setMeditations([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filterPremium]);

  useEffect(() => {
    if (isAuthenticated) {
      const checkUserTier = async () => {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUserTier(userData.user?.subscription?.tier || 'free');
          } else {
            setUserTier('free');
          }
        } catch (error) {
          console.error('Error checking user tier:', error);
          setUserTier('free');
        }
      };
      
      checkUserTier();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadMeditations();
  }, [loadMeditations]);

  const handlePlay = async (meditationId: string) => {
    const meditation = meditations.find(m => m.id === meditationId);
    
    if (!meditation) {
      toast.error('Meditation not found');
      return;
    }

    // Check if meditation is premium-only
    if (meditation.isPremium && userTier === "free") {
      toast.error("This meditation is a premium feature. Upgrade to access advanced meditations.");
      return;
    }

    // Check if audio URL is valid
    if (!meditation.audioUrl) {
      toast.error('Audio file not available');
      return;
    }

    // Convert to the format expected by the global audio player
    const meditationForPlayer = {
      _id: meditation.id,
      title: meditation.title,
      audioUrl: meditation.audioUrl,
      category: meditation.category
    };

    // Use the global audio player for background playback
    if (currentTrack?._id === meditation.id) {
      // Same track - toggle play/pause
      togglePlayPause();
    } else {
      // New track - play it (will continue playing when navigating away)
      play(meditationForPlayer);
    }
  };

  const handleAddToPlaylist = (meditation: Meditation) => {
    const meditationForPlayer = {
      _id: meditation.id,
      title: meditation.title,
      audioUrl: meditation.audioUrl,
      category: meditation.category
    };
    
    addToPlaylist(meditationForPlayer);
    toast.success(`Added "${meditation.title}" to playlist`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadMeditations();
  };

  const filteredMeditations = meditations.filter(meditation => {
    const matchesSearch = meditation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meditation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meditation.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meditation.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPremium = filterPremium === null || meditation.isPremium === filterPremium;
    
    return matchesSearch && matchesPremium;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Meditation Library
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover guided meditations to help you find peace, reduce stress, and improve your well-being.
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search meditations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={filterPremium === null ? "default" : "outline"}
                  onClick={() => setFilterPremium(null)}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  type="button"
                  variant={filterPremium === false ? "default" : "outline"}
                  onClick={() => setFilterPremium(false)}
                  size="sm"
                >
                  Free
                </Button>
                <Button
                  type="button"
                  variant={filterPremium === true ? "default" : "outline"}
                  onClick={() => setFilterPremium(true)}
                  size="sm"
                >
                  Premium
                </Button>
              </div>
              <Button type="submit" size="sm">
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <PageLoading 
            message="Loading meditations..." 
            showSkeleton={true}
          />
        )}

        {/* Meditation Cards */}
        {!isLoading && filteredMeditations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredMeditations.map((meditation) => (
                <motion.div
                  key={meditation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Headphones className="w-5 h-5 text-primary" />
                          <CardTitle className="text-lg">{meditation.title}</CardTitle>
                        </div>
                        {meditation.isPremium && (
                          <Crown className="w-5 h-5 text-amber-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {meditation.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {meditation.duration} min
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {meditation.category}
                        </Badge>
                      </div>

                      {meditation.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {meditation.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {meditation.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{meditation.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handlePlay(meditation.id)}
                          className="flex-1"
                          disabled={meditation.isPremium && userTier === "free"}
                        >
                          {currentTrack?._id === meditation.id ? (
                            isPlaying ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Resume
                              </>
                            )
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Play
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddToPlaylist(meditation)}
                          className="gap-2"
                        >
                          <ListPlus className="w-4 h-4" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredMeditations.length === 0 && (
          <div className="text-center py-12">
            <Headphones className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No meditations found</h3>
            <p className="text-gray-500">
              {searchQuery ? "Try adjusting your search terms" : "Check back later for new meditations"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


