"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/contexts/session-context";
import { backendService } from "@/lib/api/backend-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Heart, 
  MessageSquare, 
  Clock, 
  Shield, 
  Crown,
  Loader2,
  AlertCircle,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface RescuePair {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAge: number;
  partnerBio: string;
  status: "online" | "offline" | "away";
  lastActive: string;
  compatibility: number;
  sharedChallenges: string[];
  complementaryGoals: string[];
  communicationStyle: "gentle" | "direct" | "supportive";
  experienceLevel: "beginner" | "intermediate" | "experienced";
  trustLevel: number;
  emergencySupport: boolean;
  nextCheckIn: string;
  totalCheckIns: number;
  streak: number;
  matchDate: string;
  safetyScore: number;
  isVerified: boolean;
}

export default function RescuePairsPage() {
  const { user, isAuthenticated, userTier } = useSession();
  const router = useRouter();
  const [selectedPair, setSelectedPair] = useState<RescuePair | null>(null);
  const [showAddPair, setShowAddPair] = useState(false);
  const [pairs, setPairs] = useState<RescuePair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "verified">("all");

  useEffect(() => {
    if (isAuthenticated) {
      loadRescuePairs();
    }
  }, [isAuthenticated]);

  const loadRescuePairs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await backendService.getRescuePairs();
      
      if (response.success && response.data) {
        setPairs(response.data);
      } else {
        throw new Error(response.error || "Failed to load rescue pairs");
      }
    } catch (error) {
      console.error("Failed to load rescue pairs:", error);
      setError(error instanceof Error ? error.message : "Failed to load rescue pairs");
      toast.error("Failed to load rescue pairs");
    } finally {
      setIsLoading(false);
    }
  };

  const findNewMatch = async () => {
    if (userTier === "free") {
      toast.error("AI Matching is a premium feature. Upgrade to find your perfect match!");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to find matches");
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await backendService.findMatches({
        userId: user?._id || user?.id,
        preferences: {
          challenges: [],
          goals: [],
          communicationStyle: "supportive",
          experienceLevel: "intermediate"
        }
      });
      
      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        const matchCount = response.data.length;
        toast.success(`Found ${matchCount} potential matches!`);
        // Reload pairs to show new matches
        loadRescuePairs();
      } else {
        toast.info("No matches found at the moment. Try again later!");
      }
    } catch (error) {
      console.error("Failed to find matches:", error);
      toast.error("Failed to find matches. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const acceptMatch = async (pairId: string) => {
    try {
      const response = await backendService.acceptMatch(pairId);
      
      if (response.success) {
        toast.success("Match accepted! You can now start chatting.");
      loadRescuePairs();
      } else {
        throw new Error(response.error || "Failed to accept match");
      }
    } catch (error) {
      console.error("Failed to accept match:", error);
      toast.error("Failed to accept match. Please try again.");
    }
  };

  const rejectMatch = async (pairId: string) => {
    try {
      const response = await backendService.rejectMatch(pairId);
      
      if (response.success) {
        toast.success("Match rejected.");
        loadRescuePairs();
      } else {
        throw new Error(response.error || "Failed to reject match");
      }
    } catch (error) {
      console.error("Failed to reject match:", error);
      toast.error("Failed to reject match. Please try again.");
    }
  };

  const filteredPairs = pairs.filter(pair => {
    const matchesSearch = pair.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pair.partnerBio.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === "all" || 
                         (filter === "online" && pair.status === "online") ||
                         (filter === "verified" && pair.isVerified);
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "away":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "offline":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view rescue pairs</h2>
          <Button onClick={() => router.push("/login")}>
            Sign In
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
              Rescue Pairs
        </h1>
            <p className="text-muted-foreground mt-1">
              Connect with others on similar mental health journeys
        </p>
      </div>
          <div className="flex items-center gap-3">
            <Badge variant={userTier === "premium" ? "default" : "secondary"} className="text-sm">
              <Crown className="w-3 h-3 mr-1" />
              {userTier === "premium" ? "Premium" : "Free"} Plan
            </Badge>
            <Button
              onClick={findNewMatch}
              disabled={isLoading || userTier === "free"}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Find Match
            </Button>
          </div>
      </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {["all", "online", "verified"].map((f) => (
        <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f as typeof filter)}
                className="capitalize"
              >
                {f}
        </Button>
            ))}
          </div>
      </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading rescue pairs...</span>
              </div>
              </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Error loading rescue pairs</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadRescuePairs}>
                Try Again
              </Button>
              </div>
            </div>
        ) : filteredPairs.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">No rescue pairs found</h2>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "No pairs match your search criteria" : "Start by finding your first match"}
            </p>
            {userTier === "premium" && (
              <Button onClick={findNewMatch}>
                Find Your First Match
            </Button>
            )}
          </div>
        ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPairs.map((pair) => (
          <motion.div
            key={pair.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedPair(pair)}>
                  <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={`/avatars/${pair.partnerId}.jpg`} />
                          <AvatarFallback>
                            {pair.partnerName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{pair.partnerName}</h3>
                          <p className="text-sm text-muted-foreground">Age {pair.partnerAge}</p>
                  </div>
                </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`text-xs ${getStatusColor(pair.status)}`}>
                          {pair.status}
                        </Badge>
                        {pair.isVerified && (
                          <Badge variant="outline" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                  )}
                </div>
                </div>
              </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {pair.partnerBio}
                    </p>
                
                <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Compatibility</span>
                        <span className="text-sm text-primary font-semibold">{pair.compatibility}%</span>
                    </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${pair.compatibility}%` }}
                        />
                  </div>
                </div>
                
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                  <span>{pair.lastActive}</span>
                </div>
                  <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{pair.streak} day streak</span>
                  </div>
                </div>
                
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/matching/chat/${pair.id}`);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPair(pair);
                        }}
                      >
                        View
                      </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
                    )}
                  </div>
    </div>
  );
}


