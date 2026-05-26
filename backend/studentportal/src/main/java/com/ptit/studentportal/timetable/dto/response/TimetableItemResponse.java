package com.ptit.studentportal.timetable.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;

/**
 * Timetable item response for frontend
 */
@Builder
public record TimetableItemResponse(
		Long sessionId,
		Long sectionId,
		String sectionCode,
		String courseCode,
		String courseName,
		Long roomId,
		String roomCode,
		Long buildingId,
		String buildingCode,
		String buildingName,
		Long lecturerId,
		String lecturerName,
		String dayOfWeek,
		String groupName,
		Integer practiceGroupNo,
		String roomName,
		@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
		LocalDate sessionDate,
		@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
		LocalTime startTime,
		@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
		LocalTime endTime,
		Integer slotStart,
		Integer slotEnd,
		String sessionStatus,
		String sessionType,
		Boolean practice,
		String cancellationReason,
		String note
) {
}
