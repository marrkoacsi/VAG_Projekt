import { useState, useEffect } from "react";
import ForumPreview from "./components/ForumPreview";
import AuthPage from "./AuthPage";
import "./App.css";

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [view, setView] = useState("home");      // "home" vagy "auth"
  const [authMode, setAuthMode] = useState("login"); // "login" vagy "register"

  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

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

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const handleLoginSuccess = (user, token, message) => {
    setToken(token);
    setCurrentUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    // ha kell, a message-et is eltárolhatod külön state-be
    setView("home");
  };

  const currentYear = new Date().getFullYear();

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

          {view === "auth" && (
            <AuthPage mode={authMode} onLoginSuccess={handleLoginSuccess} />
          )}

          <p className="footer">© {currentYear} VAG Fórum – saját projekt</p>
        </div>

        <div className="right-panel">
          {view === "home" && (
            <ForumPreview
              currentUser={currentUser}
              isLoggedIn={!!token}
              onGoToRegister={() => {
                setAuthMode("register");
                setView("auth");
              }}
              onGoToLogin={() => {
                setAuthMode("login");
                setView("auth");
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
