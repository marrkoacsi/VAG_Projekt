import { useState } from "react";

export default function RegisterForm({ onRegister, loading, error }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    car_model: "",
    birth_date: ""
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
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert("A jelszavak nem egyeznek!");
      return;
    }

    if (formData.password.length < 6) {
      alert("A jelszónak legalább 6 karakter hosszúnak kell lennie!");
      return;
    }

    // Birth date validation
    if (!formData.birth_date) {
      alert("A születési dátum megadása kötelezõ!");
      return;
    }

    const birthDate = new Date(formData.birth_date);
    const today = new Date();
    const minDate = new Date('1950-01-01');
    
    // Check if birth date is before 1950
    if (birthDate < minDate) {
      alert("A születési dátum nem lehet korábbi mint 1950.01.01!");
      return;
    }
    
    // Check if user is at least 16 years old
    const ageInMs = today - birthDate;
    const ageInYears = Math.floor(ageInMs / (365.25 * 24 * 60 * 60 * 1000));
    
    if (ageInYears < 16) {
      alert("A regisztrációhoz legalább 16 évesnek kell lenned!");
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    onRegister(registerData);
  };

  return (
    <div className="register-form">
      <h2>Regisztráció</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="username">Felhasználónév:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={30}
              placeholder="felhasznalo123"
            />
          </div>

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
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="first_name">Keresztnév:</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              maxLength={50}
              placeholder="János"
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Vezetéknév:</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              maxLength={50}
              placeholder="Kiss"
            />
          </div>
        </div>

        <div className="form-group required">
          <label htmlFor="birth_date">Születési dátum:<span className="required">*</span></label>
          <input
            type="date"
            id="birth_date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            required
            min="1950-01-01"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="form-group">
          <label htmlFor="car_model">Autó modell (opcionális):</label>
          <input
            type="text"
            id="car_model"
            name="car_model"
            value={formData.car_model}
            onChange={handleChange}
            maxLength={100}
            placeholder="pl. VW Golf 8, Skoda Octavia..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">Jelszó:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Minimum 6 karakter"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Jelszó megerõsítése:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Jelszó újra"
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Regisztráció..." : "Regisztráció"}
          </button>
          <a href="/auth" className="btn btn-secondary">
            Már van fiókod? Bejelentkezés
          </a>
        </div>
      </form>
    </div>
  );
}
