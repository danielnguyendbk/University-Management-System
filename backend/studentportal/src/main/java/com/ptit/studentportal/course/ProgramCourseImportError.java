package com.ptit.studentportal.course;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ProgramCourseImportError(
		int row,
		@JsonProperty("course_code")
		String courseCode,
		String reason
) {
}
