'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Sparkles, Clock, Users, MessageSquare, Heart, Leaf } from 'lucide-react';
import { PostComments } from '@/components/community/post-comments';
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
  images?: string[]; // <-- ADD THIS
  reactions: {
    heart: string[];
    support: string[];
    growth: string[];
  };
  comments: any[];
  aiReflection?: string;
  createdAt: string;
}

export default function SpacePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, userTier } = useSession();
  const spaceId = params.spaceId as string;
  
  const [space, setSpace] = useState<CommunitySpace | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    mood: '',
    isAnonymous: false
  });
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (spaceId) {
      loadSpaceData();
      loadSpacePosts();
    }
  }, [spaceId]);

  const loadSpaceData = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/community/spaces', { headers });
      const data = await response.json();

      if (data.success) {
        const spaces = data.spaces || [];
        const currentSpace = spaces.find((s: CommunitySpace) => s._id === spaceId);
        setSpace(currentSpace || null);
      }
    } catch (error) {
      console.error('Error loading space data:', error);
    }
  };

  const loadSpacePosts = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  // Image handling functions:
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validFiles = files.filter(file => validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024);
    if (validFiles.length !== files.length) {
      toast.error('Some files were skipped. Only JPEG, PNG, GIF, and WebP images under 5MB allowed.');
    }
    // Enforce max 6 images total
    setSelectedImages(prev => {
      const remaining = 6 - prev.length;
      const toAdd = validFiles.slice(0, Math.max(0, remaining));
      if (validFiles.length > toAdd.length) {
        toast.error('You can upload up to 6 images per post.');
      }
      return [...prev, ...toAdd];
    });
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => {
      const remaining = 6 - prev.length;
      const toAdd = newPreviews.slice(0, Math.max(0, remaining));
      return [...prev, ...toAdd];
    });
  };
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };
  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];
    const uploadPromises = selectedImages.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('postId', 'temp');
      const response = await fetch('/api/community/upload-image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      const data = await response.json();
      if (data.success) return data.imageUrl;
      else throw new Error(data.error);
    });
    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      toast.error('Failed to upload images');
      return [];
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) {
      toast.error('Please enter some content');
      return;
    }
    // Enforce 2000-word limit
    const words = newPost.content.trim().split(/\s+/).filter(Boolean);
    if (words.length > 2000) {
      toast.error('Your post exceeds the 2000-word limit. Please shorten it.');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Please log in to create posts');
      return;
    }
    if (userTier !== 'premium') {
      toast.error('Premium subscription required to create posts');
      return;
    }
    try {
      // Upload images
      const imageUrls = await uploadImages();
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          spaceId: spaceId,
          content: newPost.content,
          mood: newPost.mood || undefined,
          isAnonymous: newPost.isAnonymous,
          images: imageUrls
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Post created successfully!');
        setNewPost({ content: '', mood: '', isAnonymous: false });
        setSelectedImages([]);
        setImagePreviews([]);
        setShowCreatePost(false);
        loadSpacePosts();
      } else {
        toast.error(data.error || 'Failed to create post');
      }
    } catch (error) {
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

  if (!space) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Space Not Found</h2>
            <p className="text-muted-foreground mb-4">The community space you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/community')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Community
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-4">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/community')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Community
            </Button>
          </div>

          <Card className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 border-2 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-6xl">{space.icon}</span>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-2">
                    {space.name}
                  </h1>
                  <p className="text-lg text-purple-700 dark:text-purple-300 mb-3">
                    {space.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-purple-600 dark:text-purple-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {space.memberCount || 0} members
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {space.postCount || 0} posts
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Create Post */}
        {isAuthenticated && userTier === 'premium' && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              {!showCreatePost ? (
                <Button 
                  onClick={() => setShowCreatePost(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Share Something in {space.name}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    placeholder={`Share your thoughts in ${space.name}...`}
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-muted-foreground text-right">
                    {newPost.content.trim().split(/\s+/).filter(Boolean).length}/2000 words
                  </p>
                  {/* --- Add Mood Selector if you want here --- */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Add Images (Optional)</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                          className="hidden"
                          id="post-images"
                        />
                        <label
                          htmlFor="post-images"
                          className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-primary border border-dashed border-muted-foreground rounded-lg px-3 py-2 w-full justify-center"
                        >
                          Add images ({selectedImages.length}/6)
                        </label>
                      </div>
                      {/* image previews */}
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <Image
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                width={120}
                                height={120}
                                className="rounded object-cover w-full h-24"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeImage(index)}
                                className="absolute -top-1 -right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                              >
                                X
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreatePost}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Post
                    </Button>
                    <Button variant="outline" onClick={() => { setShowCreatePost(false); setSelectedImages([]); setImagePreviews([]); }}>
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
            <CardContent className="pt-6 text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-2">No posts yet in {space.name}</p>
              <p className="text-sm text-muted-foreground mb-3">
                Be the first to share something meaningful 💫
              </p>
              {isAuthenticated && userTier === 'premium' && (
                <Button onClick={() => setShowCreatePost(true)}>
                  Be the First to Share
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
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
                    
                    {post.images && post.images.length > 0 && (
                      <div className="mb-3">
                        <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}
                        >
                          {post.images.map((imageUrl, index) => (
                            <div
                              key={index}
                              className="relative cursor-pointer group"
                              onClick={() => {
                                setLightboxImages(post.images ?? []);
                                setLightboxIndex(index);
                                setLightboxOpen(true);
                              }}
                            >
                              <Image
                                src={imageUrl}
                                alt={`Post image ${index + 1}`}
                                width={600}
                                height={400}
                                className="rounded-lg object-cover w-full h-40 sm:h-56 group-hover:brightness-95 group-hover:ring-4 group-hover:ring-primary transition"
                              />
                            </div>
                          ))}
                        </div>
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
                          isAuthenticated={isAuthenticated}
                          onCommentAdded={() => loadSpacePosts()}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
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
