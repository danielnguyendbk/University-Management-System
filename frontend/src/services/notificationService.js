import { API_BASE_URL, getStoredToken, parseApiError } from "./app";

async function request(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
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

function toQuery(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function sendNotification(body) {
  const payload = await request("/notifications/send", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return payload?.data;
}

export async function replyToNotification(id, body) {
  const payload = await request(`/notifications/${id}/reply`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return payload?.data;
}

export async function listMyNotifications(params) {
  const payload = await request(`/notifications/my${toQuery(params)}`);
  return payload?.data || { content: [], totalElements: 0, totalPages: 0, page: 0, size: params?.size || 10 };
}

export async function getQuickNotifications() {
  const payload = await request("/notifications/quick");
  return payload?.data || [];
}

export async function getUnreadCount() {
  const payload = await request("/notifications/unread-count");
  return Number(payload?.data?.unread_count ?? payload?.data?.unreadCount ?? 0);
}

export async function markNotificationAsRead(id) {
  const payload = await request(`/notifications/${id}/read`, { method: "PATCH" });
  return payload?.data;
}

export async function markAllNotificationsAsRead() {
  const payload = await request("/notifications/read-all", { method: "PATCH" });
  return payload?.data;
}

export async function getNotification(id) {
  const payload = await request(`/notifications/${id}`);
  return payload?.data;
}

export async function listSentNotifications(params) {
  const payload = await request(`/notifications/sent${toQuery(params)}`);
  return payload?.data || { content: [], totalElements: 0, totalPages: 0, page: 0, size: params?.size || 10 };
}

export async function getNotificationStats(id) {
  const payload = await request(`/notifications/${id}/stats`);
  return payload?.data;
}

export async function archiveNotification(id) {
  const payload = await request(`/notifications/${id}/archive`, { method: "PATCH" });
  return payload?.data;
}

export async function getAvailableTargets() {
  const payload = await request("/notifications/available-targets");
  return payload?.data?.targets || [];
}
