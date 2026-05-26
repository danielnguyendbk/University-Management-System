package com.ptit.studentportal.course;

import java.time.LocalDateTime;

public record CourseResponse(
		Long courseId,
		String courseCode,
		String courseName,
		int credits,
		String courseType,
		boolean isActive,
		String description,
		LocalDateTime createdAt,
		LocalDateTime updatedAt
) {
}
