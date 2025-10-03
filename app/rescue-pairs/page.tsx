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
  Filter,
  Video,
  CheckCircle,
  Lock,
  AlertTriangle,
  Star,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  rescuePairsProductionConfig, 
  logRescuePairsEvent, 
  retryRescuePairsOperation,
  RescuePairsError,
  checkSpecialAccess,
  canAccessFeature
} from "@/lib/rescue-pairs/production-config";

interface RescuePair {
  id: string;
  _id?: string;
  partnerId: string;
  partnerName: string;
  partnerAge: number;
  partnerBio: string;
  status: "online" | "offline" | "away" | "active" | "pending" | "rejected";
  lastActive: string;
  compatibility: number;
  compatibilityScore?: number;
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
  user1Id?: any;
  user2Id?: any;
  createdAt?: string;
  acceptedAt?: string;
  // New anonymous matching fields
  isAnonymous: boolean;
  anonymousId?: string;
  revealIdentity?: boolean;
  chatEnabled: boolean;
  lastMessage?: string;
  unreadCount?: number;
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
  const [filter, setFilter] = useState<"all" | "online" | "verified" | "anonymous">("all");
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [anonymousPreference, setAnonymousPreference] = useState<"anonymous" | "revealed" | "both">("both");
  const [showAnonymousSettings, setShowAnonymousSettings] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadRescuePairs();
    }
  }, [isAuthenticated]);

  const loadRescuePairs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await backendService.getRescuePairList();

      if (response && response.success && response.data && Array.isArray(response.data)) {
        const transformedPairs = response.data.map((pair: any) => {
          // The backend populates user1Id and user2Id with full user objects
          const isUser1 = pair.user1Id?._id === user?._id || pair.user1Id?.id === user?.id;
          const partner = isUser1 ? pair.user2Id : pair.user1Id;
          
          return {
            id: pair._id,
            _id: pair._id,
            partnerId: partner?._id || partner?.id || 'unknown',
            partnerName: pair.isAnonymous ? `Support Partner ${pair.anonymousId?.slice(-4) || '****'}` : (partner?.name || "Anonymous User"),
            partnerAge: 25, // Default age since not in user model
            partnerBio: pair.isAnonymous ? "A supportive partner who shares similar experiences and is here to help" : "Someone who understands your journey and is here to provide mutual support",
            status: pair.status,
            lastActive: pair.acceptedAt ? new Date(pair.acceptedAt).toLocaleDateString() : "Recently",
            compatibility: pair.compatibilityScore || 85,
            sharedChallenges: pair.sharedChallenges || ["Anxiety", "Stress Management"],
            complementaryGoals: pair.complementaryGoals || ["Mindfulness", "Better Sleep"],
            communicationStyle: pair.communicationStyle || "supportive",
            experienceLevel: pair.experienceLevel || "intermediate",
            trustLevel: pair.trustLevel || 9,
            emergencySupport: pair.emergencySupport || true,
            nextCheckIn: pair.nextCheckIn ? new Date(pair.nextCheckIn).toLocaleDateString() : (userTier === "premium" ? "Tomorrow" : "Next Week"),
            totalCheckIns: pair.totalCheckIns || 5,
            streak: pair.streak || 3,
            matchDate: pair.matchDate ? new Date(pair.matchDate).toLocaleDateString() : "Recently",
            safetyScore: pair.safetyScore || 10,
            isVerified: pair.isVerified || true,
            user1Id: pair.user1Id,
            user2Id: pair.user2Id,
            createdAt: pair.createdAt,
            acceptedAt: pair.acceptedAt,
            // Anonymous matching fields
            isAnonymous: pair.isAnonymous || false,
            anonymousId: pair.anonymousId,
            revealIdentity: pair.revealIdentity || false,
            chatEnabled: pair.chatEnabled !== false, // Default to true
            lastMessage: pair.lastMessage,
            unreadCount: pair.unreadCount || 0
          };
        });
        
        setPairs(transformedPairs);
      } else {
        // If no pairs, show empty state
        setPairs([]);
      }
    } catch (error) {
      console.error("Failed to load rescue pairs:", error);
      setError(error instanceof Error ? error.message : "Failed to load rescue pairs");
      toast.error("Failed to load rescue pairs");
    } finally {
      setIsLoading(false);
    }
  };

  // Create a basic profile for rescue pair matching
  const createBasicProfile = async () => {
    try {
      const profileData = {
        bio: "Looking for mental health support and to help others on similar journeys",
        age: 25,
        challenges: ["anxiety", "stress"],
        goals: ["mindfulness", "better-sleep", "emotional-regulation"],
        communicationStyle: "supportive",
        experienceLevel: "intermediate",
        interests: ["meditation", "reading", "exercise"],
        availability: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          preferredTimes: ["evening"],
          daysAvailable: ["monday", "tuesday", "wednesday", "thursday", "friday"]
        },
        matchingPreferences: {
          ageRange: { min: 18, max: 65 },
          challenges: ["anxiety", "stress", "depression"],
          goals: ["mindfulness", "better-sleep", "emotional-regulation"],
          communicationStyle: ["supportive", "gentle"],
          experienceLevel: ["beginner", "intermediate", "experienced"]
        },
        safetySettings: {
          allowEmergencySupport: true,
          requireVerification: true,
          maxDistance: 0
        },
        isVerified: true,
        status: "online"
      };

      const response = await backendService.createUserProfile(profileData);
      
      if (response.success) {
        toast.success("Profile created! You can now find support matches.");
        setShowProfileSetup(false);
        // Try to find matches after profile creation
        setTimeout(() => {
          findNewMatch();
        }, 1000);
      } else {
        toast.error("Failed to create profile. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create profile:", error);
      toast.error("Failed to create profile. Please try again.");
    }
  };

  const findNewMatch = async (isAnonymous: boolean = false) => {
    // Check access permissions
    const hasSpecialAccess = user?.email ? checkSpecialAccess(user.email) : false;
    const canFindMatches = hasSpecialAccess || canAccessFeature('unlimitedMatches', user?.email, userTier);
    
    if (!canFindMatches) {
      toast.error("Premium matching is available with Premium Plan. Upgrade for unlimited matches!");
      logRescuePairsEvent('access_denied', { 
        userTier, 
        hasSpecialAccess, 
        feature: 'unlimitedMatches' 
      }, 'warn', user?._id);
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to find matches");
      return;
    }

    // Check anonymous matching access
    if (isAnonymous && !hasSpecialAccess && !canAccessFeature('anonymousMatching', user?.email, userTier)) {
      toast.error("Anonymous matching is a premium feature. Upgrade to access!");
      return;
    }

    try {
      setIsLoading(true);
      
      logRescuePairsEvent('find_matches_started', {
        isAnonymous,
        preference: anonymousPreference,
        userTier,
        hasSpecialAccess
      }, 'info', user?._id);
      
      // Use retry mechanism for production reliability
      const response = await retryRescuePairsOperation(async () => {
        return await backendService.findMatches({
          anonymous: isAnonymous,
          preference: anonymousPreference
        });
      });
      
      if (response.success && response.data) {
        const matches = response.data.matches || [];
        if (Array.isArray(matches) && matches.length > 0) {
          const matchCount = matches.length;
          const matchType = isAnonymous ? "anonymous" : "revealed";
          
          logRescuePairsEvent('matches_found', {
            count: matchCount,
            type: matchType,
            isAnonymous
          }, 'info', user?._id);
          
          toast.success(`Found ${matchCount} potential ${matchType} support matches! 🤝`);
          
          // Create rescue pairs for the matches found
          const maxMatches = hasSpecialAccess ? 10 : 3; // Special access gets more matches
          for (const match of matches.slice(0, maxMatches)) {
            try {
              await retryRescuePairsOperation(async () => {
                return await backendService.createRescuePair({
                  targetUserId: match.userId?._id || match.userId?.id || match._id,
                  isAnonymous: isAnonymous,
                  anonymousId: isAnonymous ? `anon_${Date.now()}_${Math.random().toString(36).substr(2, rescuePairsProductionConfig.anonymousMatching.anonymousIdLength)}` : undefined
                });
              });
            } catch (createError) {
              logRescuePairsEvent('pair_creation_failed', {
                error: createError instanceof Error ? createError.message : 'Unknown error',
                matchId: match._id
              }, 'error', user?._id);
              // Continue with other matches even if one fails
            }
          }
          
          // Reload pairs to show new matches
          setTimeout(() => {
            loadRescuePairs();
          }, 1000);
        } else {
          logRescuePairsEvent('no_matches_found', { isAnonymous }, 'info', user?._id);
          toast.info("No matches found right now. Our AI is continuously looking for compatible support partners!");
        }
      } else {
        // Check if the error is due to missing profile
        if (response.error?.includes("profile not found") || response.error?.includes("complete your profile")) {
          toast.info("Let's set up your profile first to find compatible matches!");
          setShowProfileSetup(true);
        } else {
          toast.info("No compatible matches found at the moment. Try again later!");
        }
      }
    } catch (error) {
      const rescuePairsError = error instanceof RescuePairsError ? error : new RescuePairsError(
        error instanceof Error ? error.message : 'Unknown error',
        'FIND_MATCHES_FAILED',
        500,
        { isAnonymous, userTier }
      );
      
      logRescuePairsEvent('find_matches_failed', {
        error: rescuePairsError.message,
        code: rescuePairsError.code,
        isAnonymous
      }, 'error', user?._id);
      
      const errorMessage = error instanceof Error ? error.message : '';
      
      if (errorMessage.includes("profile not found") || errorMessage.includes("complete your profile")) {
        toast.info("Let's set up your profile first to find compatible matches!");
        setShowProfileSetup(true);
      } else {
        toast.error("Failed to find matches. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const acceptMatch = async (pairId: string) => {
    try {
      const response = await backendService.acceptMatch(pairId);
      
      if (response.success) {
        toast.success("🎉 Match accepted! You can now start supporting each other.");
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
        toast.success("Match respectfully declined.");
        loadRescuePairs();
      } else {
        throw new Error(response.error || "Failed to reject match");
      }
    } catch (error) {
      console.error("Failed to reject match:", error);
      toast.error("Failed to reject match. Please try again.");
    }
  };

  const revealIdentity = async (pairId: string) => {
    try {
      const response = await backendService.revealIdentity(pairId);
      
      if (response.success) {
        toast.success("Identity revealed! Your partner can now see your name and profile.");
        loadRescuePairs();
      } else {
        throw new Error(response.error || "Failed to reveal identity");
      }
    } catch (error) {
      console.error("Failed to reveal identity:", error);
      toast.error("Failed to reveal identity. Please try again.");
    }
  };

  const enableChat = async (pairId: string) => {
    try {
      const response = await backendService.enableChat(pairId);
      
      if (response.success) {
        toast.success("Chat enabled! You can now communicate with your support partner.");
        loadRescuePairs();
      } else {
        throw new Error(response.error || "Failed to enable chat");
      }
    } catch (error) {
      console.error("Failed to enable chat:", error);
      toast.error("Failed to enable chat. Please try again.");
    }
  };

  const filteredPairs = pairs.filter(pair => {
    const matchesSearch = pair.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pair.partnerBio.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === "all" || 
                         (filter === "online" && pair.status === "active") ||
                         (filter === "verified" && pair.isVerified) ||
                         (filter === "anonymous" && pair.isAnonymous);
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "ended":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <Users className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sign in to find your support match</h2>
            <p className="text-muted-foreground">
              Connect with others who understand your journey and can provide mutual support.
            </p>
          </div>
          <Button onClick={() => router.push("/login")} className="w-full">
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              Rescue Pairs
            </h1>
            <p className="text-muted-foreground mt-1">
              Connect with others on similar mental health journeys for mutual support
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={
              userTier === "special" ? "default" : 
              userTier === "premium" ? "default" : "secondary"
            } className={`text-sm ${
              userTier === "special" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : ""
            }`}>
              {userTier === "special" ? (
                <>
                  <Star className="w-3 h-3 mr-1" />
                  Special Access
                </>
              ) : (
                <>
                  <Crown className="w-3 h-3 mr-1" />
                  {userTier === "premium" ? "Premium Plan" : "Free Plan"}
                </>
              )}
            </Badge>
            
            {(userTier === "premium" || userTier === "special") && (
              <Button
                variant="outline"
                onClick={() => setShowAnonymousSettings(true)}
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Anonymous Settings
              </Button>
            )}
            
            <Button
              onClick={(userTier === "premium" || userTier === "special") ? () => findNewMatch(false) : () => router.push("/pricing")}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (userTier === "premium" || userTier === "special") ? (
                <Plus className="w-4 h-4" />
              ) : (
                <Crown className="w-4 h-4" />
              )}
              {(userTier === "premium" || userTier === "special") ? "Find Match" : "Upgrade for Unlimited"}
            </Button>
            
            {(userTier === "premium" || userTier === "special") && (
              <Button
                variant="outline"
                onClick={() => findNewMatch(true)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Anonymous Match
              </Button>
            )}
          </div>
        </div>

        {/* Plan Comparison */}
        <div className={`grid grid-cols-1 ${userTier === "special" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-6 mb-8`}>
          {/* Free Plan */}
          <Card className="border-2 border-muted">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge variant="secondary">Free Plan</Badge>
                <span className="text-sm text-muted-foreground">Current</span>
              </div>
              <CardTitle className="text-lg">Basic Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>1 active match</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Basic text chat</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Weekly check-ins</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Community support groups</span>
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-primary bg-primary/5">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge className="bg-primary">Premium Plan</Badge>
                <Crown className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-lg">Advanced Support</CardTitle>
              <div className="text-2xl font-bold text-primary">$7.99<span className="text-sm font-normal">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-primary" />
                <span>Unlimited matches</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Video className="w-4 h-4 text-primary" />
                <span>Video calls (coming soon)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Filter className="w-4 h-4 text-primary" />
                <span>Advanced matching filters</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-primary" />
                <span>Priority matching</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Heart className="w-4 h-4 text-primary" />
                <span>Weekly check-ins</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-primary" />
                <span>Enhanced crisis support</span>
              </div>
              {userTier === "free" && (
                <Button className="w-full mt-4" onClick={() => router.push("/pricing")}>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Special Access Plan */}
          {userTier === "special" && (
            <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Special Access</Badge>
                  <Star className="w-4 h-4 text-purple-500" />
                </div>
                <CardTitle className="text-lg">VIP Support</CardTitle>
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Unlimited Everything
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-purple-500" />
                  <span>Unlimited anonymous matches</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Video className="w-4 h-4 text-purple-500" />
                  <span>Video calls (coming soon)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Filter className="w-4 h-4 text-purple-500" />
                  <span>Advanced matching filters</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span>Priority matching</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="w-4 h-4 text-purple-500" />
                  <span>Daily check-ins</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-purple-500" />
                  <span>Enhanced crisis support</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span>Full anonymity control</span>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mt-4">
                  <p className="text-xs text-purple-800 dark:text-purple-200 text-center font-medium">
                    🎉 You have special access to all features!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Safety & Privacy Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Safety & Privacy
              </CardTitle>
              <p className="text-sm text-muted-foreground">Your Safety is Our Priority</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>All profiles are verified and safety-checked</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>AI content moderation for all messages</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Easy report and block functionality</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Emergency escalation to crisis support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Session time limits for healthy boundaries</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-500" />
                Privacy Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>End-to-end encrypted messaging</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>No personal data shared without consent</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>Anonymous matching options available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>GDPR compliant data handling</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>You control what information to share</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Upgrade CTA for Free Users */}
        {userTier === "free" && (
          <Card className="border-primary/20 bg-primary/5 mb-8">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Unlock Unlimited Support Matching</h3>
              <p className="text-muted-foreground mb-4">
                Get unlimited matches, advanced filters, weekly check-ins, and enhanced crisis support
              </p>
              <div className="flex items-center justify-center gap-6 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  <span>Unlimited matches</span>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <span>Advanced filters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  <span>Weekly check-ins</span>
                </div>
              </div>
              <Button 
                onClick={() => router.push("/pricing")}
                className="w-full max-w-sm"
                size="lg"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium - $7.99/month
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search support partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {["all", "online", "verified", "anonymous"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f as typeof filter)}
                className="capitalize"
              >
                {f === "anonymous" ? (
                  <>
                    <Shield className="w-3 h-3 mr-1" />
                    Anonymous
                  </>
                ) : (
                  f
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Finding your support matches...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Error loading support matches</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadRescuePairs}>
                Try Again
              </Button>
            </div>
          </div>
        ) : filteredPairs.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">No support matches yet</h2>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "No matches found for your search" : "Start by finding your first support partner"}
            </p>
            <div className="space-y-2">
              <Button onClick={userTier === "premium" ? findNewMatch : () => router.push("/pricing")} disabled={isLoading}>
                <Crown className="w-4 h-4 mr-2" />
                {userTier === "premium" ? "Find Your First Match" : "Upgrade to Find Matches"}
              </Button>
              {userTier === "free" && (
                <p className="text-sm text-muted-foreground">
                  Premium members get unlimited matches and advanced features
                </p>
              )}
            </div>
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
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {pair.partnerName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{pair.partnerName}</h3>
                          <p className="text-sm text-muted-foreground">Support Partner</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`text-xs ${getStatusColor(pair.status)}`}>
                          {pair.status}
                        </Badge>
                        {pair.isAnonymous && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            <Shield className="w-3 h-3 mr-1" />
                            Anonymous
                          </Badge>
                        )}
                        {pair.isVerified && !pair.isAnonymous && (
                          <Badge variant="outline" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {pair.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {pair.unreadCount} new
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

                    <div className="flex flex-wrap gap-1">
                      {pair.sharedChallenges.slice(0, 2).map((challenge, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {challenge}
                        </Badge>
                      ))}
                    </div>
                
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{pair.nextCheckIn}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{pair.streak} day streak</span>
                      </div>
                    </div>
                
                    <div className="flex gap-2">
                      {pair.status === "active" ? (
                        <>
                          {pair.chatEnabled ? (
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/matching/chat/${pair.id}`);
                              }}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              {pair.unreadCount > 0 ? `Chat (${pair.unreadCount})` : "Chat"}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                enableChat(pair.id);
                              }}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Enable Chat
                            </Button>
                          )}
                          
                          {pair.isAnonymous && !pair.revealIdentity && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                revealIdentity(pair.id);
                              }}
                            >
                              <Shield className="w-4 h-4 mr-1" />
                              Reveal
                            </Button>
                          )}
                          
                          {(userTier === "premium" || userTier === "special") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info("Video call feature coming soon!");
                              }}
                            >
                              <Video className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      ) : pair.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              acceptMatch(pair.id);
                            }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              rejectMatch(pair.id);
                            }}
                          >
                            Pass
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPair(pair);
                          }}
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Profile Setup Modal */}
        {showProfileSetup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Set Up Your Support Profile
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  We'll create a basic profile to help you find compatible support matches.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Mental health challenges: Anxiety, Stress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Goals: Mindfulness, Better Sleep</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Communication: Supportive style</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Safety: Verified profile with emergency support</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={createBasicProfile} 
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Profile"
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowProfileSetup(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Anonymous Settings Modal */}
        {showAnonymousSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Anonymous Matching Settings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose your privacy preferences for support matching.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Matching Preference</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="anonymousPreference"
                          value="anonymous"
                          checked={anonymousPreference === "anonymous"}
                          onChange={(e) => setAnonymousPreference(e.target.value as any)}
                          className="text-primary"
                        />
                        <span className="text-sm">Anonymous matches only</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="anonymousPreference"
                          value="revealed"
                          checked={anonymousPreference === "revealed"}
                          onChange={(e) => setAnonymousPreference(e.target.value as any)}
                          className="text-primary"
                        />
                        <span className="text-sm">Revealed identity matches only</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="anonymousPreference"
                          value="both"
                          checked={anonymousPreference === "both"}
                          onChange={(e) => setAnonymousPreference(e.target.value as any)}
                          className="text-primary"
                        />
                        <span className="text-sm">Both anonymous and revealed matches</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800 dark:text-blue-400">Anonymous Matching</p>
                        <p className="text-blue-700 dark:text-blue-300">
                          Your identity remains hidden until you choose to reveal it. You can communicate safely while maintaining privacy.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowAnonymousSettings(false)}
                    className="flex-1"
                  >
                    Save Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAnonymousSettings(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}


