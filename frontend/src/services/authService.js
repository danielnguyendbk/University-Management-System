import { getStoredToken } from "./app";
import { request } from "./apiClient";

function normalizeUser(payload) {
  if (!payload) return payload;
  return {
    ...payload,
    role: payload.role ? String(payload.role).toUpperCase() : payload.role,
    status: payload.status ? String(payload.status).toLowerCase() : payload.status,
  };
}

export async function login(credentials) {
  const response = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  // response is the JSON body: { success, message, data: { token, username, role, fullName } }
  const payload = normalizeUser(response?.data);

  if (payload && payload.token) {
    sessionStorage.setItem("token", payload.token);
    sessionStorage.setItem("user", JSON.stringify({
      username: payload.username,
      role: payload.role,
      fullName: payload.fullName,
      forcePasswordChange: payload.forcePasswordChange,
      status: payload.status
    }));
  }

  return payload;
}

export async function getCurrentUser() {
  const userStr = sessionStorage.getItem("user");
  if (userStr) {
    try {
      return normalizeUser(JSON.parse(userStr));
    } catch (e) {
      console.error("Error parsing user from sessionStorage", e);
    }
  }

  const response = await request("/auth/me", {
    method: "GET",
  });

  return normalizeUser(response?.data);
}

export async function changePassword(body) {
  const payload = await request("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return normalizeUser(payload?.data);
}

export function logout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
}

export { getStoredToken };
