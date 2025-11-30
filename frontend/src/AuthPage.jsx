// frontend/src/AuthPage.jsx
import { useState, useEffect } from "react";
import { register, login, verifyEmail } from "./api/auth";
import { computePasswordChecks } from "./utils/passwordUtils";
import { parseError } from "./utils/errorParser";
import RegisterForm from "./components/RegisterForm";
import VerifyForm from "./components/VerifyForm";
import LoginForm from "./components/LoginForm";

function AuthPage({ mode = "login", onLoginSuccess }) {
  // "belső" nézet: register / login / verify
  const [authView, setAuthView] = useState(mode);

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

  // ha kívülről váltasz login / register között (ForumPreview gombjaival)
  useEffect(() => {
    setAuthView(mode);
    setMessage("");
    setError("");
  }, [mode]);

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
      setAuthView("verify");
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
        data.message ||
          "Email sikeresen megerősítve! Most már be tudsz lépni."
      );
      setAuthView("login");
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

      if (onLoginSuccess) {
        onLoginSuccess(user, data.token, data.message || "Sikeres belépés.");
      }
      // Itt már az App elrakja a tokent és visszavált "home"-ra
    } catch (err) {
      parseError(err, setError);
    }
  };

  const passwordOk = Object.values(passwordChecks).every(Boolean);

  return (
    <div className="auth-card">
      {authView === "register" && (
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

      {authView === "verify" && (
        <VerifyForm
          email={registerForm.email}
          verificationCode={verificationCode}
          setVerificationCode={setVerificationCode}
          onSubmit={handleVerifySubmit}
          message={message}
          error={error}
        />
      )}

      {authView === "login" && (
        <LoginForm
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          onSubmit={handleLoginSubmit}
          message={message}
          error={error}
        />
      )}
    </div>
  );
}

export default AuthPage;
