const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

async function handleResponse(res) {
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    // nincs JSON
  }
  if (!res.ok) {
    throw data || { detail: "Ismeretlen hiba" };
  }
  return data;
}

export async function register(payload) {
  const res = await fetch(`${API_BASE}/api/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function verifyEmail(email, code) {
  const res = await fetch(`${API_BASE}/api/auth/verify-email/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  return handleResponse(res);
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}
