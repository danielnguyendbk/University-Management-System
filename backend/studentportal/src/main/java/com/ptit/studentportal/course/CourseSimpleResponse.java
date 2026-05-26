package com.ptit.studentportal.course;

public record CourseSimpleResponse(
		Long courseId,
		String courseCode,
		String courseName,
		int credits
) {
}
