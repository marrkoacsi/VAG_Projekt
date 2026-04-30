/*import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/auth?tab=register");
  }, [navigate]);

  return null;
}

  const validateForm = () => {
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateForm()) return;

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
        navigate("/code");
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

  if (loading) return <Loading />;

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Regisztráció</h1>
        <p className="register-subtitle">Csatlakozz a VAG Fórumhoz</p>

        {generalError && (
          <ErrorAlert message={generalError} onClose={() => setGeneralError("")} />
        )}

        <form onSubmit={handleRegister} className="register-form">
          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            error={errors.email}
            required
          />

          <FormInput
            label="Felhasználónév"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="3-20 karakter"
            error={errors.username}
            required
          />

          <FormInput
            label="Jelszó"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Legalább 6 karakter"
            error={errors.password}
            required
          />

          <FormInput
            label="Jelszó megerősítése"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Ismételd meg a jelszót"
            error={errors.passwordConfirm}
            required
          />

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="birthDate">Születési dátum</label>
              <input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Nem</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Válassz...</option>
                <option value="male">Férfi</option>
                <option value="female">Nő</option>
              </select>
            </div>
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Regisztrálás..." : "Regisztrálás"}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Már van fiókod?{" "}
            <Link to="/auth" className="auth-link">
              Bejelentkezés
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    // atkuldjuk a felhasznalot az auth-ra
    navigate("/auth?tab=register", { replace: true });
  }, [navigate]);

  return null;
}