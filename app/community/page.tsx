'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, MessageSquare, Leaf, Users, Plus, Sparkles, Lock, TrendingUp, Clock, Award } from 'lucide-react';
import { CommunityChallenges } from '@/components/community/community-challenges';
import { CommunityPrompts } from '@/components/community/community-prompts';
import { PremiumUpgradeModal } from '@/components/community/premium-upgrade-modal';
import { PostComments } from '@/components/community/post-comments';
import { useSession } from '@/lib/contexts/session-context';
import { toast } from 'sonner';

interface CommunitySpace {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  memberCount?: number;
  postCount?: number;
  latestPost?: {
    content: string;
    username: string;
    createdAt: string;
  };
}

interface CommunityPost {
  _id: string;
  userId: {
    _id: string;
    username: string;
  };
  spaceId: string;
  content: string;
  mood?: string;
  isAnonymous: boolean;
  reactions: {
    heart: string[];
    support: string[];
    growth: string[];
  };
  comments: any[];
  aiReflection?: string;
  createdAt: string;
}

interface CommunityStats {
  totalPosts: number;
  totalComments: number;
  activeUsers: number;
  totalSpaces: number;
}

interface DailyQuote {
  quote: string;
  author: string;
}

const quotes: DailyQuote[] = [
  { quote: "Peace begins with acceptance.", author: "Anonymous" },
  { quote: "You don't have to be perfect to be loved.", author: "Brené Brown" },
  { quote: "The only way out is through.", author: "Robert Frost" },
  { quote: "Small steps forward are still progress.", author: "Anonymous" },
  { quote: "Your feelings are valid.", author: "Anonymous" }
];

