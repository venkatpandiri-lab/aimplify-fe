const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  getBootstrap: () => request("/api/bootstrap"),
  listAssets: (query = "") => request(`/api/assets${query}`),
  createSubmission: (payload) =>
    request("/api/submissions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listSubmissions: (status) =>
    request(`/api/submissions${status ? `?status=${encodeURIComponent(status)}` : ""}`),
};

