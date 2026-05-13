package com.ptit.studentportal.timetable.dto.response;

import lombok.Builder;

@Builder
public record TimetableImportError(
		Integer rowNumber,
		String semesterCode,
		String sectionCode,
		String error
) {
}

