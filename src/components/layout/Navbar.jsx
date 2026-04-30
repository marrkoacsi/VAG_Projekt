import { useState } from "react";
import { Link } from "react-router-dom";
import handleLogout from "../auth/Logout.jsx";
import "../../styles/navbar.css";
import { useTheme } from "../../context/ThemeContext.jsx";

export default function Navbar() {
  const userStr = localStorage.getItem("user");
  const data = userStr ? JSON.parse(userStr) : {};
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();


  const closeMenu = () => {
    setOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
      <Link to="/" className="nav-logo" onClick={closeMenu}>VAG</Link>

        <div className="nav-toggle" onClick={() => setOpen(!open)}>
          ☰
        </div>

        <ul className={`nav-links ${open ? "active" : ""}`}>
          <li><Link to="/" onClick={closeMenu}>Főoldal</Link></li>
          <li className={`has-dropdown ${dropdownOpen ? 'open' : ''}`}>
            <div className="dropdown-toggle">
              <Link to="/forum" onClick={closeMenu}>Fórum</Link>
              <button
                className="dropdown-arrow"
                onClick={(e) => { e.preventDefault(); setDropdownOpen(!dropdownOpen); }}
                aria-label="Forum legördülő"
              >▾</button>
            </div>
            <ul className={`dropdown ${dropdownOpen ? 'open' : ''}`}>
              <li><Link to="/forum/vw" onClick={closeMenu}>Volkswagen</Link></li>
              <li><Link to="/forum/skoda" onClick={closeMenu}>Skoda</Link></li>
              <li><Link to="/forum/seat" onClick={closeMenu}>Seat</Link></li>
              <li><Link to="/forum/audi" onClick={closeMenu}>Audi</Link></li>
            </ul>
          </li>
          {!data.username && <li><Link to="/auth" className="login-btn" onClick={closeMenu}>Bejelentkezés</Link></li>}
          {data.username && (
            <li>
              <Link to="/profile" className="username-display" onClick={closeMenu}>{data.username}</Link>
              <button onClick={handleLogout} className="logout-btn">Kijelentkezés</button>
            </li>
          )}
          <li><Link to="/premium" className="premium-btn" onClick={closeMenu}>Premium</Link></li>
         {Boolean(data.premium_type) && (
          <li><Link to="/tuning" className="tuning-btn" onClick={closeMenu}>Tuning</Link></li>
              )}
          <li>
            <button
              className="theme-toggle"
              onClick={() => {
                try { toggleTheme(); } catch (e) { console.error("Failed to toggle theme:", e); }
              }}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
