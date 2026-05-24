import { request } from "./apiClient";

export async function getStudentTimetable(fromDate, toDate) {
  const params = new URLSearchParams({
    fromDate,
    toDate,
  });

  const payload = await request(`/student/timetable?${params.toString()}`, {
    method: "GET",
  });

  return payload?.data ?? [];
}

export async function getSemesterWeeks(semesterId) {
  const payload = await request(`/student/timetable/semesters/${semesterId}/weeks`, {
    method: "GET",
  });

  return payload?.data ?? [];
}

export async function getStudentCalendarBlocks(semesterId) {
  const payload = await request(`/student/timetable/calendar-blocks?semesterId=${semesterId}`, {
    method: "GET",
  });

  return payload?.data ?? [];
}

export async function getSectionOptions(semesterId) {
  const payload = await request(`/student/timetable/sections?semesterId=${semesterId}`, {
    method: "GET",
  });

  return payload?.data ?? [];
}

export async function getSectionTimetable(sectionId, fromDate, toDate) {
  const params = new URLSearchParams({
    fromDate,
    toDate,
  });
  const payload = await request(`/student/timetable/sections/${sectionId}?${params.toString()}`, {
    method: "GET",
  });

  return payload?.data ?? [];
}