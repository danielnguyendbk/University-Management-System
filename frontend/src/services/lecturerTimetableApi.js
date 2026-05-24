import { request } from "./apiClient";

export async function getLecturerTimetable(fromDate, toDate) {
  const params = new URLSearchParams({
    fromDate,
    toDate,
  });

  const payload = await request(`/lecturer/timetable?${params.toString()}`, {
    method: "GET",
  });

  return payload?.data ?? [];
}

export async function getLecturerSemesterWeeks(semesterId) {
  const payload = await request(`/lecturer/timetable/semesters/${semesterId}/weeks`, {
    method: "GET",
  });

  return payload?.data ?? [];
}

export async function getLecturerCalendarBlocks(semesterId) {
  const payload = await request(`/lecturer/timetable/calendar-blocks?semesterId=${semesterId}`, {
    method: "GET",
  });

  return payload?.data ?? [];
}
