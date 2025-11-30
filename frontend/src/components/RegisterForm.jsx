import PasswordChecklist from "./PasswordChecklist";
import { computePasswordChecks } from "../utils/passwordUtils";

function RegisterForm({
  registerForm,
  setRegisterForm,
  passwordChecks,
  setPasswordChecks,
  passwordOk,
  onSubmit,
  message,
  error,
}) {
  const passwordsMatch =
    registerForm.password &&
    registerForm.confirmPassword &&
    registerForm.password === registerForm.confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!passwordsMatch) {
      return;
    }

    onSubmit(e);
  };

  return (
    <>
      {message && <div className="alert alert--success">{message}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      <form className="form" onSubmit={handleSubmit}>
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

        {/* JELSZÓ 1 */}
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

        {/* JELSZÓ MEGERŐSÍTÉS */}
        <div className="form-row">
          <label>Jelszó megerősítése</label>
          <input
            type="password"
            value={registerForm.confirmPassword || ""}
            onChange={(e) =>
              setRegisterForm((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            required
          />
          {!passwordsMatch && registerForm.confirmPassword && (
            <small className="form-error">
              A jelszavak nem egyeznek.
            </small>
          )}
        </div>

        <div className="form-row form-row--split">
          <div>
            <label>Nem</label>
            <select
              required
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
              <option value="other">Egyéb / Nem szeretném megadni</option>
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
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="primary-button"
          disabled={!passwordOk || !passwordsMatch}
        >
          Regisztráció
        </button>
      </form>
    </>
  );
}

export default RegisterForm;
