import { useState, useEffect } from "react";
import api from "../context/axios";

interface User {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  avatar_url?: string;
}

export function useUser(autoFetch: boolean = true) {
  const [user, setUser] = useState<User | null>(null);
  const [externalUser, setExternalUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const getMyUser = async () => {
    try {
      const res = await api.get("/users/get-my-user");
      setUser(res.data.user);
      setMessage(res.data.msg);
    } catch (err: any) {
      setMessage(err.response?.data?.msg);
    }
  };

  const getExternalUser = async (id: any) => {
    try {
      const res = await api.get(`/users/get-user-profile/${id}`);
      setExternalUser(res.data.user);
      setMessage(res.data.msg);
    } catch (err: any) {
      setMessage(err.response?.data?.msg);
    }
  };

  // Load user automatically if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      getMyUser()
    };
  }, []);

  return { user, message, getMyUser, setUser, getExternalUser, externalUser, setExternalUser };
}