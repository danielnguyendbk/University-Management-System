package com.ptit.studentportal.student;

import java.time.LocalDate;
import java.util.List;

public record StudentDetailResponse(
		Long studentId,
		Long userId,
		String studentCode,
		String fullName,
		String email,
		String username,
		String phone,
		String address,
		LocalDate dateOfBirth,
		String gender,
		String academicStatus,
		String accountStatus,
		Long programId,
		String programCode,
		String programName,
		Long departmentId,
		String departmentCode,
		String departmentName,
		List<StudentStatusHistoryResponse> statusHistory
) {
}