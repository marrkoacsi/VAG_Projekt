import { useState, useEffect } from "react";
import { api } from "../../utils/api";

export function usePostDetail(postId) {
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostDetail = async () => {
      setLoading(true);
      try {
        const data = await api.getPostDetail(postId);
        setPost(data.post);
        setReplies(data.replies || []);
        
        // Increment view count
        try {
          await api.updateViewCount(postId);
        } catch (err) {
          console.error("Hiba a view count frissítésénél:", err);
        }
      } catch (err) {
        console.error("Hiba a poszt betöltésénél:", err);
        setError("A poszt nem található vagy hiba történt a betöltésénél.");
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetail();
  }, [postId]);

  const addReply = (newReply) => {
    setReplies(prev => [...prev, newReply]);
  };

  return { post, replies, loading, error, addReply, setPost, setReplies };
}
