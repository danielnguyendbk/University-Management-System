export const API_BASE_URL = "http://localhost:8080/api";
export const AUTH_TOKEN_KEY = "token";

export function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function parseApiError(response) {
  try {
    const payload = await response.json();
    return payload?.message || "Request failed";
  } catch {
    return "Request failed";
  }
}