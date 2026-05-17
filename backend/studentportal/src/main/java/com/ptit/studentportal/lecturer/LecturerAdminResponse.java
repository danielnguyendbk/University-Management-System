package com.ptit.studentportal.lecturer;

public record LecturerAdminResponse(
		Long lecturerId,
		Long userId,
		String lecturerCode,
		String fullName,
		String academicTitle,
		String departmentCode,
		String departmentName,
		String email,
		String accountStatus
) {
}