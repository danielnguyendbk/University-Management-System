package com.ptit.studentportal.student;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StudentUpdateRequest(
		@NotBlank @Size(max = 150) String fullName,
		LocalDate dateOfBirth,
		String gender,
		@Size(max = 20) String phone,
		@Size(max = 255) String address,
		@NotNull Long programId
) {
}