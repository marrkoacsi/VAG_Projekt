import { useState, useEffect } from "react";
import { api } from "../../utils/api";

export function useForumPosts({ sortBy, category, tag }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await api.getForumPosts({ sortBy, category, tag });
        setPosts(data.post || []);
      } catch (err) {
        setError("Error loading forum posts.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [sortBy, category, tag]);

  const refreshPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getForumPosts({ sortBy, category, tag });
      setPosts(data.post || []);
    } catch (err) {
      setError("Error refreshing forum posts.");
    } finally {
      setLoading(false);
    }
  };

  return { posts, loading, error, refreshPosts };
}
