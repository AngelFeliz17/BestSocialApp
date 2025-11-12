import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import api from "../context/axios";
import { useUser } from "./useUser";
import { useFollow } from '../hooks/useFollow';

interface Post {
    _id: String,
    user_id: {
        _id: string;
        username: string;
        avatar_url?: string;
    },
    fileUrl: String,
    description: String,
    createdAt: Date,
}

interface Like {
    userId: String,
    postId: String,
}


export function usePost(autoFetch: boolean = true) {
  const { id } = useParams();
  const { user } = useUser();
  const [likesByUser, setLikesByUser] = useState<Like[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likesLength, setLikesLength] = useState(0);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const { followings, get_Followers_Followings} =  useFollow() as any;

  useEffect(() => {
    if(user) {
      get_Followers_Followings();
    }
  }, [user])
  
  const getPosts = async () => {
    try {
      const res1 = await api.get("/posts/get-following-users-posts");
      const res2 = await api.get("/posts/get-posts");
  
      // Combine both results (put res1 first, then res2)
      setPosts([...res1.data.posts, ...res2.data.posts]);
    } catch (error) {
      console.log(error);
      setPosts([]); 
    }
  };

  const getProfilePosts = async () => {
    try {
      if (id === user?.username) {
        const res = await api.get("/posts/get-my-posts");
        setMyPosts(res.data.posts);
      } else {
        const res = await api.get(`/posts/get-posts-by-user/${id}`);
        setPosts(res.data.posts);
      }
    } catch (err) {
      console.log(err);
  
      if (id === user?.username) {
        setMyPosts([]);
      } else {
        setPosts([]);
      }
    }
  };
  
  const getLikesByUser = async () => {
    return api.get(`/posts/get-likes-by-user`).then((res) => {
      setLikesByUser(res.data.likes.map((like: any) => like.post_id));
    });
  };

  const getLikesLength = async (id: any) => {
    return api.get(`/posts/get-likes-by-post/${id}`).then((res) => {
      setLikesLength(res.data.likesLength);
    }).catch((err) => {
      console.log(err);
      setLikesLength(0);
    });
  };

  useEffect(() => {
    if(!autoFetch) return;
      getLikesByUser();
      if(id) {
       getProfilePosts();
      } else if(followings !== undefined) {
        getPosts();
      }
  }, [autoFetch, id, user, followings]);

  return { posts, myPosts, likesByUser, getPosts, getProfilePosts, getLikesByUser, setPosts, setMyPosts, setLikesByUser, getLikesLength, setLikesLength, likesLength };
}