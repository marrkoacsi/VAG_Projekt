import { useState, useEffect } from "react";
import { register, login, verifyEmail } from "./api/auth";
import "./App.css";

const computePasswordChecks = (password) => ({
  length: password.length >= 8,
  upper: /[A-Z]/.test(password),
  digit: /[0-9]/.test(password),
  special: /[!@#$%^&*()_\-+=\[{\]}\\|;:'\",.<>/?]/.test(password),
});

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

function parseError(err, setError) {
  if (!err) {
    setError("Ismeretlen hiba történt.");
    return;
  }
  if (typeof err === "string") {
    setError(err);
    return;
  }
  if (err.detail) {
    setError(err.detail);
    return;
  }
  const parts = [];
  for (const key in err) {
    if (Array.isArray(err[key])) {
      parts.push(`${key}: ${err[key].join(", ")}`);
    }
  }
  setError(parts.join(" | ") || "Ismeretlen hiba történt.");
}

function PasswordChecklist({ checks }) {
  const items = [
    { key: "length", label: "Legalább 8 karakter" },
    { key: "upper", label: "Tartalmaz nagybetűt" },
    { key: "digit", label: "Tartalmaz számot" },
    { key: "special", label: "Tartalmaz speciális karaktert" },
  ];
  return (
    <ul className="password-list">
      {items.map((item) => (
        <li
          key={item.key}
          className={
            checks[item.key] ? "password-list__item ok" : "password-list__item"
          }
        >
          <span className="password-list__bullet">
            {checks[item.key] ? "✔" : "•"}
          </span>
          {item.label}
        </li>
      ))}
    </ul>
  );
}

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

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // view: 'home' = index/fórum, 'login' = csak belépés, 'register' = regisztráció, 'verify' = email kód
  const [view, setView] = useState("home");

  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    gender: "",
    birthDate: "",
  });

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [verificationCode, setVerificationCode] = useState("");
  const [passwordChecks, setPasswordChecks] = useState(
    computePasswordChecks("")
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // induláskor: megnézzük, van-e eltárolt token, de mindenképp a főoldalra megyünk
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
    }
    setView("home");
  }, []);

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const isStrong = Object.values(passwordChecks).every(Boolean);
    if (!isStrong) {
      setError("A jelszó nem felel meg minden feltételnek.");
      return;
    }

    try {
      const payload = {
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        gender: registerForm.gender,
        birth_date: registerForm.birthDate || null,
      };

      const data = await register(payload);

      setMessage(
        data.message ||
          "Regisztráció sikeres, ellenőrizd az emailedet a kód miatt."
      );
      setView("verify");
    } catch (err) {
      parseError(err, setError);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const data = await verifyEmail(registerForm.email, verificationCode);
      const user = { username: data.username, email: data.email };
      setToken(data.token);
      setCurrentUser(user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));
      setMessage(data.message || "Email megerősítve, üdv a fórumban!");
      setView("home");
    } catch (err) {
      parseError(err, setError);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const data = await login(loginForm.username, loginForm.password);
      const user = { username: data.username, email: data.email };
      setToken(data.token);
      setCurrentUser(user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));
      setMessage(data.message || "Sikeres belépés.");
      setView("home");
    } catch (err) {
      parseError(err, setError);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoginForm({ username: "", password: "" });
    setRegisterForm({
      username: "",
      email: "",
      password: "",
      gender: "",
      birthDate: "",
    });
    setVerificationCode("");
    setPasswordChecks(computePasswordChecks(""));
    setView("home");
    setMessage("Kijelentkeztél.");
  };

  const currentYear = new Date().getFullYear();
  const passwordOk = Object.values(passwordChecks).every(Boolean);

  return (
    <div className={`app ${view !== "home" ? "app--auth" : ""}`}>
      <div className="app-inner">
        <div className="left-panel">
          <header className="app-header">
            <h1 className="logo">VAG Fórum</h1>
            <div className="header-actions">
              {view !== "home" && (
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setView("home")}
                >
                  Főoldal
                </button>
              )}
              <button className="theme-toggle" onClick={handleThemeToggle}>
                {theme === "dark" ? "☀ Világos mód" : "🌙 Sötét mód"}
              </button>
            </div>
          </header>

          {/* Csak akkor mutatjuk a kártyát, ha nem a főoldalon vagyunk */}
          {view !== "home" && (
            <div className="auth-card">
              {message && <div className="alert alert--success">{message}</div>}
              {error && <div className="alert alert--error">{error}</div>}

              {view === "register" && (
                <form className="form" onSubmit={handleRegisterSubmit}>
                  <div className="form-row">
                    <label>Felhasználónév</label>
                    <input
                      type="text"
                      value={registerForm.username}
                      onChange={(e) =>
                        setRegisterForm((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="form-row">
                    <label>Email</label>
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) =>
                        setRegisterForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="form-row">
                    <label>Jelszó</label>
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => {
                        const pwd = e.target.value;
                        setRegisterForm((prev) => ({
                          ...prev,
                          password: pwd,
                        }));
                        setPasswordChecks(computePasswordChecks(pwd));
                      }}
                      required
                    />
                    <PasswordChecklist checks={passwordChecks} />
                  </div>

                  <div className="form-row form-row--split">
                    <div>
                      <label>Nem</label>
                      <select
                        value={registerForm.gender}
                        onChange={(e) =>
                          setRegisterForm((prev) => ({
                            ...prev,
                            gender: e.target.value,
                          }))
                        }
                      >
                        <option value="">Válassz…</option>
                        <option value="male">Férfi</option>
                        <option value="female">Nő</option>
                        <option value="other">
                          Egyéb / Nem szeretném megadni
                        </option>
                      </select>
                    </div>
                    <div>
                      <label>Születési idő</label>
                      <input
                        type="date"
                        value={registerForm.birthDate}
                        onChange={(e) =>
                          setRegisterForm((prev) => ({
                            ...prev,
                            birthDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={!passwordOk}
                  >
                    Regisztráció
                  </button>
                </form>
              )}

              {view === "verify" && (
                <form className="form" onSubmit={handleVerifySubmit}>
                  <p className="info-text">
                    Megerősítő kódot küldtünk a(z){" "}
                    <strong>{registerForm.email || "…"}</strong> címre.
                  </p>
                  <div className="form-row">
                    <label>Hitelesítő kód</label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="primary-button">
                    Email hitelesítése
                  </button>
                </form>
              )}

              {view === "login" && (
                <form className="form" onSubmit={handleLoginSubmit}>
                  <div className="form-row">
                    <label>Felhasználónév</label>
                    <input
                      type="text"
                      value={loginForm.username}
                      onChange={(e) =>
                        setLoginForm((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label>Jelszó</label>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <button type="submit" className="primary-button">
                    Belépés
                  </button>
                </form>
              )}
            </div>
          )}

          <p className="footer">© {currentYear} VAG Fórum – saját projekt</p>
        </div>

        <div className="right-panel">
          {view === "home" && (
            <ForumPreview
              currentUser={currentUser}
              isLoggedIn={!!token}
              onGoToRegister={() => {
                setMessage("");
                setError("");
                setView("register");
              }}
              onGoToLogin={() => {
                setMessage("");
                setError("");
                setView("login");
              }}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
