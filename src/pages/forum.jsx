import { Link, useSearchParams } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import ForumList from "../components/forum/ForumList";
import { Loading } from "../components/common/Loading";
import Advertisement from "../components/common/Advertisement";
import { useAuth } from "../context/AuthContext";
import "../styles/forum.css";
import "../styles/forum-ads.css";
import "../styles/forum-controls.css";

export default function Forum() {
  const [searchParams] = useSearchParams();
  const [tagQuery, setTagQuery] = useState(searchParams.get("tag") || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const hashtagSuggestions = [
    "#vw",
    "#volkswagen",
    "#skoda",
    "#seat",
    "#audi",
  ];
  const normalizedTag = useMemo(() => tagQuery.trim(), [tagQuery]);
  const isPremium = user && user.premium_type && user.premium_type !== 'free';

  if (loading) return <Loading />;

  return (
    <div className={`forum-layout ${isPremium ? 'premium' : ''}`}>
      {!isPremium && (
        <aside className="ad-sidebar left">
          <div className="ad-container">
            <Advertisement />
          </div>
        </aside>
      )}

      <main className="forum-main">
        <div className="forum-container">
          <h2>Main fórum</h2>
          <p className="forum-main-subtitle">
            Válaszd ki a márkát, böngéssz, vagy keress hashtagek alapján.
          </p>

          <div className="forum-hashtag-search">
            <label className="forum-hashtag-label" htmlFor="hashtag-search">
              Keresés hashtag alapján
            </label>
            <div className="forum-hashtag-input-row">
              <input
                id="hashtag-search"
                className="forum-hashtag-input"
                value={tagQuery}
                onChange={(e) => setTagQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                placeholder="pl.: #fabia"
              />
              {normalizedTag ? (
                <button
                  className="forum-hashtag-clear"
                  type="button"
                  onClick={() => setTagQuery("")}
                >
                  Törlés
                </button>
              ) : null}
            </div>
            {showSuggestions && (
              <ul className="forum-hashtag-suggestions">
                {hashtagSuggestions
                  .filter((tag) =>
                    tag.toLowerCase().includes(tagQuery.toLowerCase())
                  )
                  .map((tag) => (
                    <li
                      key={tag}
                      className="forum-hashtag-suggestion-item"
                      onMouseDown={() => {
                        setTagQuery(tag);
                        setShowSuggestions(false);
                      }}
                    >
                      {tag}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div className="forum-category-list">
            <Link to="/forum/vw" className="forum-category-row">
              <div className="forum-category-main">
                <div className="forum-category-icon vw">VW</div>
                <div className="forum-category-text">
                  <span className="forum-category-title">Volkswagen</span>
                  <span className="forum-category-sub">
                    Golf, Passat, Arteon, ID. sorozat…
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/forum/skoda" className="forum-category-row">
              <div className="forum-category-main">
                <div className="forum-category-icon skoda">Š</div>
                <div className="forum-category-text">
                  <span className="forum-category-title">Škoda</span>
                  <span className="forum-category-sub">
                    Octavia, Superb, Kodiaq, Fabia…
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/forum/seat" className="forum-category-row">
              <div className="forum-category-main">
                <div className="forum-category-icon seat">S</div>
                <div className="forum-category-text">
                  <span className="forum-category-title">SEAT</span>
                  <span className="forum-category-sub">
                    Leon, Ibiza, Cupra modellek…
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/forum/audi" className="forum-category-row">
              <div className="forum-category-main">
                <div className="forum-category-icon audi">A</div>
                <div className="forum-category-text">
                  <span className="forum-category-title">Audi</span>
                  <span className="forum-category-sub">
                    A-sorozat, S/RS modellek, e-tron…
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <div className="forum-search-results">
            {normalizedTag ? (
              <h3 className="forum-search-title">Találatok: {normalizedTag}</h3>
            ) : (
              <h3 className="forum-search-title">Összes poszt</h3>
            )}
            <ForumList sortBy="newest" tag={normalizedTag || undefined} />
          </div>
        </div>
      </main>

      {!isPremium && (
        <aside className="ad-sidebar right">
          <div className="ad-container">
            <Advertisement />
          </div>
        </aside>
      )}
    </div>
  );
}
