'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, MessageSquare, Users, Plus, Sparkles, Lock, TrendingUp, Clock, Award, Trash2 } from 'lucide-react';
import { Share2 } from 'lucide-react';
import { CommunityChallenges } from '@/components/community/community-challenges';
import { CommunityPrompts } from '@/components/community/community-prompts';
import { PremiumUpgradeModal } from '@/components/community/premium-upgrade-modal';
import { PostComments } from '@/components/community/post-comments';
import { CreatePostModal } from '@/components/community/create-post-modal';
import { useSession } from '@/lib/contexts/session-context';
import { toast } from 'sonner';
import Image from 'next/image';
import { SimpleLightbox } from '@/components/ui/simple-lightbox';

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
  images?: string[];
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

const shuffle = (array: any[]) => {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

function PostContent({ content, postId }: { content: string; postId: string }) {
  const [expandedPostIds, setExpandedPostIds] = useState<{ [key: string]: boolean }>({});
  const charLimit = 320;
  // We want this state in parent, but simplify here for single post usage
  const isLong = content.length > charLimit;
  const [expanded, setExpanded] = useState(false);

  if (!isLong) return <span>{content}</span>;
  return (
    <>
      {expanded ? content : content.slice(0, charLimit) + '...'}
      <button
        type="button"
        className="ml-1 text-primary underline hover:text-primary/80 text-xs align-baseline"
        onClick={() => setExpanded((e) => !e)}
      >
        {expanded ? 'See less' : 'See more...'}
      </button>
    </>
  );
}

export default function CommunityPageEnhanced() {
  const { isAuthenticated, userTier, user } = useSession();
  const [spaces, setSpaces] = useState<CommunitySpace[]>([]);
  const [activeTab, setActiveTab] = useState('feed');
  const [allPosts, setAllPosts] = useState<CommunityPost[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    loadCommunityData();
  }, []);

  useEffect(() => {
    if (activeTab === 'feed') {
      loadAllPosts();
    }
  }, [activeTab]);

  const loadCommunityData = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const [spacesRes, statsRes] = await Promise.allSettled([
        fetch('/api/community/spaces', { headers }),
        fetch('/api/community/stats', { headers })
      ]);

      // Local fallback spaces if backend is unavailable or returns empty
      const fallbackSpaces: CommunitySpace[] = [
        { _id: 's1', name: 'Anxiety & Overthinking', description: 'A calm space to share your worries and learn coping tools from others.', icon: '🌙', color: '#93C5FD' },
        { _id: 's2', name: 'Depression & Low Mood', description: 'A supportive corner for anyone feeling heavy — you’re not alone here.', icon: '☀️', color: '#FEF3C7' },
        { _id: 's3', name: 'Healing from Breakups', description: 'For anyone recovering from heartbreak or loss — share, reflect, and rebuild.', icon: '💔', color: '#FBCFE8' },
        { _id: 's4', name: 'Stress & Burnout', description: 'Talk about overwhelm, work pressure, and finding balance again.', icon: '🌊', color: '#DBEAFE' },
        { _id: 's5', name: 'Loneliness & Connection', description: 'For those who feel unseen or disconnected — come as you are.', icon: '💭', color: '#E0E7FF' },
        { _id: 's6', name: 'Mindful Living', description: 'Share mindfulness habits, grounding practices, and meditation reflections.', icon: '🌸', color: '#FCE7F3' },
        { _id: 's7', name: 'Gratitude & Positivity', description: 'A place to share small wins, appreciation, or moments of joy.', icon: '🌿', color: '#D1FAE5' },
        { _id: 's8', name: 'Morning Reflections', description: 'A daily check-in for intentions, moods, and affirmations.', icon: '🌅', color: '#FFE4B5' },
        { _id: 's9', name: 'Night Reflections', description: 'A safe unwind zone — share your thoughts before bed.', icon: '🌙', color: '#E0D6FF' },
        { _id: 's10', name: 'Open Chat Café', description: 'A general, friendly space for any topic — music, life, or random thoughts.', icon: '💬', color: '#FFF4CC' },
        { _id: 's11', name: "Men's Circle", description: 'Support and brotherhood for men navigating life’s pressures.', icon: '🤝', color: '#BFDBFE' },
        { _id: 's12', name: "Women's Circle", description: 'A nurturing space to share and grow through women’s experiences.', icon: '🌼', color: '#FBCFE8' },
        { _id: 's13', name: 'Student Life & Young Minds', description: 'For students dealing with stress, exams, or identity growth.', icon: '🌍', color: '#A7F3D0' },
        { _id: 's14', name: 'Stories of Healing', description: 'Share personal journeys and lessons learned on your path to peace.', icon: '📖', color: '#FEE2E2' },
        { _id: 's15', name: 'Affirmations & Quotes', description: 'Post your favorite quotes or affirmations that keep you going.', icon: '✨', color: '#FEF3C7' },
        { _id: 's16', name: 'Forgiveness & Letting Go', description: 'A reflective zone about releasing pain and moving forward.', icon: '🕊️', color: '#E0E7FF' },
      ];

      // Handle spaces response
      if (spacesRes.status === 'fulfilled') {
        try {
          const spacesData = await spacesRes.value.json();
          const list = spacesData?.spaces || [];
          setSpaces(list.length > 0 ? list : fallbackSpaces);
          if ((list.length > 0 ? list : fallbackSpaces).length > 0) {
            // No need to set selected space anymore
          }
        } catch {
          setSpaces(fallbackSpaces);
        }
      } else {
        setSpaces(fallbackSpaces);
      }

      // Handle stats response (optional)
      if (statsRes.status === 'fulfilled') {
        try {
          const statsData = await statsRes.value.json();
          if (statsData?.success) setStats(statsData.stats);
        } catch {}
      }
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllPosts = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`/api/community/feed?limit=30`, { cache: 'no-store', signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('Failed to load feed');
      const data = await res.json();
      const posts = Array.isArray(data.posts) ? shuffle(data.posts) : [];
      setAllPosts(posts);
      const counts: Record<string, number> = {};
      posts.forEach((post: any) => {
        counts[post._id] = post.commentCount || post.comments?.length || 0;
      });
      setCommentCounts(counts);
    } catch (error) {
      console.error('Error loading feed:', error);
      // Fallback: fetch first few spaces and grab recent posts from each
      try {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken')) : null;
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const spacesRes = await fetch('/api/community/spaces', { headers, cache: 'no-store' });
        if (spacesRes.ok) {
          const spacesData = await spacesRes.json();
          const spacesList: any[] = spacesData?.spaces || [];
          const topSpaces = spacesList.slice(0, 4);
          const postsArrays = await Promise.all(
            topSpaces.map((s) => fetch(`/api/community/spaces/${s._id}/posts?limit=10`, { headers, cache: 'no-store' }).then(r => r.ok ? r.json() : { posts: [] }))
          );
          const merged = postsArrays.flatMap((d: any) => d.posts || []);
          // Shuffle merged posts
          const shuffled = shuffle(merged);
          setAllPosts(shuffled);
          const counts: Record<string, number> = {};
          shuffled.forEach((post: any) => {
            counts[post._id] = post.comments?.length || 0;
          });
          setCommentCounts(counts);
        }
      } catch (fallbackError) {
        console.error('Feed fallback failed:', fallbackError);
      }
    }
  };

  const getSpaceInfo = (spaceId: string) => {
    return spaces.find(space => space._id === spaceId);
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
        setAllPosts((prevPosts: any[]) => 
          prevPosts.map((post: any) => 
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

  const handleShare = async (postId: string) => {
    try {
      const shareUrl = `${window.location.origin}/community/space/${getSpaceInfo(postId)?._id || ''}`;
      if ((navigator as any).share) {
        await (navigator as any).share({ title: 'Hope Community Post', url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard');
      }

      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      await fetch(`/api/community/posts/${postId}/share`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } as any : undefined,
      });
      loadAllPosts();
    } catch (e) {
      toast.error('Failed to share post');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Post deleted');
        loadAllPosts(); // Reload posts
      } else {
        toast.error(data.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
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

  // Remove this line as we no longer have selectedSpace

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
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="flex w-full max-w-2xl mx-auto overflow-x-auto gap-2 px-1 sm:px-0">
            <TabsTrigger value="feed">📝 Feed</TabsTrigger>
            <TabsTrigger value="spaces">🌍 Spaces</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-4">
            <div className="max-w-4xl mx-auto space-y-4">
                {/* Create Post Button */}
                <Card>
                  <CardContent className="pt-4">
                    <CreatePostModal 
                      spaces={spaces}
                      userTier={userTier}
                      isAuthenticated={isAuthenticated}
                      onPostCreated={() => {
                        loadAllPosts();
                        toast.success('Post created successfully!');
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Posts Feed */}
                {allPosts.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium mb-2">No posts yet in the community</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Be the first to share something meaningful 💫
                      </p>
                      <div className="flex gap-2 justify-center">
                        {spaces.slice(0, 3).map((space) => (
                          <Button
                            key={space._id}
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/community/space/${space._id}`}
                          >
                            {space.icon} {space.name}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  allPosts.map((post, index) => {
                    const spaceInfo = getSpaceInfo(post.spaceId);
                    return (
                      <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardContent className="pt-4">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                                  <span className="text-lg font-medium">
                                    {post.isAnonymous 
                                      ? '?' 
                                      : (post.userId?.username?.charAt(0).toUpperCase() || 
                                         post.userId?.name?.charAt(0).toUpperCase() || 
                                         '?')}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    {post.isAnonymous
                                      ? 'Anonymous'
                                      : (post.userId?.username && post.userId.username.trim() !== '')
                                        ? post.userId.username
                                        : (post.userId?.name && post.userId.name.trim() !== '')
                                          ? post.userId.name
                                          : 'User'}
                                    {post.isAnonymous && (
                                      <span className="text-xs text-muted-foreground">👤</span>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTimeAgo(post.createdAt)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {spaceInfo && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950"
                                    onClick={() => window.location.href = `/community/space/${spaceInfo._id}`}
                                  >
                                    {spaceInfo.icon} {spaceInfo.name}
                                  </Badge>
                                )}
                                {post.mood && (
                                  <Badge variant="secondary" className="text-sm">
                                    {getMoodEmoji(post.mood)} {post.mood.charAt(0).toUpperCase() + post.mood.slice(1)}
                                  </Badge>
                                )}
                                {/* Delete button for post owner */}
                                {user && (post.userId?._id === user._id || post.userId?._id === user.id) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeletePost(post._id)}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    title="Delete post"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                              <PostContent content={post.content} postId={post._id} />
                            </p>
                            
                            {/* Images */}
                            {post.images && post.images.length > 0 && (
                              <div className="mb-3 space-y-3">
                                {post.images.map((imageUrl, index) => (
                                  <div
                                    key={index}
                                    className="relative cursor-pointer group rounded-lg overflow-hidden bg-muted/40 dark:bg-muted/20"
                                    onClick={() => {
                                      setLightboxImages(post.images ?? []);
                                      setLightboxIndex(index);
                                      setLightboxOpen(true);
                                    }}
                                  >
                                    <Image
                                      src={imageUrl}
                                      alt={`Post image ${index + 1}`}
                                      width={1200}
                                      height={800}
                                      className="w-full h-auto group-hover:brightness-[0.98] transition"
                                      style={{ width: "100%", height: "auto" }}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                            
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
                                onClick={() => handleShare(post._id)}
                                className="text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950"
                              >
                                <Share2 className="w-4 h-4 mr-1" />
                                Share
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
                                {commentCounts[post._id] || post.commentCount || post.comments?.length || 0} comments
                              </Button>
                            </div>

                            {/* Comments Section */}
                            {expandedComments.has(post._id) && (
                              <div className="mt-4 border-t pt-4">
                                <PostComments 
                                  postId={post._id}
                                  userTier={userTier}
                                  isAuthenticated={isAuthenticated}
                                  onCommentAdded={() => {
                                    // Update comment count for this post immediately
                                    setCommentCounts(prev => ({
                                      ...prev,
                                      [post._id]: (prev[post._id] || 0) + 1
                                    }));
                                    // Reload all posts to get updated data
                                    loadAllPosts();
                                  }}
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
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
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => window.location.href = `/community/space/${space._id}`}
                      >
                        Visit Space
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
        </Tabs>
      </div>

      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Create Posts"
        description="Premium users can create posts, comment on others' posts, and participate in community challenges."
      />

      {lightboxOpen && (
        <SimpleLightbox
          images={lightboxImages}
          index={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setLightboxIndex((lightboxIndex + lightboxImages.length - 1) % lightboxImages.length)}
          onNext={() => setLightboxIndex((lightboxIndex + 1) % lightboxImages.length)}
        />
      )}
    </div>
  );
}

