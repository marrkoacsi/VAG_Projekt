import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import { Loading, ErrorAlert } from "../common/Loading";
import { useForumPosts } from "../../hooks/forum/useForumPosts";
import "../../styles/forum.css";

const DEFAULT_AVATAR = "https://via.placeholder.com/40";

export default function ForumList({ sortBy, category, tag, hideCreate }) {
  const { posts, loading, error, refreshPosts } = useForumPosts({ sortBy, category, tag });
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const data = userStr ? JSON.parse(userStr) : {};

  const handleReaction = async (postId, type) => {
    try {
      const response = await api.updateReaction(postId, type);
      if (response.success) {
        refreshPosts();
      }
    } catch (err) {
      console.error("Hiba a reakciónál:", err);
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/forum/post/${postId}`);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorAlert message={error} onClose={() => setError(null)} />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);

    const content = String(formData.get("post") ?? "");
    const lower = content.toLowerCase();
    const hasBrandTag =
      lower.includes("#skoda") ||
      lower.includes("#seat") ||
      lower.includes("#audi") ||
      lower.includes("#vw") ||
      lower.includes("#volkswagen");
    if (!hasBrandTag) {
      alert("Adj meg legalább 1 márka hashtaget a posztban (pl. #vw / #skoda / #seat / #audi).");
      return;
    }
    
    formData.append("username", data.username);
    formData.append("action", "create");

    try {
      const result = await api.createPost(formData);
      console.log("Siker:", result);
      alert("Poszt sikeresen létrehozva!");
      e.target.reset(); // Form ürítése
      refreshPosts(); // Refresh posts after successful creation
    } catch (error) {
      alert("Hiba történt a küldés során: " + error.message);
    }
  };

  return (
    <>
      <div className="forum-container">
        <h2>Fórum</h2>
        {category ? (
          <div className="forum-active-filter">
            Szűrő: <span className="forum-active-filter-chip">#{category}</span>
          </div>
        ) : null}
        {posts.length === 0 ? (
          <p className="no-posts">Nincsenek még posztok.</p>
        ) : (
          <div className="posts-list">
            {posts.map((post) => (
              <article 
                key={post.id} 
                className="forum-post"
                onClick={() => handlePostClick(post.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="forum-row-main">
                  <div className="forum-row-icon">
                    <span className="forum-row-icon-badge">{"\ud83d\udccb"}</span>
                  </div>

                  <div className="forum-row-title">
                    <h3>{post.name}</h3>
                    <div className="forum-row-sub">
                      <span className="post-author">{post.username}</span>
                    </div>
                  </div>
                </div>

                <div className="forum-row-stats">
                  <div className="forum-row-stat">
                    <span className="forum-row-stat-label">Like</span>
                    <span className="forum-row-stat-value">{post.likes ?? 0}</span>
                  </div>
                  <div className="forum-row-stat">
                    <span className="forum-row-stat-label">Dislike</span>
                    <span className="forum-row-stat-value">{post.dislikes ?? 0}</span>
                  </div>
                  <div className="forum-row-stat">
                    <span className="forum-row-stat-label">Megtekintés</span>
                    <span className="forum-row-stat-value">{post.view_count ?? 0}</span>
                  </div>
                </div>

                <div className="forum-row-last">
                  <div className="forum-row-last-meta">
                    <span className="forum-row-last-label">Létrejött:</span>
                    <span className="forum-row-last-value">
                      {post.date} • {post.username}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!hideCreate && data.username ? (
          <div className="create_post">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <input type="text" name="name" placeholder="Poszt címe" required />
              <textarea 
                name="post" 
                placeholder="Ide írd a posztot. Hashtagek pl.: #skoda #fabia (max 2000 karakter)" 
                maxLength={2000} 
                required
              />
              <input type="file" name="file" />
              <button type="submit" name="post-btn">Posztolás</button>
            </form>
          </div>
        ) : !hideCreate ? (
          <p className="no-posts" style={{ marginTop: "1.5rem" }}>
            Posztoláshoz kérjük, <a href="/auth">jelentkezz be</a>.
          </p>
        ) : null}
        
      </div>
    </>
  );
}
