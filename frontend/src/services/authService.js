import { getStoredToken } from "./app";
import { request } from "./apiClient";

export async function login(credentials) {
  const response = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  // response is the JSON body: { success, message, data: { token, username, role, fullName } }
  const payload = response?.data;

  if (payload && payload.token) {
    localStorage.setItem("token", payload.token);
    localStorage.setItem("user", JSON.stringify({
      username: payload.username,
      role: payload.role,
      fullName: payload.fullName
    }));
  }

  return payload;
}

export async function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }
  }

  const response = await request("/auth/me", {
    method: "GET",
  });

  return response?.data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export { getStoredToken };