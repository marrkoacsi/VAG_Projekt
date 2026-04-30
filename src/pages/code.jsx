import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

const API_URL = "https://backend-bk14.onrender.com/profile_security.php";

export default function Code() {
  const navigate = useNavigate();

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;

  const [step, setStep] = useState("request"); // "request" | "confirm"
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");

  useEffect(() => {
    if (!userId) navigate("/login");
  }, [userId, navigate]);

  if (!userId) return null;

  // 1) Kód kérése emailre
  const requestPasswordCode = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request_password_change", userId }),
      });

      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        console.error("Nem JSON válasz:", raw);
        alert("Szerver hiba (nem JSON válasz). Nézd meg a konzolt!");
        return;
      }

      if (data.ok) {
        alert("Kód elküldve az emailedre.");
        setStep("confirm");
      } else {
        alert(data.error || "Hiba történt.");
      }
    } catch (err) {
      console.error(err);
      alert("Hiba történt a kód kérése során.");
    } finally {
      setLoading(false);
    }
  };

  // 2 Kód +új jelszó mentése
  const confirmPasswordChange = async (e) => {
    e.preventDefault();

    if (!code.trim() || !newPass || !newPass2) return alert("Tölts ki mindent!");
    if (newPass !== newPass2) return alert("Az új jelszavak nem egyeznek!");

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm_password_change",
          userId,
          code: code.trim(),
          new_password: newPass,
          new_password_confirm: newPass2,
        }),
      });

      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        console.error("Nem JSON válasz:", raw);
        alert("Szerver hiba (nem JSON válasz). Nézd meg a konzolt!");
        return;
      }

      if (data.ok) {
        alert("Jelszó sikeresen módosítva!");
        navigate("/profile");
      } else {
        alert(data.error || "Hibás kód vagy hiba.");
      }
    } catch (err) {
      console.error(err);
      alert("Hiba történt a mentés során.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-change-container">
      <div className="password-change-content">
        <div className="password-change-card">
          <h2 className="password-change-title">Jelszó módosítása</h2>

          {step === "request" ? (
            <>
              <p className="password-info-text">
                Küldünk egy 6 jegyű kódot az emailedre a jelszó módosításához.
              </p>
              <button 
                className="password-btn" 
                onClick={requestPasswordCode} 
                disabled={loading}
              >
                {loading ? "Küldés..." : "Kód kérése"}
              </button>
            </>
          ) : (
            <>
              <p className="password-info-text">
                Add meg a kapott kódot és az új jelszavadat.
              </p>
              <form onSubmit={confirmPasswordChange} className="password-form">
                <div className="password-form-group">
                  <label>Megerősítő kód:</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    required
                    maxLength={6}
                  />
                </div>

                <div className="password-form-group">
                  <label>Új jelszó:</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Legalább 6 karakter"
                    required
                  />
                </div>

                <div className="password-form-group">
                  <label>Új jelszó újra:</label>
                  <input
                    type="password"
                    value={newPass2}
                    onChange={(e) => setNewPass2(e.target.value)}
                    placeholder="Jelszó megerősítése"
                    required
                  />
                </div>

                <button type="submit" className="password-btn" disabled={loading}>
                  {loading ? "Mentés..." : "Megerősítés"}
                </button>
              </form>

              <div className="password-actions">
                <button
                  type="button"
                  className="password-btn password-btn-secondary"
                  onClick={requestPasswordCode}
                  disabled={loading}
                >
                  Új kód kérése
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
