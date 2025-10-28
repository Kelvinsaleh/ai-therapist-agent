'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  _id: string;
  userId: {
    _id: string;
    username: string;
  };
  content: string;
  isAnonymous: boolean;
  createdAt: string;
  reactions?: {
    heart: string[];
    support: string[];
  };
}

interface PostCommentsProps {
  postId: string;
  userTier: 'free' | 'premium';
  onCommentAdded?: () => void;
}

export function PostComments({ postId, userTier, onCommentAdded }: PostCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    // Community is free: no tier gating for comments

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/community/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          postId,
          content: comment,
          isAnonymous: false
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Comment posted!');
        setComment('');
        setShowInput(false);
        loadComments(); // Reload comments
        if (onCommentAdded) onCommentAdded();
      } else {
        toast.error(data.error || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
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

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-16 bg-muted animate-pulse rounded"></div>
        <div className="h-16 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Comment Input */}
      {!showInput ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowInput(true)}
        >
          Add a comment...
        </Button>
      ) : (
        <div className="space-y-2">
          <Textarea
            placeholder="Share your thoughts..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px]"
            maxLength={300}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={isSubmitting || !comment.trim()}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowInput(false);
                setComment('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="bg-muted/50 p-3 rounded-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {comment.isAnonymous ? '?' : comment.userId?.username?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {comment.isAnonymous ? 'Anonymous' : comment.userId?.username || 'User'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(comment.createdAt)}
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

