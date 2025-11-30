// frontend/src/api/auth.js

// VITE_API_BASE_URL:
//   - local:  http://127.0.0.1:8000
//   - Render: https://vag-projekt.onrender.com
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function handleResponse(res) {
  let data = null;

  try {
    data = await res.json();
  } catch (e) {
    // ha nem JSON a válasz, marad null
  }

  if (!res.ok) {
    // a backend által küldött hibaobjektumot dobjuk tovább,
    // hogy a parseError normálisan tudjon vele dolgozni
    throw data || { detail: "Ismeretlen hiba történt." };
  }

  return data;
}

// ============== REGISZTRÁCIÓ ==============
export async function register(payload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

// ============== BELÉPÉS ==============
export async function login(username, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  return handleResponse(res);
}

// ============== EMAIL HITELESÍTÉS ==============
export async function verifyEmail(email, code) {
  const res = await fetch(`${API_BASE_URL}/api/auth/verify-email/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  return handleResponse(res);
}
