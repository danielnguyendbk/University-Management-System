package com.ptit.studentportal.timetable.dto.response;

import java.util.List;

import lombok.Builder;

@Builder
public record GenerateTimetableResponse(
		Long semesterId,
		Integer createdCount,
		Integer updatedCount,
		Integer cancelledByHolidayCount,
		Integer skippedCount,
		List<String> warnings
) {
}

