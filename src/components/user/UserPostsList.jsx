import { Link } from "react-router-dom";

export default function UserPostsList({ posts, loading, error }) {
  if (loading) {
    return <div className="loading">Posztok betöltése...</div>;
  }

  if (error) {
    return <div className="error">Hiba a posztok betöltésekor: {error}</div>;
  }

  if (!posts || posts.length === 0) {
    return <div className="no-posts">Nincsenek posztok.</div>;
  }

  return (
    <div className="user-posts-list">
      <h3>Posztok ({posts.length})</h3>
      <div className="posts-list">
        {posts.map((post) => (
          <article 
            key={post.id} 
            className="forum-post"
            onClick={() => window.location.href = `/forum/post/${post.id}`}
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
                <span className="forum-row-stat-value">{"\ud83d\udc4d"} {post.likes ?? 0}</span>
              </div>
              <div className="forum-row-stat">
                <span className="forum-row-stat-value">{"\ud83d\udc4e"} {post.dislikes ?? 0}</span>
              </div>
              <div className="forum-row-stat">
                <span className="forum-row-stat-value">{"\ud83d\udc41\ufe0f"} {post.view_count ?? 0}</span>
              </div>
            </div>

            <div className="forum-row-last">
              <div className="forum-row-last-meta">
                <span className="forum-row-last-label">Létrejött:</span>
                <span className="forum-row-last-value">
                  {post.date}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
