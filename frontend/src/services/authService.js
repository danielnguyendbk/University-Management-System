import { clearStoredToken, getStoredToken, setStoredToken } from "./app";
import { request } from "./apiClient";

const USER_STORAGE_KEY = "user";

function normalizeUser(payload) {
  if (!payload) return payload;
  const studentProfile = payload.studentProfile ?? payload.student ?? null;
  const lecturerProfile = payload.lecturerProfile ?? payload.lecturer ?? null;

  return {
    ...payload,
    role: payload.role ? String(payload.role).toUpperCase() : payload.role,
    status: payload.status ? String(payload.status).toLowerCase() : payload.status,
    studentId: payload.studentId ?? studentProfile?.studentId ?? null,
    studentCode: payload.studentCode ?? studentProfile?.studentCode ?? null,
    lecturerId: payload.lecturerId ?? lecturerProfile?.lecturerId ?? null,
    studentProfile,
    lecturerProfile,
  };
}

function persistUser(payload) {
  const normalized = normalizeUser(payload);
  if (!normalized) return normalized;

  if (normalized.token) {
    setStoredToken(normalized.token);
  }

  const token = normalized.token || getStoredToken();
  const storedUser = token && !normalized.token ? { ...normalized, token } : normalized;
  sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(storedUser));
  return storedUser;
}

export function getStoredUser() {
  const userStr = sessionStorage.getItem(USER_STORAGE_KEY);
  if (!userStr) return null;

  try {
    return normalizeUser(JSON.parse(userStr));
  } catch (e) {
    console.error("Error parsing user from sessionStorage", e);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export async function login(credentials) {
  const response = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  return persistUser(response?.data);
}

export async function getCurrentUser() {
  const response = await request("/auth/me", {
    method: "GET",
  });

  return persistUser(response?.data);
}

export async function changePassword(body) {
  const payload = await request("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return persistUser(payload?.data);
}

export function logout() {
  clearStoredToken();
  sessionStorage.removeItem(USER_STORAGE_KEY);
}

export async function forgotPassword(body) {
  const payload = await request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return payload?.data;
}

export async function verifyForgotPasswordOtp(body) {
  const payload = await request("/auth/forgot-password/verify-otp", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return payload?.data;
}

export async function resetPassword(body) {
  const payload = await request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return payload?.data;
}




export { getStoredToken };
