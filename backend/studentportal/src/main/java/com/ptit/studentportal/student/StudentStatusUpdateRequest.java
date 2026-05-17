package com.ptit.studentportal.student;

import jakarta.validation.constraints.NotBlank;

public record StudentStatusUpdateRequest(
		@NotBlank String academicStatus
) {
}