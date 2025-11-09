import React from 'react';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { usePost } from '../hooks/usePost';

const Feed: React.FC = () => {
  const { posts, likesByUser, getPosts, getLikesByUser } = usePost(true) as any;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <CreatePost reloadPosts={() => getPosts()} />
        
        <div className="space-y-4">
          {posts?.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500">Be the first to share something!</p>
            </div>
          ) : (
            posts?.map((post: any) => (
              <PostCard key={post._id} post={post} reloadPosts={getPosts} likesByUser={likesByUser} getLikesByUser={getLikesByUser} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
