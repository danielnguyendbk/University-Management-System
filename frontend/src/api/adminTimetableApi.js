import axios from "axios";
import { API_BASE_URL, getStoredToken } from "../services/app";
import { unwrapApiResponse } from "../utils/apiResponse";
import {
  normalizeBuildingTimetable,
  normalizeCalendarBlock,
  normalizeSchedule,
} from "../utils/adminTimetableNormalizers";

const adminTimetableClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

adminTimetableClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getSemesters() {
  const response = await adminTimetableClient.get("/admin/semesters");
  return unwrapApiResponse(response) ?? [];
}

export async function getSemesterWeeks(semesterId) {
  const response = await adminTimetableClient.get("/admin/semester-weeks", {
    params: { semesterId },
  });
  return unwrapApiResponse(response) ?? [];
}

export async function getCourseSections(semesterId) {
  const response = await adminTimetableClient.get("/admin/course-sections", {
    params: { semesterId },
  });
  return unwrapApiResponse(response) ?? [];
}

export async function getBuildings() {
  const response = await adminTimetableClient.get("/admin/buildings");
  return unwrapApiResponse(response) ?? [];
}

export async function getRooms() {
  const response = await adminTimetableClient.get("/admin/rooms");
  return unwrapApiResponse(response) ?? [];
}

export async function getTimeSlots() {
  const response = await adminTimetableClient.get("/admin/time-slots");
  return unwrapApiResponse(response) ?? [];
}

export async function getSchedules(semesterId) {
  const response = await adminTimetableClient.get("/admin/schedules", {
    params: { semesterId },
  });
  return (unwrapApiResponse(response) ?? []).map(normalizeSchedule).filter(Boolean);
}

export async function createSchedule(payload) {
  const response = await adminTimetableClient.post("/admin/schedules", payload);
  return normalizeSchedule(unwrapApiResponse(response));
}

export async function updateSchedule(scheduleId, payload) {
  const response = await adminTimetableClient.put(`/admin/schedules/${scheduleId}`, payload);
  return normalizeSchedule(unwrapApiResponse(response));
}

export async function deleteSchedule(scheduleId) {
  const response = await adminTimetableClient.delete(`/admin/schedules/${scheduleId}`);
  return unwrapApiResponse(response);
}

export async function generateTimetable(semesterId) {
  const response = await adminTimetableClient.post("/admin/timetable/generate", null, {
    params: { semesterId },
  });
  return unwrapApiResponse(response);
}

export async function publishTimetable(semesterId) {
  const response = await adminTimetableClient.post("/admin/timetable/publish", null, {
    params: { semesterId },
  });
  return unwrapApiResponse(response);
}

export async function lockTimetable(semesterId) {
  const response = await adminTimetableClient.post("/admin/timetable/lock", null, {
    params: { semesterId },
  });
  return unwrapApiResponse(response);
}

export async function unpublishTimetable(semesterId) {
  const response = await adminTimetableClient.post("/admin/timetable/unpublish", null, {
    params: { semesterId },
  });
  return unwrap(response);
}

export async function getCalendarBlocks(semesterId) {
  const response = await adminTimetableClient.get("/admin/calendar-blocks", {
    params: { semesterId },
  });
  return (unwrapApiResponse(response) ?? []).map(normalizeCalendarBlock).filter(Boolean);
}

export async function createCalendarBlock(payload) {
  const response = await adminTimetableClient.post("/admin/calendar-blocks", payload);
  return normalizeCalendarBlock(unwrapApiResponse(response));
}

export async function updateCalendarBlock(id, payload) {
  const response = await adminTimetableClient.put(`/admin/calendar-blocks/${id}`, payload);
  return normalizeCalendarBlock(unwrapApiResponse(response));
}

export async function deleteCalendarBlock(id) {
  const response = await adminTimetableClient.delete(`/admin/calendar-blocks/${id}`);
  return unwrapApiResponse(response);
}

export async function getFullTimetable({ semesterId, fromDate, toDate, buildingId }) {
  const response = await adminTimetableClient.get("/admin/timetable/full", {
    params: { semesterId, fromDate, toDate, buildingId },
  });
  return (unwrapApiResponse(response) ?? []).map(normalizeBuildingTimetable).filter(Boolean);
}

export async function downloadScheduleImportTemplate() {
  const response = await adminTimetableClient.get("/admin/timetable/import/template", {
    responseType: "blob",
  });
  return response?.data ?? null;
}

export async function previewScheduleImport(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await adminTimetableClient.post("/admin/schedules/import/preview", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return unwrapApiResponse(response) ?? [];
}

export async function confirmScheduleImport(payload = {}) {
  const response = await adminTimetableClient.post("/admin/schedules/import/confirm", payload);
  return unwrapApiResponse(response);
}

export async function importTimetable(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await adminTimetableClient.post("/admin/timetable/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response?.data ?? null;
}
