import { Link } from "react-router-dom";

const DEFAULT_AVATAR = "https://via.placeholder.com/150";

export default function ProfileCard({ user, isOwnProfile, onEditClick }) {
  return (
    <div className="profile-field-list">
        <p>
          <span>Vezetéknév:</span>
          {user?.last_name || "Nincs adat"}
        </p>
        
        <p>
          <span>Keresztnév:</span>
          {user?.first_name || "Nincs adat"}
        </p>
        
        <p>
          <span>Autó:</span>
          {user?.car_model || "Nincs adat"}
        </p>
        
        <p>
          <span>Csatlakozott:</span>
          {user?.registration_date ? new Date(user.registration_date).toLocaleDateString('hu-HU') : "Nincs adat"}
        </p>
        
        <p>
          <span>Születési dátum:</span>
          {user?.birth_date ? new Date(user.birth_date).toLocaleDateString('hu-HU') : "Nincs adat"}
        </p>
        
        {Number(user?.premium_type) > 0 && (
          <p>
            <span>Premium:</span>
            <span className="profile-badge premium">Premium Felhasználó</span>
          </p>
        )}
        
        {Number(user?.verified) > 0 && (
          <p>
            <span>Státusz:</span>
            <span className="profile-badge verified">Ellenörzött Felhasználó</span>
          </p>
        )}
    </div>
  );
}
