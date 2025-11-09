import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import Card from './ui/Card';
import { useUser } from '../hooks/useUser';
import api from '../context/axios';
import { usePost } from '../hooks/usePost';
import { useFollow } from "../hooks/useFollow";
import { Link, useParams } from 'react-router-dom';

interface Comment {
  _id: string;
  user_id: {
    _id: string;
    username: string;
    avatar_url?: string;
  };
  text: string;
  createdAt: string;
}

interface PostCardProps {
  post: {
    _id: string;
    user_id: {
      _id: string;
      username: string;
      avatar_url?: string;
  };
    userAvatar?: string;
    description: string;
    file_url?: string;
    likes: number;
    createdAt: string;
  };
  reloadPosts: () => void;
  likesByUser: string[];
  getLikesByUser: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, reloadPosts, likesByUser, getLikesByUser }) => {
  const { user } = useUser();
  const { id } = useParams();
  const { likesLength, setLikesLength, getLikesLength } = usePost();
  const { postFollow, followings, isFollowLoading, setIsFollowLoading } = useFollow();

  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeAgo = new Date(post.createdAt).toLocaleDateString();
  const [postComments, setPostComments] = useState<Comment[]>([])

  useEffect(() => {
    getComments();
    getLikesByUser();
    setIsLiked(likesByUser?.includes(post._id) || false);
    getLikesLength(post._id);
  }, [post]);
  
  // Check following status when post changes or component mounts
  useEffect(() => {
    if (!user || !followings) {
      setIsFollowing(false);
      return;
    }
    
    // Check if the current user is following the post owner
    const alreadyFollowing = followings.some(
      (f: any) => {
        // Handle different possible structures
        if (typeof f === 'string') return f === post.user_id?._id;
        if (f.following_user_id) return f.following_user_id === post.user_id?._id || f.following_user_id?._id === post.user_id?._id;
        if (f._id) return f._id === post.user_id?._id;
        return false;
      }
    );
    
    setIsFollowing(alreadyFollowing);
  }, [followings, post.user_id?._id, post._id, user]);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLikePost = async () => {
    try {
      // Call to backend to like/unlike post
      const res = await api.post(`/posts/like-post/${post._id}`);
  
      // Update local state
      if (res.data.like) {
        setIsLiked(true);
        setLikesLength(res.data.likesCount);
      } else {
        setIsLiked(false);
        setLikesLength(res.data.likesCount);
        console.log(res.data.likesCount);
      }
    } catch (error: any) {
      console.error("Error liking post:", error);
    }
  };

  const handleDeletePost = async () => {
    if(user?._id !== post.user_id._id) return;
    try {
        await api.delete(`/posts/delete-post/${post._id}`);
        reloadPosts();
        setShowMenu(false);
      setShowMenu(false);
    } catch (error: any) {
      setShowMenu(false);
      console.error("Error deleting post:", error);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    getComments();
  };

  const getComments = async () => {
    const res = await api.get(`/posts/get-comments/${post._id}`);
    setPostComments(res.data.comments);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      setNewComment('');
    }
   try {
    const res = await api.post(`/posts/add-comment/${post._id}`, {
      text: newComment,
    });
    setPostComments([...postComments, res.data.comment[0] as Comment]);
    setNewComment('');
  } catch (error: any) {
    console.error("Error adding comment:", error);
    setNewComment('');
  }
  };

  const handleFollowToggle = async () => {
    if (isFollowLoading || user?._id === post.user_id._id) return;
    
    setIsFollowLoading(true);
    try {
      await postFollow(post.user_id._id);
      // The followings array will be updated by postFollow, 
      // which will trigger the useEffect to update isFollowing
    } catch (error: any) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Verify if user is following the post owner
  useEffect(() => {
    if (!user || !followings || followings.length === 0) {
      setIsFollowing(false);
      return;
    }
    
    // Check if the current user is following the post owner
    const alreadyFollowing = followings.some(
      (f: any) => {
        // Handle different possible structures
        if (typeof f === 'string') {
          return f === post.user_id._id;
        }
        if (f.following_user_id) {
          return f.following_user_id === post.user_id._id || f.following_user_id._id === post.user_id._id;
        }
        if (f._id) {
          return f._id === post.user_id._id;
        }
        return false;
      }
    );
    
    setIsFollowing(alreadyFollowing);
  }, [followings, post.user_id?._id, user]);

  return (
    <Card key={post._id} className="p-6 mb-4">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <Link to={`/profile/${post.user_id?.username}`}>
        <div className="flex items-center space-x-3">
          <Avatar src={post.user_id?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} alt={post.user_id?.username || "user"} size="md" />
          <div>
            <h3 className="font-semibold text-gray-900">{post.user_id?.username || "user"}</h3>
            <p className="text-sm text-gray-500">{timeAgo}</p>
          </div>
        </div>
        </Link>

        <div className="flex items-center space-x-2">
          {/* Follow/Following Button - only show if not the current user's post or if you are not in profile page */}
          {user?._id !== post.user_id?._id && !id && (
            <Button
            variant={isFollowing ? "outline" : "primary"}
            size="sm"
            onClick={handleFollowToggle}
            disabled={isFollowLoading}
            className={`transition-all duration-200 ${
              isFollowing 
                ? "border-gray-300 text-gray-700 hover:bg-gray-50" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } ${isFollowLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isFollowLoading ? (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : (
              isFollowing ? "Following" : "Follow"
            )}
          </Button>          
          )}

          {user?._id === post.user_id?._id && (
            <div className="relative" ref={menuRef}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>

              {showMenu && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  <button
                    onClick={handleDeletePost}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        {post.file_url && (
          <div className="mt-3">
            {post.file_url.match(/\.(mp4|webm|ogg|mov|avi)$/i) || post.file_url.includes('video') ? (
              <video
                src={post.file_url}
                controls
                className="w-full rounded-lg max-h-64 max-w-full object-contain cursor-pointer hover:opacity-95 transition-opacity"
              >
                Your browser does not support the video element.
              </video>
            ) : (
              <img
                src={post.file_url}
                alt="Post"
                className="rounded-lg w-full max-h-64 max-w-full object-contain cursor-pointer hover:opacity-95 transition-opacity"
              />
            )}
          </div>
        )}
        <p className="text-gray-900 whitespace-pre-wrap">{post.description}</p>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLikePost}
            className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likesLength}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleComments}
            className="flex items-center space-x-2 text-gray-500"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{postComments.length}</span>
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex space-x-3 mt-1 mb-2">
            <Avatar src={user?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} alt={user?.username || "user"} size="sm" />
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Button type="submit" size="sm" disabled={!newComment.trim()}>
                Post
              </Button>
            </div>
          </form>
          {/* Existing Comments */}
          <div className="space-y-3 mb-4">
            {postComments.map((comment) => (
              <div key={comment._id} className="flex space-x-3">
                <Avatar src={comment.user_id.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} alt={comment.user_id.username || "user"} size="sm" />
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="font-medium text-sm text-gray-900">{comment.user_id.username}</p>
                    <p className="text-gray-700">{comment.text}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default PostCard;
