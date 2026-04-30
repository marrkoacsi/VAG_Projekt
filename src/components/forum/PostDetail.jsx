import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import { Loading, ErrorAlert } from "../common/Loading";
import { usePostDetail } from "../../hooks/forum/usePostDetail";
import "../../styles/postdetail.css";
import "../../styles/forum-ads.css";

const DEFAULT_AVATAR = "https://via.placeholder.com/80";

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { post, replies, loading, error, addReply, setPost, setReplies } = usePostDetail(postId);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const userStr = localStorage.getItem("user");
  const userData = userStr ? JSON.parse(userStr) : {};
  const userId = userData?.id;

  const handleReaction = async (postToReact, type) => {
    if (!userId) {
      alert("Kérjük, jelentkezz be a szavazáshoz!");
      return;
    }
    try {
      const response = await api.updateReaction(postToReact.id, type);
      if (response.success) {
        // Refresh the post data to show updated likes/dislikes
        const updatedData = await api.getPostDetail(postId);
        // This will be handled by the hook's internal state management
        setReplies(updatedData.replies || []);
      }
    } catch (err) {
      console.error("Hiba a szavazásnál:", err);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();

    if (!userData.username) {
      alert("Kérjük, jelentkezz be a válaszadáshoz!");
      return;
    }

    if (!replyContent.trim()) {
      alert("Kérjük, írj meg egy választ!");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.createReply(postId, replyContent);
      if (response.success) {
        setReplyContent("");
        const updatedData = await api.getPostDetail(postId);
        setReplies(updatedData.replies || []);
      }
    } catch (err) {
      console.error("Hiba a válasz küldésénél:", err);
      alert("Hiba történt a válasz küldésénél. Kérjük, próbáld később!");
    } finally {
      setSubmitting(false);
    }
  };

  const goToUserProfile = (username) => {
    if (!username) return;
    navigate(`/profile/${encodeURIComponent(username)}`);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorAlert message={error} onClose={() => setError(null)} />;

  if (!post)
    return <ErrorAlert message="A poszt nem található." onClose={() => navigate("/forum")} />;

  return (
    <div className="forum-layout">
      <aside className="ad-sidebar left">
        <div className="ad-container">
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-XXXX"
            data-ad-slot="XXXX"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
      </aside>

      <main className="forum-main">
        <div className="post-detail-container">
          <article className="post-detail-hero-card">
            <div className="post-detail-hero-main">
              <img
                className="post-detail-hero-avatar"
                src={post.ppicture || DEFAULT_AVATAR}
                alt={post.username}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_AVATAR;
                }}
              />
              <div className="post-detail-hero-texts">
                <h1>{post.name}</h1>
                <div className="post-detail-hero-meta">
                  <button
                    type="button"
                    className="post-detail-user-link"
                    onClick={() => goToUserProfile(post.username)}
                  >
                    @{post.username}
                  </button>
                  <span>{post.date}</span>
                </div>
              </div>
            </div>

            <div className="post-detail-hero-stats">
              {userData && userData.username ? (
                <>
                  <button
                    type="button"
                    className="post-detail-stat-chip post-detail-stat-chip-btn"
                    onClick={() => handleReaction(post, "likes")}
                  >
                    <span>Like</span>
                    <strong>{post.likes ?? 0}</strong>
                  </button>
                  <button
                    type="button"
                    className="post-detail-stat-chip post-detail-stat-chip-btn"
                    onClick={() => handleReaction(post, "dislikes")}
                  >
                    <span>Dislike</span>
                    <strong>{post.dislikes ?? 0}</strong>
                  </button>
                </>
              ) : (
                <>
                  <div className="post-detail-stat-chip">
                    <span>Like</span>
                    <strong>{post.likes ?? 0}</strong>
                  </div>
                  <div className="post-detail-stat-chip">
                    <span>Dislike</span>
                    <strong>{post.dislikes ?? 0}</strong>
                  </div>
                </>
              )}
              <div className="post-detail-stat-chip">
                <span>Megtekintés</span>
                <strong>{post.view_count ?? 0}</strong>
              </div>
            </div>
          </article>

          {post.file_name ? (
            <div className="post-detail-image-wrap">
              <img
                className="post-detail-image"
                src={post.file_name}
                alt={post.name}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          ) : null}

          <section className="post-detail-content-card">
            <p>{post.content}</p>
          </section>

          <section className="replies-section">
            <h2>Válaszok ({replies.length})</h2>

            {replies.length === 0 ? (
              <div className="no-replies">Még nincsenek válaszok.</div>
            ) : (
              <div className="replies-list">
                {replies.map((reply) => (
                  <article key={reply.id} className="reply-item">
                    <div className="reply-header">
                      <img
                        className="reply-avatar"
                        src={reply.ppicture || DEFAULT_AVATAR}
                        alt={reply.username}
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_AVATAR;
                        }}
                      />
                      <div className="reply-meta">
                        <button
                          type="button"
                          className="post-detail-user-link reply-author"
                          onClick={() => goToUserProfile(reply.username)}
                        >
                          @{reply.username}
                        </button>
                        <span className="reply-date">{reply.date}</span>
                      </div>
                    </div>

                    <div className="reply-content">{reply.content}</div>

                    {reply.file_name ? (
                      <div className="reply-attachment-wrap">
                        <img
                          className="reply-attachment"
                          src={reply.file_name}
                          alt={reply.name || "reply attachment"}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    ) : null}

                  </article>
                ))}
              </div>
            )}

        {userData.username ? (
          <form className="reply-form" onSubmit={handleSubmitReply}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Írj meg egy választ..."
              maxLength={1000}
              required
              style={{ resize: "none" }}
            />
            <button type="submit" disabled={submitting}>
              {submitting ? "Küldés..." : "Válasz küldése"}
            </button>
          </form>
        ) : (
          <div className="login-prompt">
            <p>
              Reagálni szeretnél? <Link to="/auth">Jelentkezz be</Link>
            </p>
          </div>
        )}
          </section>
        </div>
      </main>

      <aside className="ad-sidebar right">
        <div className="ad-container">
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-XXXX"
            data-ad-slot="XXXX"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
      </aside>
    </div>
  );
}
