import { API_BASE_URL, getStoredToken, parseApiError } from "./app";

export async function request(path, options = {}) {
  const token = sessionStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    sessionStorage.clear();
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (response.status === 403) {
    console.warn("Truy cập bị từ chối (403 Forbidden)");
    throw new Error("Bạn không có quyền truy cập chức năng này.");
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}