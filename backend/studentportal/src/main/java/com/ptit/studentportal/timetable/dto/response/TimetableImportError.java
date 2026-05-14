package com.ptit.studentportal.timetable.dto.response;

import lombok.Builder;

import java.util.List;


@Builder
public record TimetableImportError(
		Integer rowNumber,
		String semesterCode,
		String sectionCode,
		List<String> errors
) {
}

