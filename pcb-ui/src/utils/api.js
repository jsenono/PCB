import { API_BASE } from "./constants";

// ─── API helpers ────────────────────────────────────────────────────────────
export const api = {
  get: (path) => fetch(`${API_BASE}${path}`).then((r) => r.json()),
  post: (path, body) =>
    fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then((r) => r.json()),
  put: (path, body) =>
    fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  delete: (path) => fetch(`${API_BASE}${path}`, { method: "DELETE" }),
  postQuery: (path) =>
    fetch(`${API_BASE}${path}`, { method: "POST" }).then((r) => r.json()),
};
