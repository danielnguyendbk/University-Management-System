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