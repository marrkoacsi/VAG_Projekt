import PasswordChecklist from "./PasswordChecklist";
import { computePasswordChecks }  from "../utils/passwordUtils";

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


  return (
    <>
      {message && <div className="alert alert--success">{message}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      <form className="form" onSubmit={onSubmit}>
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
    </>
  );
}

export default RegisterForm;