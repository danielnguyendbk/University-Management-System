import { clearStoredToken, getStoredToken, setStoredToken } from "./app";
import { request } from "./apiClient";

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

export function logout() {
  clearStoredToken();
}

export { getStoredToken };