package com.ptit.studentportal.timetable.dto.request;

import java.time.LocalTime;

import com.ptit.studentportal.timetable.enums.SessionType;

public record UpdateScheduleRequest(
		Long semesterId,
		Long sectionId,
		Long roomId,
		String dayOfWeek,
		Integer fromWeekNo,
		Integer toWeekNo,
		Integer slotStart,
		Integer slotEnd,
		LocalTime startTime,
		LocalTime endTime,
		SessionType sessionType,
		Integer practiceGroupNo,
		String note,
		String status
) {
}

