// frontend/src/components/ForumPage.jsx

import { useEffect, useState } from "react";
import {
  getCategories,
  getTopics,
  getPosts,
  createTopic,
  createPost,
} from "../api/forum";

function ForumPage() {
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [posts, setPosts] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setError("");
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message || "Nem sikerült betölteni a kategóriákat.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectCategory(categoryId) {
    setSelectedCategoryId(categoryId);
    setSelectedTopic(null);
    setPosts([]);
    setTopics([]);
    setError("");

    if (!categoryId) return;

    try {
      setLoading(true);
      const data = await getTopics(categoryId);
      setTopics(data);
    } catch (err) {
      setError(err.message || "Nem sikerült betölteni a témákat.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectTopic(topic) {
    setSelectedTopic(topic);
    setPosts([]);
    setNewPostContent("");
    setError("");

    try {
      setLoadingPosts(true);
      const data = await getPosts(topic.id);
      setPosts(data);
    } catch (err) {
      setError(err.message || "Nem sikerült betölteni a hozzászólásokat.");
    } finally {
      setLoadingPosts(false);
    }
  }

  async function handleCreateTopic(e) {
    e.preventDefault();
    if (!selectedCategoryId || !newTopicTitle.trim()) return;

    setError("");

    try {
      const created = await createTopic({
        categoryId: selectedCategoryId,
        title: newTopicTitle.trim(),
      });

      // Új téma hozzáadása a listához
      setTopics((prev) => [created, ...prev]);
      setNewTopicTitle("");
    } catch (err) {
      setError(
        err.message ||
          "Nem sikerült létrehozni a témát. Lehet, hogy be kell jelentkezned."
      );
    }
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    if (!selectedTopic || !newPostContent.trim()) return;

    setError("");

    try {
      const created = await createPost({
        topicId: selectedTopic.id,
        content: newPostContent.trim(),
      });
      setPosts((prev) => [...prev, created]);
      setNewPostContent("");
    } catch (err) {
      setError(
        err.message ||
          "Nem sikerült létrehozni a hozzászólást. Lehet, hogy be kell jelentkezned."
      );
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Fórum</h1>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="forum-layout">
        {/* BAL OLDAL – KATEGÓRIÁK */}
        <div className="forum-column">
          <h2>Kategóriák</h2>

          {loading && !categories.length && (
            <p>Betöltés folyamatban...</p>
          )}

          {!loading && !categories.length && (
            <p>Még nincsenek kategóriák.</p>
          )}

          <ul className="list">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  className={
                    "link-button" +
                    (selectedCategoryId === cat.id ? " link-button--active" : "")
                  }
                  onClick={() => handleSelectCategory(cat.id)}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* JOBB OLDAL – TÉMÁK */}
        <div className="forum-column">
          <h2>Témák</h2>

          {selectedCategoryId ? (
            <>
              {loading && !topics.length && (
                <p>Témák betöltése...</p>
              )}

              {!loading && !topics.length && (
                <p>Még nincsenek témák ebben a kategóriában.</p>
              )}

              <ul className="list list--bordered">
                {topics.map((topic) => (
                  <li
                    key={topic.id}
                    className={
                      "list-item" +
                      (selectedTopic && selectedTopic.id === topic.id
                        ? " list-item--active"
                        : "")
                    }
                  >
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => handleSelectTopic(topic)}
                    >
                      {topic.title}
                    </button>
                    {topic.creator_username && (
                      <span className="list-item-meta">
                        Létrehozta: {topic.creator_username}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              {/* Új téma létrehozása */}
              <form className="form mt-md" onSubmit={handleCreateTopic}>
                <div className="form-row">
                  <label>Új téma címe</label>
                  <input
                    type="text"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    placeholder="Pl. Fabia 1.4 16V projekt..."
                  />
                </div>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={!newTopicTitle.trim()}
                >
                  Téma létrehozása
                </button>
              </form>
            </>
          ) : (
            <p>Válassz egy kategóriát a bal oldali listából.</p>
          )}
        </div>
      </div>

      {/* TÉMA RÉSZLETEI + HOZZÁSZÓLÁSOK */}
      {selectedTopic && (
        <div className="forum-topic-detail mt-lg">
          <h2>{selectedTopic.title}</h2>

          {loadingPosts && <p>Hozzászólások betöltése...</p>}

          <div className="card">
            <div className="card-body">
              {posts.length === 0 && !loadingPosts && (
                <p>Még nincsenek hozzászólások ebben a témában.</p>
              )}

              <ul className="post-list">
                {posts.map((post) => (
                  <li key={post.id} className="post-item">
                    <div className="post-meta">
                      <strong>{post.author_username || "Ismeretlen"}</strong>{" "}
                      <span>
                        {new Date(post.created_at).toLocaleString("hu-HU")}
                      </span>
                    </div>
                    <p className="post-content">{post.content}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Új hozzászólás */}
          <form className="form mt-md" onSubmit={handleCreatePost}>
            <div className="form-row">
              <label>Új hozzászólás</label>
              <textarea
                rows={3}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Írd ide a hozzászólásod..."
              />
            </div>
            <button
              type="submit"
              className="primary-button"
              disabled={!newPostContent.trim()}
            >
              Hozzászólás küldése
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ForumPage;
