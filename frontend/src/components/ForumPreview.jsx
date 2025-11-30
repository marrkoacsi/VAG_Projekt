const demoCategories = [
  { id: "vw", name: "Volkswagen", description: "Golf, Passat, Polo, TDI, stb." },
  { id: "audi", name: "Audi", description: "A3, A4, A6, quattro, S/RS modellek." },
  { id: "skoda", name: "Škoda", description: "Fabia, Octavia, Superb, tuning." },
  { id: "seat", name: "SEAT", description: "Ibiza, Leon, Cupra." },
];

const demoTopics = [
  {
    id: 1,
    category: "Volkswagen",
    title: "Golf 4 TDI hidegindítási problémák",
    replies: 12,
    views: 540,
    lastReply: "tdiBence",
    lastActivity: "2025-11-26",
  },
  {
    id: 2,
    category: "Škoda",
    title: "Fabia 1.4 16V BBZ – ajánlott olaj, gyertyák",
    replies: 7,
    views: 210,
    lastReply: "marko",
    lastActivity: "2025-11-25",
  },
  {
    id: 3,
    category: "Audi",
    title: "A6 C5 2.5 TDI – tipikus hibák vásárlás előtt",
    replies: 19,
    views: 890,
    lastReply: "tdsGeri",
    lastActivity: "2025-11-24",
  },
];

function ForumPreview({
  currentUser,
  isLoggedIn,
  onGoToRegister,
  onGoToLogin,
  onLogout,
}) {
  return (
    <div className="forum-preview">
      <div className="forum-header">
        <div>
          <h2>VAG Fórum – főoldal</h2>
          <p>VW, Audi, Škoda, SEAT – hibák, tuning, tapasztalatok.</p>
        </div>
        <div className="forum-userbox">
          {isLoggedIn && currentUser ? (
            <>
              <span className="badge badge--success">Bejelentkezve</span>
              <div className="forum-userbox__name">
                {currentUser.username}
                <span>{currentUser.email}</span>
              </div>
              <div className="forum-userbox__actions">
                <button onClick={onLogout}>Kijelentkezés</button>
              </div>
            </>
          ) : (
            <>
              <span className="badge">Nem vagy bejelentkezve</span>
              <div className="forum-userbox__actions">
                <button onClick={onGoToLogin}>Belépés</button>
                <button onClick={onGoToRegister}>Regisztráció</button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="forum-layout">
        <aside className="forum-categories">
          <h3>Kategóriák</h3>
          <ul>
            {demoCategories.map((cat) => (
              <li key={cat.id}>
                <div className="cat-title">{cat.name}</div>
                <div className="cat-desc">{cat.description}</div>
              </li>
            ))}
          </ul>
        </aside>

        <main className="forum-topics">
          <h3>Legutóbbi témák</h3>
          <div className="topic-list">
            {demoTopics.map((topic) => (
              <div key={topic.id} className="topic-row">
                <div className="topic-main">
                  <div className="topic-title">{topic.title}</div>
                  <div className="topic-meta">
                    {topic.category} • Utolsó válasz: {topic.lastReply} –{" "}
                    {topic.lastActivity}
                  </div>
                </div>
                <div className="topic-stats">
                  <div>
                    <span className="topic-stat-label">Válaszok</span>
                    <span className="topic-stat-value">{topic.replies}</span>
                  </div>
                  <div>
                    <span className="topic-stat-label">Megtekintés</span>
                    <span className="topic-stat-value">{topic.views}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ForumPreview;