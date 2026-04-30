import { useState } from "react";

export default function ProfileEditForm({ 
  user, 
  onSave, 
  onCancel, 
  saving = false 
}) {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    car_model: user?.car_model || "",
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
    onSave(formData);
  };

  return (
    <div className="profile-edit-form">
      <h3>Profil Szerkesztése</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="first_name">Keresztnév:</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            maxLength={50}
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
          />
        </div>

        <div className="form-group">
          <label htmlFor="car_model">Autó modell:</label>
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

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? "Mentés..." : "Mentés"}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Mégsem
          </button>
        </div>
      </form>
    </div>
  );
}
