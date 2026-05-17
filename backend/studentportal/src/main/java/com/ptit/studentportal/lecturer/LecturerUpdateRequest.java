package com.ptit.studentportal.lecturer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LecturerUpdateRequest(
		@NotBlank @Size(max = 150) String fullName,
		@Size(max = 100) String academicTitle,
		@NotNull Long departmentId,
		@Size(max = 20) String phone
) {
}