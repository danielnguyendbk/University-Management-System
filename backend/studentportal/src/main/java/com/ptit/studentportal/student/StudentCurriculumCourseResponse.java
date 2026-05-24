package com.ptit.studentportal.student;

import java.math.BigDecimal;

public record StudentCurriculumCourseResponse(
		Long programCourseId,
		Long programId,
		String programName,
		Long courseId,
		String courseCode,
		String courseName,
		int credits,
		String courseType,
		Integer recommendedSemester,
		boolean isRequired,
		boolean completed,
		BigDecimal bestTotalScore
) {
}
