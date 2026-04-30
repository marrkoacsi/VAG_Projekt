import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { validateEmail, validatePassword, validateUsername, validatePasswordMatch } from "../utils/validation";
import { FormInput } from "../components/common/FormInput";
import { ErrorAlert, Loading } from "../components/common/Loading";
import "../styles/auth.css";

export default function Auth() { //usetate adat, a tobbi meg magatol ertheto remelem.
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => { //ezzel muukodik a valaszto.
    const tab = searchParams.get("tab");
    if (tab === "register") {
      setActiveTab("register");
    }
  }, [searchParams]);

  const validateLoginForm = () => { //hiba tarolo
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Az email kötelező";
    } else if (!validateEmail(email)) {
      newErrors.email = "Érvénytelen email cím";
    }

    if (!password.trim()) {
      newErrors.password = "A jelszó kötelező";
    } else if (!validatePassword(password)) {
      newErrors.password = "A jelszónak legalább 6 karakter hosszúnak kell lennie";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Az email kötelező";
    } else if (!validateEmail(email)) {
      newErrors.email = "Érvénytelen email cím";
    }

    if (!username.trim()) {
      newErrors.username = "A felhasználónév kötelező";
    } else if (!validateUsername(username)) {
      newErrors.username = "A felhasználónév 3-20 karakter közötti";
    }

    if (!password.trim()) {
      newErrors.password = "A jelszó kötelező";
    } else if (!validatePassword(password)) {
      newErrors.password = "A jelszónak legalább 6 karakter hosszúnak kell lennie";
    }

    if (!passwordConfirm.trim()) {
      newErrors.passwordConfirm = "A jelszó megerősítése kötelező";
    } else if (!validatePasswordMatch(password, passwordConfirm)) {
      newErrors.passwordConfirm = "A jelszavak nem egyeznek";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateLoginForm()) return;

    setLoading(true);
    try {
      const data = await api.login(email, password);

      if (data.success) {
        login({ username: data.username, email: data.email, id: data.id, premium_type: data.premium_type });
        navigate("/");
        window.location.reload();
      } else {
        setGeneralError(data.message || "Bejelentkezési hiba");
      }
    } catch (error) {
      setGeneralError("Hiba történt. Kérjük próbálja újra később.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateRegisterForm()) return;

    setLoading(true);
    try {
      const data = await api.register({
        email,
        username,
        password,
        password_confirm: passwordConfirm,
        birth_date: birthDate,
        gender,
      });

      if (data.success) {
        navigate("/verify-registration", { state: { email } });
      } else {
        setGeneralError(data.message || "Regisztrációs hiba");
      }
    } catch (error) {
      setGeneralError("Hiba történt. Kérjük próbálja újra később.");
      console.error("Register error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGeneralError("");
    setLoading(true);
    try {
      const data = await api.googleLogin(credentialResponse.credential);

      if (data.success) {
        login({ username: data.username, email: data.email, id: data.id, premium_type: data.premium_type });
        navigate("/");
        window.location.reload();
      } else {
        setGeneralError(data.message || "Google bejelentkezési hiba");
      }
    } catch (error) {
      setGeneralError("Google bejelentkezési hiba");
      console.error("Google login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => { //ujra nullazom a formot ha valtoztat a tabon.
    setEmail("");
    setPassword("");
    setUsername("");
    setPasswordConfirm("");
    setBirthDate("");
    setGender("");
    setErrors({});
    setGeneralError("");
  };

  if (loading) return <Loading />;

  return (
    <div className="auth-container">
      <div className="auth-left">
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("login");
                resetForm();
                navigate("/auth", { replace: true });
              }}
            >
              Bejelentkezés
            </button>
            <button
              className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("register");
                resetForm();
                navigate("/auth?tab=register", { replace: true });
              }}
            >
              Regisztráció
            </button>
          </div>

          {activeTab === "login" ? (
            <>
              <h1>Bejelentkezés</h1>
              <p className="auth-subtitle">VAG Fórum Közösség</p>

              {generalError && (
                <ErrorAlert message={generalError} onClose={() => setGeneralError("")} />
              )}

              <form onSubmit={handleLogin} className="auth-form">
                <FormInput
                  label="E-mail cím:"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pelda@pelda.com"
                  error={errors.email}
                  required
                />

                <FormInput
                  label="Jelszó:"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Legalább 6 karakter"
                  error={errors.password}
                  required
                />

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? "Bejelentkezés..." : "Bejelentkezés"}
                </button>
              </form>

              <div className="auth-divider"><span>vagy</span></div>

              <div className="google-login">
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setGeneralError("Google bejelentkezési hiba")} />
              </div>
            </>
          ) : (
            <>
              <h1>Regisztráció</h1>
              <p className="auth-subtitle">Csatlakozz a VAG Fórumhoz</p>

              {generalError && (
                <ErrorAlert message={generalError} onClose={() => setGeneralError("")} />
              )}

              <form onSubmit={handleRegister} className="auth-form">
                <FormInput
                  label="E-mail cím:"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pelda@pelda.com"
                  error={errors.email}
                  required
                />

                <FormInput
                  label="Felhasználónév:"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="3-20 karakter"
                  error={errors.username}
                  required
                />

                <FormInput
                  label="Jelszó:"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Legalább 6 karakter"
                  error={errors.password}
                  required
                />

                <FormInput
                  label="Jelszó megerősítése:"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Jelszó újra"
                  error={errors.passwordConfirm}
                  required
                />

                <div className="form-row">
                  <FormInput
                    label="Születési dátum:"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                  />

                  <div className="form-group">
                    <label>Nem:</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Válassz</option>
                      <option value="male">Férfi</option>
                      <option value="female">Nő</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? "Regisztráció..." : "Regisztráció"}
                </button>
              </form>

              <div className="auth-divider"><span>vagy</span></div>

              <div className="google-login">
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setGeneralError("Google regisztrációs hiba")} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
