// src/api/auth.js

// VITE_API_BASE_URL pl.:
// - lokalban:  http://127.0.0.1:8000/api
// - renderen:  https://vag-projekt.onrender.com/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function handleResponse(res) {
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // ha nem JSON, marad null
  }

  if (!res.ok) {
    throw { status: res.status, data };
  }

  return data;
}

// ============== REGISZTRÁCIÓ ==============
export async function register(payload) {
  const res = await fetch(`${API_BASE_URL}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

// ============== BELÉPÉS ==============
export async function login(payload) {
  const res = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

// ============== EMAIL HITELESÍTÉS ==============
export async function verifyEmail(email, code) {
  const res = await fetch(`${API_BASE_URL}/auth/verify-email/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  return handleResponse(res);
}
