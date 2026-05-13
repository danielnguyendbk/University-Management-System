package com.ptit.studentportal.timetable.dto.response;

import java.util.List;

import lombok.Builder;

@Builder
public record TimetableImportRowErrorResponse(
		Integer rowNumber,
		String semesterCode,
		String sectionCode,
		List<String> errors
) {
}

