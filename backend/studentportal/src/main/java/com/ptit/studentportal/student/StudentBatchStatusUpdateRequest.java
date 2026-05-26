package com.ptit.studentportal.student;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record StudentBatchStatusUpdateRequest(
		@NotEmpty List<Long> studentIds,
		@NotBlank String academicStatus
) {
}