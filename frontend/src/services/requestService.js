import { API_BASE_URL, getStoredToken, parseApiError } from "./app";

async function request(path, options = {}) {
  const token = getStoredToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
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

  const payload = await response.json();
  return payload?.data;
}

export function getPendingRequests(lecturerId) {
  return request(`/lecturers/${lecturerId}/requests/pending`);
}

export function getRequestById(lecturerId, requestId) {
  return request(`/lecturers/${lecturerId}/requests/${requestId}`);
}

export function approveRequest(lecturerId, requestId, note = "") {
  return request(`/lecturers/${lecturerId}/requests/${requestId}/approve`, {
    method: "POST",
    body: JSON.stringify(note ? { note } : {}),
  });
}

export function rejectRequest(lecturerId, requestId, note = "") {
  return request(`/lecturers/${lecturerId}/requests/${requestId}/reject`, {
    method: "POST",
    body: JSON.stringify(note ? { note } : {}),
  });
}

export function getStudentRequests(studentId) {
  return request(`/students/${studentId}/requests`);
}

export function submitStudentRequest(studentId, payload) {
  return request(`/students/${studentId}/requests`, {
    method: "POST",
    body: payload,
  });
}