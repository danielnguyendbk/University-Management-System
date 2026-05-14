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
