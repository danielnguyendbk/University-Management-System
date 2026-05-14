package com.ptit.studentportal.timetable.dto.response;

import java.time.LocalTime;

import lombok.Builder;

@Builder
public record ScheduleResponse(
		Long scheduleId,
		Long semesterId,
		String semesterCode,
		Long sectionId,
		String sectionCode,
		String courseName,
		Long roomId,
		String roomCode,
		Long lecturerId,
		String lecturerCode,
		String lecturerName,
		String dayOfWeek,
		String dayOfWeekLabel,
		Integer fromWeekNo,
		Integer toWeekNo,
		Integer slotStart,
		Integer slotEnd,
		LocalTime startTime,
		LocalTime endTime,
		String sessionType,
		Integer practiceGroupNo,
		String status,
		String note
) {
}
