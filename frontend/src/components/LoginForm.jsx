function LoginForm({ loginForm, setLoginForm, onSubmit, message, error }) {
  return (
    <>
      {message && <div className="alert alert--success">{message}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      <form className="form" onSubmit={onSubmit}>
        <div className="form-row">
  <label>Email cím</label>
  <input
    type="email"
    value={loginForm.email}
    onChange={(e) =>
      setLoginForm((prev) => ({
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
    </>
  );
}

export default LoginForm;
