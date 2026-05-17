package com.ptit.studentportal.lecturer;

public record LecturerSectionResponse(
		Long sectionId,
		String sectionCode,
		String courseCode,
		String courseName,
		String semesterName,
		String academicYear,
		String status
) {
}