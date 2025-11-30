// src/api/auth.js

// .env-ben: VITE_API_BASE_URL = https://vag-projekt.onrender.com
// FONTOS: ne legyen a végén perjel, ne legyen benne /api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://vag-projekt.onrender.com";

async function handleResponse(res) {
  let data = null;

  try {
    data = await res.json();
  } catch (e) {
    // ha nem JSON a válasz (pl. 204), marad null
  }

  if (!res.ok) {
    // így tudod UI-ban kiolvasni: err.status, err.data
    throw { status: res.status, data };
  }

  return data;
}

/**
 * REGISZTRÁCIÓ
 * payload pl.:
 * {
 *   username: "marko",
 *   email: "marko@valami.com",
 *   password: "Teszt123!",
 *   gender: "male",
 *   birth_date: "2005-10-31"
 * }
 */
export async function register(payload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

/**
 * BELÉPÉS
 * payload:
 * {
 *   username: "marko",
 *   password: "Teszt123!"
 * }
 */
export async function login(payload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

/**
 * EMAIL HITELESÍTÉS
 * A backend ezt várja:
 * {
 *   "email": "...",
 *   "code": "123456"
 * }
 *
 * Paraméter: { email, code }
 */
export async function verifyEmail({ email, code }) {
  const res = await fetch(`${API_BASE_URL}/api/auth/verify-email/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  return handleResponse(res);
}
