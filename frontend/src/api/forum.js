const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://<backend-url>/api";

async function apiRequest(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include", // ha cookie-s auth van
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || "API hiba");
  }

  return res.json();
}

export function getCategories() {
  return apiRequest("/forum/categories/");
}

export function getTopics(categoryId) {
  const qs = categoryId ? `?category=${categoryId}` : "";
  return apiRequest(`/forum/topics/${qs}`);
}

export function createTopic({ categoryId, title }) {
  return apiRequest("/forum/topics/", {
    method: "POST",
    body: JSON.stringify({
      category_id: categoryId,
      title,
    }),
  });
}

export function getPosts(topicId) {
  return apiRequest(`/forum/posts/?topic=${topicId}`);
}

export function createPost({ topicId, content }) {
  return apiRequest("/forum/posts/", {
    method: "POST",
    body: JSON.stringify({
      topic: topicId,
      content,
    }),
  });
}
