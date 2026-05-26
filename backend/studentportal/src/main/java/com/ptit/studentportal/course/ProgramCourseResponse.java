package com.ptit.studentportal.course;

public record ProgramCourseResponse(
		Long programCourseId,
		Long programId,
		String programName,
		Long courseId,
		String courseCode,
		String courseName,
		int credits,
		String courseType,
		Integer recommendedSemester,
		boolean isRequired
) {
}
