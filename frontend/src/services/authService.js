import { API_BASE_URL, clearStoredToken, getStoredToken, setStoredToken, parseApiError } from "./app";

async function request(path, options = {}) {
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

export async function login(credentials) {
  const payload = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  const token = payload?.data?.token;
  if (token) {
    setStoredToken(token);
  }

  return payload?.data;
}

export async function getCurrentUser() {
  const payload = await request("/auth/me", {
    method: "GET",
  });

  return payload?.data;
}

export async function changePassword(body) {
  const payload = await request("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return payload?.data;
}

export function logout() {
  clearStoredToken();
}

export { getStoredToken };