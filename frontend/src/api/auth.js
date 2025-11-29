// API_BASE: csak domain, /api NÉLKÜL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function handleResponse(res) {
  if (!res.ok) {
    let data = {};
    try {
      data = await res.json();
    } catch (e) {
      // ha nem JSON a válasz, hagyjuk üresen
    }
    throw { status: res.status, data };
  }
  return res.json();
}

// REGISZTRÁCIÓ
export async function register(payload) {
  const res = await fetch(`${API_BASE_URL}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw { status: res.status, data };
  }

  return res.json();
}

// BELÉPÉS
export async function login(payload) {
  const res = await fetch(`${API_BASE}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// EMAIL HITELESÍTÉS
export async function verifyEmail(code) {
  const res = await fetch(`${API_BASE}/api/auth/verify-email/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  return handleResponse(res);
}
