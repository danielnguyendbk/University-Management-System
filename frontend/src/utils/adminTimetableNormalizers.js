const pick = (obj, keys, fallback = null) => {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
  }
  return fallback;
};

export function normalizeSchedule(item = {}) {
  return {
    ...item,
    scheduleId: pick(item, ["scheduleId", "schedule_id", "id"]),
    sectionId: pick(item, ["sectionId", "section_id"]),
    sectionCode: pick(item, ["sectionCode", "section_code"]),
    courseCode: pick(item, ["courseCode", "course_code"]),
    courseName: pick(item, ["courseName", "course_name"]),
    lecturerId: pick(item, ["lecturerId", "lecturer_id"]),
    lecturerName: pick(item, ["lecturerName", "lecturer_name", "teacherName"]),
    roomId: pick(item, ["roomId", "room_id"]),
    roomCode: pick(item, ["roomCode", "room_code"]),
    roomName: pick(item, ["roomName", "room_name"]),
    dayOfWeek: pick(item, ["dayOfWeek", "day_of_week"]),
    sessionDate: pick(item, ["sessionDate", "session_date", "date"]),
    startTime: pick(item, ["startTime", "start_time"]),
    endTime: pick(item, ["endTime", "end_time"]),
    slotStart: pick(item, ["slotStart", "slot_start"]),
    slotEnd: pick(item, ["slotEnd", "slot_end"]),
    fromWeekNo: pick(item, ["fromWeekNo", "from_week_no"]),
    toWeekNo: pick(item, ["toWeekNo", "to_week_no"]),
    sessionType: pick(item, ["sessionType", "session_type"], "THEORY"),
    practiceGroupNo: pick(item, ["practiceGroupNo", "practice_group_no"]),
    status: pick(item, ["status", "sessionStatus", "session_status"], "SCHEDULED"),
    note: pick(item, ["note"], ""),
  };
}

export function normalizeCalendarBlock(item = {}) {
  const normalized = normalizeSchedule(item);

  return {
    ...normalized,
    id: normalized.scheduleId ?? normalized.id,
    title:
      normalized.courseName ||
      normalized.courseCode ||
      normalized.sectionCode ||
      "Lịch học",
    date: normalized.sessionDate,
    start: normalized.startTime,
    end: normalized.endTime,
  };
}

export function normalizeBuildingTimetable(data = {}) {
  if (Array.isArray(data)) {
    return data.map(normalizeViewSession);
  }
  // Legacy grouped structure
  return {
    ...data,
    schedules: Array.isArray(data.schedules)
      ? data.schedules.map(normalizeViewSession)
      : [],
    rooms: Array.isArray(data.rooms) ? data.rooms : [],
    buildings: Array.isArray(data.buildings) ? data.buildings : [],
  };
}

/** Normalize a single flat session row from /admin/timetable/view */
export function normalizeViewSession(item = {}) {
  return {
    sessionId: item.sessionId,
    scheduleId: item.scheduleId,
    semesterId: item.semesterId,
    weekNo: item.weekNo,
    sessionDate: item.sessionDate,
    dayOfWeek: item.dayOfWeek,
    dayOfWeekLabel: item.dayOfWeekLabel,
    startTime: item.startTime,
    endTime: item.endTime,
    slotStart: item.slotStart,
    slotEnd: item.slotEnd,
    sessionType: item.sessionType,
    sessionStatus: item.sessionStatus,
    practiceGroupNo: item.practiceGroupNo,
    sectionCode: item.sectionCode,
    courseCode: item.courseCode,
    courseName: item.courseName,
    lecturerCode: item.lecturerCode,
    lecturerName: item.lecturerName,
    roomCode: item.roomCode,
    buildingCode: item.buildingCode,
    buildingName: item.buildingName,
  };
}
