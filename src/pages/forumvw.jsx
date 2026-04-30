import { useState, useEffect } from "react";
import ForumList from "../components/forum/ForumList";
import "../styles/forum.css";
import "../styles/forum-ads.css";
import "../styles/forum-controls.css";

export default function ForumVW() {
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, []);

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
        <h2>Volkswagen fórum</h2>
        <div className="forum-controls">
          <label htmlFor="sort-select-vw">Rendezés:</label>
          <select
            id="sort-select-vw"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Legújabb elöl</option>
            <option value="oldest">Legrégebbi elöl</option>
            <option value="likes">Legtöbb like</option>
            <option value="views">Legnézettebb</option>
          </select>
        </div>

        <ForumList sortBy={sortBy} category="vw" />
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
