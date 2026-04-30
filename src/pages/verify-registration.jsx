import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../utils/api";
import { FormInput } from "../components/common/FormInput";
import { ErrorAlert, Loading } from "../components/common/Loading";
import "../styles/auth.css";

export default function VerifyRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // megnezem hogy van e email a state-ben vagy a query-ben, ha nincs akkor visszaviszem a regisztrációs oldalra
    const stateEmail = location.state?.email;
    const params = new URLSearchParams(location.search);
    const queryEmail = params.get("email");
    
    if (stateEmail) {
      setEmail(stateEmail);
    } else if (queryEmail) {
      setEmail(queryEmail);
    } else {
      // ha nincs ilyen email tovabbitom
      navigate("/auth?tab=register");
    }
  }, [location, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Az email kötelező";
    } else if (!email.includes("@")) {
      newErrors.email = "Érvénytelen email cím";
    }

    if (!code.trim()) {
      newErrors.code = "A megerősítő kód kötelező";
    } else if (code.length !== 6) {
      newErrors.code = "A kódnak 6 karakterből kell állnia";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/code.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Sikeres regisztráció! Most már bejelentkezhetsz.");
        setTimeout(() => {
          navigate("/auth", { 
            state: { 
              message: "Sikeres regisztráció! Most már bejelentkezhetsz." 
            } 
          });
        }, 2000);
      } else {
        setGeneralError(data.message || "Hibás megerősítő kód");
      }
    } catch (error) {
      setGeneralError("Hiba történt. Kérjük próbálja újra később.");
      console.error("Verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setGeneralError("");
    setSuccessMessage("");
    setResendLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/resend_verification.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Új megerősítő kód elküldve az email címére.");
      } else {
        setGeneralError(data.message || "Hiba a kód újraküldésekor");
      }
    } catch (error) {
      setGeneralError("Hiba történt. Kérjük próbálja újra később.");
      console.error("Resend error:", error);
    } finally {
      setResendLoading(false);
    }
  };

  if (loading && !resendLoading) return <Loading />;

  return (
    <div className="auth-container">
      <div className="auth-left"></div>
      <div className="auth-right">
        <div className="auth-card">
          <h1>Regisztráció megerősítése</h1>
          <p className="auth-subtitle">
            Küldtünk egy 6 számjegyű kódot a következő email címre: <strong>{email}</strong>
          </p>

          {successMessage && (
            <div style={{
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid #22c55e",
              borderRadius: "6px",
              padding: "12px 16px",
              marginBottom: "20px",
              color: "#16a34a",
              fontSize: "13px"
            }}>
              {successMessage}
            </div>
          )}

          {generalError && (
            <ErrorAlert message={generalError} onClose={() => setGeneralError("")} />
          )}

          <form onSubmit={handleVerify} className="auth-form">
            <FormInput
              label="Email cím:"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pelda@pelda.com"
              error={errors.email}
              required
              disabled
            />

            <FormInput
              label="Megerősítő kód:"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              error={errors.code}
              required
              maxLength={6}
            />

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Ellenőrzés..." : "Megerősítés"}
            </button>
          </form>

          <div className="auth-resend" style={{ textAlign: "center", marginTop: "20px" }}>
            <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "10px" }}>
              Nem kapta meg a kódot?
            </p>
            <button 
              type="button" 
              className="auth-link-btn" 
              onClick={handleResendCode}
              disabled={resendLoading}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent)",
                textDecoration: "underline",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              {resendLoading ? "Küldés..." : "Kód újraküldése"}
            </button>
          </div>

          <div className="auth-back" style={{ textAlign: "center", marginTop: "20px" }}>
            <button 
              type="button" 
              className="auth-link-btn" 
              onClick={() => navigate("/auth")}
              style={{
                background: "none",
                border: "none",
                color: "var(--muted)",
                textDecoration: "underline",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Vissza a bejelentkezéshez
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
