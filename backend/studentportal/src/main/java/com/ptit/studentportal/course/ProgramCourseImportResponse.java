package com.ptit.studentportal.course;

import java.util.List;

public record ProgramCourseImportResponse(
		int inserted,
		int skipped,
		List<ProgramCourseImportError> errors
) {
}
