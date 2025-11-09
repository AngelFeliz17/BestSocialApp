import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { useUser } from "./useUser";
import api from "../context/axios";

interface Follow {
  _id: string;
  user_id: string;
  following_user_id: [];
  follower_user_id: []
}

export function useFollow(autoFetch: boolean = true) {
  const { id } = useParams();
  const { user } = useUser();

  const [isFollowing, setIsFollowing] = useState() as any;
  const [followers, setFollowers] = useState<any[]>([]);
  const [followings, setFollowings] = useState<any[]>([]);
  const [followersLength, setFollowersLength] = useState<Follow | null>(null);
  const [followingsLength, setFollowingsLength] = useState<Follow | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const postFollow = async (followingId: any) => {
    setIsFollowLoading(!isFollowLoading)
    try {
        const res = await api.post(`/follows/follow/${followingId}`);
        setIsFollowing(res.data.following);
        await get_Followers_Followings();
        setIsFollowLoading(!isFollowLoading)
      } catch (error: any) {
        console.error("Error toggling follow:", error);
      }
  }
  
  const get_Followers_Followings = async () => {
    try {
      const res = !id || id === user?.username ? await api.get("/follows/get-followers") : await api.get(`/follows/get-user-followers/${id}`);
      setFollowersLength(res.data.followersLength || 0);
      setFollowers(res.data.followers || []);
      setFollowings(res.data.followings || []);
      setFollowingsLength(res.data.followingsLength || 0);
    } catch (err: any) {
      setMessage(err.response?.data?.msg);
    }
  };

//   Load followers automatically if autoFetch is true
  useEffect(() => {
    if (autoFetch) get_Followers_Followings();
  }, []);

  return { 
    isFollowing, setIsFollowing,
    message, postFollow,
    followers, followings,
    setFollowers, setFollowings, 
    followersLength, followingsLength, 
    get_Followers_Followings,
    isFollowLoading, setIsFollowLoading };
}