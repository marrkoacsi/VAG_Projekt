// frontend/src/api/forum.js

// ugyanazt használd, mint auth.js-ben
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://vag-projekt.onrender.com";

async function apiRequest(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let errorBody = null;
    try {
      errorBody = await res.json();
    } catch {
      // nem JSON, hagyjuk
    }
    const message =
      (errorBody && (errorBody.detail || errorBody.error)) ||
      res.statusText ||
      "API hiba";
    throw new Error(message);
  }

  return res.json();
}

// ⬇⬇⬇ ITT A LÉNYEG: /api/ prefix!

export function getCategories() {
  return apiRequest("/api/forum/categories/");
}

export function getTopics(categoryId) {
  const qs = categoryId ? `?category=${categoryId}` : "";
  return apiRequest(`/api/forum/topics/${qs}`);
}

export function createTopic({ categoryId, title }) {
  return apiRequest("/api/forum/topics/", {
    method: "POST",
    body: JSON.stringify({
      category_id: categoryId,
      title,
    }),
  });
}

export function getPosts(topicId) {
  return apiRequest(`/api/forum/posts/?topic=${topicId}`);
}

export function createPost({ topicId, content }) {
  return apiRequest("/api/forum/posts/", {
    method: "POST",
    body: JSON.stringify({
      topic: topicId,
      content,
    }),
  });
}
