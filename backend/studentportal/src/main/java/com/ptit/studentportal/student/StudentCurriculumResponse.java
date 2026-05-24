package com.ptit.studentportal.student;

import java.util.List;

public record StudentCurriculumResponse(
		Long studentId,
		String studentCode,
		String fullName,
		Long programId,
		String programCode,
		String programName,
		Integer totalCreditsRequired,
		int assignedCredits,
		int achievedCredits,
		List<StudentCurriculumCourseResponse> courses
) {
}
