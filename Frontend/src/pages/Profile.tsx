import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import Avatar from '../components/ui/Avatar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Link, useParams } from 'react-router-dom';
import { Edit, Users } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { usePost } from '../hooks/usePost';
import { useFollow } from '../hooks/useFollow';

const Profile: React.FC = () => {
  const { id } = useParams();
  const { user, externalUser, getExternalUser } = useUser() as any;
  const { myPosts, likesByUser, getMyPosts, getLikesByUser, getProfilePosts, posts } = usePost(true) as any;
  const { followersLength, followingsLength, postFollow, get_Followers_Followings, followers } =  useFollow() as any;
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const profileUser = id == user?.username ? user : externalUser;

  useEffect(() => {
    if (id !== user?.username) getExternalUser(id);
  }, [id, user]);  

  useEffect(() => {
    if(profileUser?._id) {
      get_Followers_Followings();
    }
  }, [profileUser])

  useEffect(() => {
    if (!user || !profileUser?._id || !followers || profileUser?._id === user._id) return;
  
    const alreadyFollowing = followers.some((f: any) => {
      if (typeof f === "string") return f === profileUser._id;
      if (f.follower_user_id?._id) return f.follower_user_id._id === user._id;   // Do I follow him?
      if (f._id) return f._id === profileUser._id;
      return false;
    });
  
    setIsFollowing(alreadyFollowing);
  }, [followers, profileUser?._id, user]);

  const handleFollowToggle = async () => {
    if (isFollowLoading || !profileUser?._id || user?._id === profileUser?._id) return;
    
    setIsFollowLoading(true);
    try {
      await postFollow(profileUser?._id);
      get_Followers_Followings(profileUser?._id);
    } catch (error: any) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const userPost = id == user?.username ? myPosts : posts;
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar src={profileUser?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} alt={profileUser?.username || "user"} size="xl" />
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{profileUser?.username}</h1>
                  <p className="text-gray-600 mb-2">{profileUser?.email}</p>
                  {profileUser?.bio && (
                    <p className="text-gray-700 mb-4">{profileUser?.bio}</p>
                  )}
                </div>
                
                <div className="flex space-x-3">
                {
                  user?.username === id ? (
                    <Link to="/settings">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  ) : (
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
                  )
              }

                </div>
              </div>
              
              <div className="flex space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">
                    <span className="font-semibold">{followersLength}</span> followers
                    <span className="font-semibold">  {followingsLength}</span> followings
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Posts Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            { id === user?.username ? "Your Posts" : `${profileUser?.username} Posts` }
          </h2>
          
          {userPost.length === 0 ? (
            <Card className="p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500 mb-4">Share your first post to get started!</p>
              <Link to="/feed">
                <Button>Create Post</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {userPost.map((post: any) => (
                <PostCard key={post._id} post={post} reloadPosts={id === user?.username ? getMyPosts : getProfilePosts} likesByUser={likesByUser} getLikesByUser={getLikesByUser} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
