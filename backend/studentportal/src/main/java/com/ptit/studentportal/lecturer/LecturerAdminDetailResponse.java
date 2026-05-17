package com.ptit.studentportal.lecturer;

import java.util.List;

public record LecturerAdminDetailResponse(
		Long lecturerId,
		Long userId,
		String lecturerCode,
		String fullName,
		String academicTitle,
		String departmentCode,
		String departmentName,
		String email,
		String phone,
		String accountStatus,
		List<LecturerSectionResponse> sections
) {
}