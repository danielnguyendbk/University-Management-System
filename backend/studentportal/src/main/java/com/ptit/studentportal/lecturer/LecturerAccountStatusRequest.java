package com.ptit.studentportal.lecturer;

import jakarta.validation.constraints.NotBlank;

public record LecturerAccountStatusRequest(
		@NotBlank String status
) {
}