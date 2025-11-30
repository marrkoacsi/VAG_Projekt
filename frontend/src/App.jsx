import { useState, useEffect } from "react";
import { register, login, verifyEmail } from "./api/auth";
import { computePasswordChecks } from "./utils/passwordUtils";
import { parseError } from "./utils/errorParser";
import ForumPreview from "./components/ForumPreview";
import RegisterForm from "./components/RegisterForm";
import VerifyForm from "./components/VerifyForm";
import LoginForm from "./components/LoginForm";
import ForumPage from "./components/ForumPage"; // ⬅️ ÚJ IMPORT
import "./App.css";

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [view, setView] = useState("home");

  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "", // ⬅️ ÚJ MEZŐ
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

    // ⬅️ 1: jelszó erősség ellenőrzés
    const isStrong = Object.values(passwordChecks).every(Boolean);
    if (!isStrong) {
      setError("A jelszó nem felel meg minden feltételnek.");
      return;
    }

    // ⬅️ 2: két jelszó egyezésének ellenőrzése
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("A jelszavak nem egyeznek.");
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
      setMessage(
        data.message || "Email sikeresen megerősítve! Most már be tudsz lépni."
      );
      setView("login");
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

      const user = {
        username: data.username || loginForm.username,
        email: data.email || "",
      };

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
      confirmPassword: "", // ⬅️ itt is resetelünk
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

          {view !== "home" && (
            <div className="auth-card">
              {view === "register" && (
                <RegisterForm
                  registerForm={registerForm}
                  setRegisterForm={setRegisterForm}
                  passwordChecks={passwordChecks}
                  setPasswordChecks={setPasswordChecks}
                  passwordOk={passwordOk}
                  onSubmit={handleRegisterSubmit}
                  message={message}
                  error={error}
                />
              )}

              {view === "verify" && (
                <VerifyForm
                  email={registerForm.email}
                  verificationCode={verificationCode}
                  setVerificationCode={setVerificationCode}
                  onSubmit={handleVerifySubmit}
                  message={message}
                  error={error}
                />
              )}

              {view === "login" && (
                <LoginForm
                  loginForm={loginForm}
                  setLoginForm={setLoginForm}
                  onSubmit={handleLoginSubmit}
                  message={message}
                  error={error}
                />
              )}
            </div>
          )}

          <p className="footer">© {currentYear} VAG Fórum – saját projekt</p>
        </div>

        <div className="right-panel">
          {view === "home" && (
            <>
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

              {/* ⬅️ Itt jelenik meg a valódi fórum oldal */}
              <ForumPage />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
