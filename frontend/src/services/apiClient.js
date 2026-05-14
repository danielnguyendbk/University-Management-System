import { API_BASE_URL, getStoredToken, parseApiError } from "./app";

export async function request(path, options = {}) {
  const token = getStoredToken();

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

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}