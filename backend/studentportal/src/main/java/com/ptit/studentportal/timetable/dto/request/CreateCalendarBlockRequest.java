package com.ptit.studentportal.timetable.dto.request;

import java.time.LocalDate;

import com.ptit.studentportal.timetable.enums.CalendarBlockType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateCalendarBlockRequest(
		@NotNull Long semesterId,
		@NotNull LocalDate startDate,
		@NotNull LocalDate endDate,
		@NotNull CalendarBlockType blockType,
		@NotBlank String title,
		@NotNull Boolean teachingAllowed,
		String note
) {
}