export default function CommunityPageEnhanced() {
  const { isAuthenticated, userTier } = useSession();
  const [spaces, setSpaces] = useState<CommunitySpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    mood: '',
    isAnonymous: false
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [dailyQuote, setDailyQuote] = useState<DailyQuote>(quotes[0]);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCommunityData();
    // Set daily quote
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyQuote(quotes[dayOfYear % quotes.length]);
  }, []);

  useEffect(() => {
    if (selectedSpace) {
      loadSpacePosts(selectedSpace);
    }
  }, [selectedSpace]);

  const loadCommunityData = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const [spacesRes, statsRes] = await Promise.all([
        fetch('/api/community/spaces', { headers }),
        fetch('/api/community/stats', { headers })
      ]);

      const spacesData = await spacesRes.json();
      const statsData = await statsRes.json();

      if (spacesData.success) {
        setSpaces(spacesData.spaces || []);
        if (spacesData.spaces && spacesData.spaces.length > 0) {
          setSelectedSpace(spacesData.spaces[0]._id);
        }
      }

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSpacePosts = async (spaceId: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/community/spaces/${spaceId}/posts`, { headers });
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    if (!selectedSpace) {
      toast.error('Please select a community space first');
      return;
    }

    if (userTier === 'free') {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          spaceId: selectedSpace,
          content: newPost.content,
          mood: newPost.mood || undefined,
          isAnonymous: newPost.isAnonymous
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Post created successfully!');
        setNewPost({ content: '', mood: '', isAnonymous: false });
        setShowCreatePost(false);
        loadSpacePosts(selectedSpace);
      } else {
        toast.error(data.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reactionType })
      });

      const data = await response.json();

      if (data.success) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId 
              ? { ...post, reactions: data.reactions }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  };

  const getReactionCount = (reactions: any, type: string) => {
    return reactions[type]?.length || 0;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getMoodEmoji = (mood?: string) => {
    const moodMap: Record<string, string> = {
      grateful: '🙏',
      hopeful: '✨',
      calm: '🕊️',
      proud: '🌟',
      peaceful: '🌙',
      motivated: '🚀',
      anxious: '😰',
      sad: '😔',
      happy: '😊',
      excited: '🎉'
    };
    return moodMap[mood || 'calm'] || '💭';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedSpaceData = spaces.find(s => s._id === selectedSpace);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-4">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header with Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
            Community Support 🌿
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Connect, share, and grow together in a safe, supportive space
          </p>
          
          {/* Daily Quote */}
          <Card className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 border-2 border-purple-200 dark:border-purple-800 max-w-2xl mx-auto">
            <CardContent className="pt-4">
              <p className="text-lg italic text-purple-900 dark:text-purple-100 mb-1">
                "{dailyQuote.quote}"
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300">— {dailyQuote.author}</p>
            </CardContent>
          </Card>
          
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-4">
              <Card className="bg-white/70 backdrop-blur-sm border-2 border-blue-200 hover:border-blue-400 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{stats.activeUsers}</div>
                      <div className="text-sm text-muted-foreground">Active Members</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/70 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-400 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{stats.totalPosts}</div>
                      <div className="text-sm text-muted-foreground">Total Posts</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/70 backdrop-blur-sm border-2 border-green-200 hover:border-green-400 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-green-600">{stats.totalComments}</div>
                      <div className="text-sm text-muted-foreground">Interactions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/70 backdrop-blur-sm border-2 border-orange-200 hover:border-orange-400 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{stats.totalSpaces}</div>
                      <div className="text-sm text-muted-foreground">Active Spaces</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

          {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
            <TabsTrigger value="feed">📝 Feed</TabsTrigger>
            <TabsTrigger value="spaces">🌍 Spaces</TabsTrigger>
            <TabsTrigger value="community">💬 Community</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-4">
            <div className="grid lg:grid-cols-4 gap-4">
              {/* Spaces Sidebar */}
              <div className="lg:col-span-1">
                      <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Community Spaces
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                    {spaces && spaces.length > 0 ? spaces.map((space) => (
                      <motion.div
                        key={space?._id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant={selectedSpace === space?._id ? "default" : "ghost"}
                          className="w-full justify-start text-left h-auto p-3 rounded-lg"
                          onClick={() => space?._id && setSelectedSpace(space._id)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <span className="text-2xl">{space?.icon || '💭'}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{space?.name || 'Untitled'}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                {space?.memberCount || 0} members
                              </div>
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No spaces available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Feed */}
              <div className="lg:col-span-3 space-y-4">
                {/* Create Post */}
                {isAuthenticated && (
                  <Card>
                    <CardContent className="pt-6">
                      {!showCreatePost ? (
                        <Button 
                          onClick={() => setShowCreatePost(true)}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          disabled={userTier === 'free'}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {userTier === 'free' ? (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Premium Required to Post
                            </>
                          ) : (
                            'Share Something with the Community'
                          )}
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Share your thoughts, experiences, or reflections..."
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            className="min-h-[100px]"
                            maxLength={500}
                          />
                          <p className="text-sm text-muted-foreground text-right">
                            {newPost.content.length}/500
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleCreatePost}
                              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                            >
                              <Sparkles className="w-4 h-4 mr-2" />
                              Post
                            </Button>
                            <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Posts Feed */}
                {posts.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium mb-2">No posts yet in {selectedSpaceData?.name}</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Your words might be what someone needs today 💫
                      </p>
                      {isAuthenticated && userTier === 'premium' && (
                        <Button onClick={() => setShowCreatePost(true)}>
                          Be the First to Share
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                                <span className="text-lg font-medium">
                                  {post.isAnonymous ? '?' : post.userId?.username?.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {post.isAnonymous ? 'Anonymous' : post.userId?.username || 'User'}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeAgo(post.createdAt)}
                                </div>
                              </div>
                            </div>
                            {post.mood && (
                              <Badge variant="secondary" className="text-sm">
                                {getMoodEmoji(post.mood)} {post.mood.charAt(0).toUpperCase() + post.mood.slice(1)}
                              </Badge>
                            )}
                          </div>
                              
                          <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                            {post.content}
                          </p>
                          
                          {post.aiReflection && (
                            <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-400 dark:border-blue-600 p-3 mb-3 rounded-r">
                              <div className="flex items-start gap-2">
                                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200">AI Reflection</div>
                                  <div className="text-sm text-blue-700 dark:text-blue-300">{post.aiReflection}</div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 pt-4 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReaction(post._id, 'heart')}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Heart className="w-4 h-4 mr-1" />
                              {getReactionCount(post.reactions, 'heart')}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReaction(post._id, 'support')}
                              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {getReactionCount(post.reactions, 'support')}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReaction(post._id, 'growth')}
                              className="text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                            >
                              <Leaf className="w-4 h-4 mr-1" />
                              {getReactionCount(post.reactions, 'growth')}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newExpanded = new Set(expandedComments);
                                if (newExpanded.has(post._id)) {
                                  newExpanded.delete(post._id);
                                } else {
                                  newExpanded.add(post._id);
                                }
                                setExpandedComments(newExpanded);
                              }}
                              className="ml-auto"
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {post.comments?.length || 0} comments
                            </Button>
                          </div>

                          {/* Comments Section */}
                          {expandedComments.has(post._id) && (
                            <div className="mt-4 border-t pt-4">
                              <PostComments 
                                postId={post._id}
                                userTier={userTier}
                                onCommentAdded={() => loadSpacePosts(selectedSpace)}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spaces" className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {spaces && spaces.length > 0 ? spaces.map((space) => (
                <motion.div
                  key={space._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full"
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{space?.icon || '💭'}</span>
                          <div>
                            <CardTitle>{space?.name || 'Untitled Space'}</CardTitle>
                            <p className="text-sm text-muted-foreground">{space?.description || 'No description'}</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm mb-4">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {space?.memberCount || 0} members
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {space?.postCount || 0} posts
                        </Badge>
                      </div>
                      {space?.latestPost && (
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">{space.latestPost.content}</p>
                          <p className="text-xs text-muted-foreground">— {space.latestPost.username}</p>
                        </div>
                      )}
                      <Button className="w-full mt-4" onClick={() => setSelectedSpace(space._id)}>
                        Join Space
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )) : (
                <div className="col-span-2">
                  <Card>
                    <CardContent className="pt-6 text-center py-12">
                      <p className="text-muted-foreground">No community spaces available yet.</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="community" className="mt-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <CommunityChallenges userTier={userTier} />
              <CommunityPrompts userTier={userTier} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Create Posts"
        description="Premium users can create posts, comment on others' posts, and participate in community challenges."
      />
    </div>
  );
}

