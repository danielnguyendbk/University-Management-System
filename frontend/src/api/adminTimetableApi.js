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
  const response = await adminTimetableClient.get("/admin/timetable/semesters");
  return unwrapApiResponse(response) ?? [];
}

export async function getSemesterWeeks(semesterId) {
  const response = await adminTimetableClient.get(`/admin/timetable/semesters/${semesterId}/weeks`);
  return unwrapApiResponse(response) ?? [];
}

export async function getCourseSections(semesterId) {
  const response = await adminTimetableClient.get(`/admin/timetable/semesters/${semesterId}/sections`);
  return unwrapApiResponse(response) ?? [];
}

export async function getBuildings() {
  const response = await adminTimetableClient.get("/admin/timetable/buildings");
  return unwrapApiResponse(response) ?? [];
}

export async function getRooms() {
  const response = await adminTimetableClient.get("/admin/timetable/rooms");
  return unwrapApiResponse(response) ?? [];
}

export async function getTimeSlots() {
  const response = await adminTimetableClient.get("/admin/timetable/time-slots");
  return unwrapApiResponse(response) ?? [];
}

export async function getSchedules(semesterId) {
  const response = await adminTimetableClient.get("/admin/timetable/schedules", {
    params: { semesterId },
  });
  return (unwrapApiResponse(response) ?? []).map(normalizeSchedule).filter(Boolean);
}

export async function createSchedule(payload) {
  const response = await adminTimetableClient.post("/admin/timetable/schedules", payload);
  return normalizeSchedule(unwrapApiResponse(response));
}

export async function updateSchedule(scheduleId, payload) {
  const response = await adminTimetableClient.put(`/admin/timetable/schedules/${scheduleId}`, payload);
  return normalizeSchedule(unwrapApiResponse(response));
}

export async function deleteSchedule(scheduleId) {
  const response = await adminTimetableClient.delete(`/admin/timetable/schedules/${scheduleId}`);
  return unwrapApiResponse(response);
}

export async function generateTimetable(semesterId) {
  const response = await adminTimetableClient.post("/admin/timetable/generate", {
    semesterId,
  });
  return unwrapApiResponse(response);
}

export async function publishTimetable(semesterId) {
  const response = await adminTimetableClient.patch(`/admin/timetable/semesters/${semesterId}/publish`);
  return unwrapApiResponse(response);
}

export async function lockTimetable(semesterId) {
  const response = await adminTimetableClient.patch(`/admin/timetable/semesters/${semesterId}/lock`);
  return unwrapApiResponse(response);
}

export async function unpublishTimetable(semesterId) {
  const response = await adminTimetableClient.patch(`/admin/timetable/semesters/${semesterId}/unlock`);
  return unwrapApiResponse(response); // Assuming unwrap is a typo and should be unwrapApiResponse
}

export async function getCalendarBlocks(semesterId) {
  const response = await adminTimetableClient.get("/admin/timetable/calendar-blocks", {
    params: { semesterId },
  });
  return (unwrapApiResponse(response) ?? []).map(normalizeCalendarBlock).filter(Boolean);
}

export async function createCalendarBlock(payload) {
  const response = await adminTimetableClient.post("/admin/timetable/calendar-blocks", payload);
  return normalizeCalendarBlock(unwrapApiResponse(response));
}

export async function updateCalendarBlock(id, payload) {
  const response = await adminTimetableClient.put(`/admin/timetable/calendar-blocks/${id}`, payload);
  return normalizeCalendarBlock(unwrapApiResponse(response));
}

export async function deleteCalendarBlock(id) {
  const response = await adminTimetableClient.delete(`/admin/timetable/calendar-blocks/${id}`);
  return unwrapApiResponse(response);
}

export async function getFullTimetable({
  semesterId,
  weekNo,
  buildingId,
  roomId,
  sessionType,
  lecturerId,
  sectionId,
}) {
  const response = await adminTimetableClient.get("/admin/timetable/view", {
    params: {
      semesterId,
      weekNo,
      buildingId: buildingId || undefined,
      roomId: roomId || undefined,
      sessionType: sessionType || undefined,
      lecturerId: lecturerId || undefined,
      sectionId: sectionId || undefined,
    },
  });
  return unwrapApiResponse(response) ?? [];
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
  // Đặt Content-Type là undefined để đè lên mặc định 'application/json' của axios instance,
  // từ đó browser sẽ tự động set 'multipart/form-data; boundary=...'
  const response = await adminTimetableClient.post("/admin/timetable/import/preview", formData, {
    headers: {
      "Content-Type": undefined,
    },
  });
  return unwrapApiResponse(response) ?? [];
}

export async function confirmScheduleImport(payload = {}) {
  const response = await adminTimetableClient.post("/admin/timetable/import/confirm", payload);
  return unwrapApiResponse(response);
}

export async function importTimetable(file) {
  const formData = new FormData();
  formData.append("file", file);
  // Đặt Content-Type là undefined để đè lên mặc định 'application/json' của axios instance,
  // từ đó browser sẽ tự động set 'multipart/form-data; boundary=...'
  const response = await adminTimetableClient.post("/admin/timetable/import", formData, {
    headers: {
      "Content-Type": undefined,
    },
  });
  return response?.data ?? null;
}
