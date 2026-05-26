package com.ptit.studentportal.student;

public record StudentAdminResponse(
		Long studentId,
		Long userId,
		String studentCode,
		String fullName,
		String email,
		String phone,
		String address,
		String academicStatus,
		String accountStatus,
		Long programId,
		String programCode,
		String programName,
		Long departmentId,
		String departmentCode,
		String departmentName
) {
}