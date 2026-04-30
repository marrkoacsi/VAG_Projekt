import { useState } from "react";

export default function LoginForm({ onLogin, loading, error }) {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData);
  };

  return (
    <div className="login-form">
      <h2>Bejelentkezés</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email cím:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="email@pelda.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Jelszó:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Jelszó"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Bejelentkezés..." : "Bejelentkezés"}
        </button>
      </form>

      <div className="login-links">
        <a href="/reg" className="link">Még nincs fiókod? Regisztrálj!</a>
        <a href="#" className="link">Elfelejtett jelszó?</a>
      </div>
    </div>
  );
}
