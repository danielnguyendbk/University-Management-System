package com.ptit.studentportal.timetable.dto.request;

import java.time.LocalTime;

import com.ptit.studentportal.timetable.enums.SessionType;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateScheduleRequest(
		@NotNull Long semesterId,
		@NotNull Long sectionId,
		@NotNull Long roomId,
		@NotBlank String dayOfWeek,
		@NotNull @Min(1) Integer fromWeekNo,
		@NotNull @Min(1) Integer toWeekNo,
		@NotNull @Min(1) @Max(12) Integer slotStart,
		@NotNull @Min(1) @Max(12) Integer slotEnd,
		@NotNull LocalTime startTime,
		@NotNull LocalTime endTime,
		SessionType sessionType,
		Integer practiceGroupNo,
		String note,
		String status
) {
}
