package com.ptit.studentportal.timetable.dto.response;

import lombok.Builder;

@Builder
public record TimetableImportRowResult(
		Integer rowNumber,
		String semesterCode,
		String sectionCode,
		Long scheduleId
) {
}
