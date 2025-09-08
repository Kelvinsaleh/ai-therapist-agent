"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  MessageCircle, 
  Phone, 
  Heart, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  UserPlus,
  Shield,
  Star,
  Calendar,
  Activity
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { backendService } from "@/lib/api/backend-service";
import { useSession } from "@/lib/hooks/use-session";
import { toast } from "sonner";

interface RescuePair {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAge: number;
  partnerBio: string;
  status: "online" | "away" | "offline" | "busy";
  lastActive: string;
  compatibility: number; // 0-100% match score
  sharedChallenges: string[]; // Common mental health challenges
  complementaryGoals: string[]; // Goals that complement each other
  communicationStyle: "gentle" | "direct" | "supportive";
  experienceLevel: "beginner" | "intermediate" | "experienced";
  trustLevel: number; // Built over time through interactions
  emergencySupport: boolean; // Can provide crisis support
  nextCheckIn: string;
  totalCheckIns: number;
  streak: number;
  matchDate: string;
  safetyScore: number; // 1-10 safety rating
  isVerified: boolean; // Profile verification status
}

export default function RescuePairsPage() {
  const { user, isAuthenticated } = useSession();
  const [selectedPair, setSelectedPair] = useState<RescuePair | null>(null);
  const [showAddPair, setShowAddPair] = useState(false);
  const [pairs, setPairs] = useState<RescuePair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userTier, setUserTier] = useState<"free" | "premium">("free");
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  const defaultPairs: RescuePair[] = [
    { 
      id: "1",
      partnerId: "user_789",
      partnerName: "Alex", 
      partnerAge: 28,
      partnerBio: "Dealing with anxiety and depression. Love hiking and meditation. Looking for someone to share the journey with.",
      status: "online", 
      lastActive: "2 minutes ago",
      compatibility: 92,
      sharedChallenges: ["anxiety", "depression", "sleep issues"],
      complementaryGoals: ["build confidence", "establish routine", "social connection"],
      communicationStyle: "supportive",
      experienceLevel: "intermediate",
      trustLevel: 4,
      emergencySupport: true,
      nextCheckIn: "Tomorrow at 2 PM",
      totalCheckIns: 24,
      streak: 7,
      matchDate: "2024-01-15",
      safetyScore: 9,
      isVerified: true
    },
    { 
      id: "2",
      partnerId: "user_456",
      partnerName: "Riley", 
      partnerAge: 24,
      partnerBio: "Recovering from trauma, working on self-care. Art therapy and journaling help me process emotions.",
      status: "away", 
      lastActive: "1 hour ago",
      compatibility: 87,
      sharedChallenges: ["trauma", "self-care", "emotional regulation"],
      complementaryGoals: ["healing", "creativity", "mindfulness"],
      communicationStyle: "gentle",
      experienceLevel: "experienced",
      trustLevel: 5,
      emergencySupport: true,
      nextCheckIn: "Today at 6 PM",
      totalCheckIns: 18,
      streak: 3,
      matchDate: "2024-01-10",
      safetyScore: 8,
      isVerified: true
    },
    { 
      id: "3",
      partnerId: "user_123",
      partnerName: "Taylor", 
      partnerAge: 31,
      partnerBio: "New to therapy, learning about mental health. Looking for guidance and support from someone who's been there.",
      status: "offline", 
      lastActive: "3 hours ago",
      compatibility: 78,
      sharedChallenges: ["therapy newbie", "mental health awareness"],
      complementaryGoals: ["learning", "support", "growth"],
      communicationStyle: "direct",
      experienceLevel: "beginner",
      trustLevel: 3,
      emergencySupport: false,
      nextCheckIn: "Friday at 10 AM",
      totalCheckIns: 12,
      streak: 1,
      matchDate: "2024-01-05",
      safetyScore: 7,
      isVerified: false
    },
    { 
      id: "4",
      partnerId: "user_999",
      partnerName: "Casey", 
      partnerAge: 26,
      partnerBio: "Managing bipolar disorder, medication compliance, and building healthy relationships. Peer support is crucial for me.",
      status: "busy", 
      lastActive: "30 minutes ago",
      compatibility: 95,
      sharedChallenges: ["bipolar disorder", "medication management", "relationship building"],
      complementaryGoals: ["stability", "medication adherence", "social skills"],
      communicationStyle: "supportive",
      experienceLevel: "experienced",
      trustLevel: 5,
      emergencySupport: true,
      nextCheckIn: "Sunday at 4 PM",
      totalCheckIns: 31,
      streak: 12,
      matchDate: "2023-12-20",
      safetyScore: 10,
      isVerified: true
    },
  ];

  // Check user subscription status
  const checkSubscriptionStatus = async () => {
    if (!isAuthenticated || !user?._id) return;
    
    try {
      setIsLoadingSubscription(true);
      const response = await backendService.getSubscriptionStatus(user._id);
      if (response.success && response.data?.status === 'active') {
        setUserTier("premium");
      } else {
        setUserTier("free");
      }
    } catch (error) {
      console.error("Failed to check subscription status:", error);
      setUserTier("free");
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  // Load rescue pairs from backend (premium only)
  const loadRescuePairs = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    if (userTier === "free") {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await backendService.getRescuePairs();
      if (response.success && response.data) {
        setPairs(response.data);
      } else {
        // Fallback to demo data if backend fails
        setPairs(defaultPairs);
      }
    } catch (error) {
      console.error("Failed to load rescue pairs:", error);
      // Fallback to demo data
      setPairs(defaultPairs);
    } finally {
      setIsLoading(false);
    }
  };

  // Find new AI match (premium only)
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
      // This would call the AI matching service
      const response = await backendService.findMatches({
        userId: user?._id,
        preferences: {
          challenges: [], // Would be loaded from user profile
          goals: [],
          communicationStyle: "supportive",
          experienceLevel: "intermediate"
        }
      });
      
      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Show potential matches
        const matchCount = response.data.length;
        toast.success(`Found ${matchCount} potential matches!`);
        // This would show a match selection modal
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

  // Load subscription status and pairs on component mount
  useEffect(() => {
    if (isAuthenticated) {
      checkSubscriptionStatus();
    }
  }, [isAuthenticated]);

  // Load pairs when subscription status is determined
  useEffect(() => {
    if (!isLoadingSubscription) {
      loadRescuePairs();
    }
  }, [userTier, isLoadingSubscription]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "text-green-500";
      case "away": return "text-yellow-500";
      case "busy": return "text-orange-500";
      case "offline": return "text-gray-500";
      default: return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "away": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "busy": return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "offline": return <Clock className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
      case "family": return <Heart className="w-4 h-4 text-red-500" />;
      case "friend": return <Users className="w-4 h-4 text-blue-500" />;
      case "therapist": return <Shield className="w-4 h-4 text-purple-500" />;
      case "mentor": return <Star className="w-4 h-4 text-yellow-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          AI-Matched Support Partners
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect with peers who understand your journey. Our AI matches you with people facing similar challenges for mutual support and accountability.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{pairs.length}</div>
            <div className="text-sm text-muted-foreground">AI Matches</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{pairs.filter(p => p.status === "online").length}</div>
            <div className="text-sm text-muted-foreground">Online Now</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{Math.round(pairs.reduce((sum, p) => sum + p.compatibility, 0) / pairs.length || 0)}%</div>
            <div className="text-sm text-muted-foreground">Avg Compatibility</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{pairs.filter(p => p.emergencySupport).length}</div>
            <div className="text-sm text-muted-foreground">Crisis Support</div>
          </CardContent>
        </Card>
      </div>

      {/* Find New Match Button */}
      <div className="mb-8">
        <Button
          onClick={userTier === "premium" ? findNewMatch : () => setShowAddPair(true)}
          className="bg-primary/90 hover:bg-primary"
          disabled={!isAuthenticated || isLoading}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {isLoading ? "Finding Matches..." : "Find New AI Match"}
        </Button>
        {userTier === "free" && (
          <div className="mt-2 text-sm text-muted-foreground">
            <span className="text-amber-600">⭐ Premium Feature</span> - Upgrade to access AI-powered peer matching
          </div>
        )}
      </div>

      {/* Premium Upgrade Prompt for Free Users */}
      {userTier === "free" && isAuthenticated && (
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <Star className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Unlock AI-Powered Peer Matching</h3>
            <p className="text-muted-foreground mb-4">
              Connect with people who truly understand your mental health journey. Our AI matches you with peers facing similar challenges.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>AI-powered compatibility matching</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Safety-verified profiles only</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>24/7 crisis support access</span>
              </div>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              Upgrade to Premium - $7.99/month
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Not Authenticated Message */}
      {!isAuthenticated && (
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Sign in to access AI Matching</h3>
            <p className="text-muted-foreground">
              Create an account to find your perfect mental health support partner.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pairs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pairs.map((pair, index) => (
          <motion.div
            key={pair.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => setSelectedPair(pair)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-primary" />
                    {pair.partnerName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(pair.status)}
                    {pair.isVerified && <Shield className="w-4 h-4 text-green-500" />}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{pair.partnerAge} years old</span>
                  <span>•</span>
                  <span className="capitalize">{pair.experienceLevel}</span>
                  {pair.emergencySupport && (
                    <Badge variant="destructive" className="text-xs">Crisis Support</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {pair.compatibility}% match
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Safety: {pair.safetyScore}/10
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground mb-2">
                  <p className="line-clamp-2">{pair.partnerBio}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Shared Challenges:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pair.sharedChallenges.slice(0, 3).map((challenge, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {challenge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-xs">
                    <span className="text-muted-foreground">Communication:</span>
                    <span className="ml-1 capitalize">{pair.communicationStyle}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Active:</span>
                  <span>{pair.lastActive}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Trust Level:</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < pair.trustLevel ? "text-yellow-500 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Streak:</span>
                  <Badge variant="secondary">{pair.streak} days</Badge>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Next Check-in:</span>
                    <span className="font-medium">{pair.nextCheckIn}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pair Details Modal */}
      <AnimatePresence>
        {selectedPair && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPair(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      {selectedPair.partnerName} ({selectedPair.partnerAge})
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedPair(null)}
                    >
                      ×
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusIcon(selectedPair.status)}
                    <span className={`font-medium ${getStatusColor(selectedPair.status)}`}>
                      {selectedPair.status.charAt(0).toUpperCase() + selectedPair.status.slice(1)}
                    </span>
                    <Badge variant="outline">{selectedPair.compatibility}% match</Badge>
                    {selectedPair.emergencySupport && (
                      <Badge variant="destructive">Crisis Support</Badge>
                    )}
                    {selectedPair.isVerified && (
                      <Badge variant="default" className="bg-green-600">Verified</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">About {selectedPair.partnerName}</h4>
                    <p className="text-muted-foreground text-sm">{selectedPair.partnerBio}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Experience Level</h4>
                      <Badge variant="outline" className="capitalize">{selectedPair.experienceLevel}</Badge>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Communication Style</h4>
                      <Badge variant="outline" className="capitalize">{selectedPair.communicationStyle}</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Shared Challenges</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPair.sharedChallenges.map((challenge, i) => (
                        <Badge key={i} variant="secondary">{challenge}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Complementary Goals</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPair.complementaryGoals.map((goal, i) => (
                        <Badge key={i} variant="outline">{goal}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Trust Level</h4>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < selectedPair.trustLevel ? "text-yellow-500 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Safety Score</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{selectedPair.safetyScore}/10</span>
                        <Shield className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Total Check-ins</h4>
                      <div className="text-2xl font-bold text-primary">{selectedPair.totalCheckIns}</div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Current Streak</h4>
                      <div className="text-2xl font-bold text-green-500">{selectedPair.streak} days</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Next Check-in</h4>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedPair.nextCheckIn}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Last Active</h4>
                    <span className="text-muted-foreground">{selectedPair.lastActive}</span>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Pair Modal */}
      <AnimatePresence>
        {showAddPair && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddPair(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Find New AI Match</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowAddPair(false)}
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Find Your Perfect Match</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Our AI will analyze your profile and find someone who shares similar challenges and goals.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Matches based on mental health challenges</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Compatible communication styles</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Safety-verified profiles only</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Complementary goals and experience</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    {userTier === "premium" ? (
                      <>
                        <Button 
                          className="flex-1"
                          onClick={() => {
                            setShowAddPair(false);
                            findNewMatch();
                          }}
                        >
                          Find My Match
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setShowAddPair(false)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          className="flex-1"
                          onClick={() => {
                            setShowAddPair(false);
                            // Redirect to pricing page
                            window.location.href = "/pricing";
                          }}
                        >
                          Upgrade to Premium
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setShowAddPair(false)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


