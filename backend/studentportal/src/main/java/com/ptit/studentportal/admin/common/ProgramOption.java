package com.ptit.studentportal.admin.common;

import java.time.LocalDateTime;

public record ProgramOption(
	Long programId,
	Long departmentId,
	String programCode,
	String programName,
	String status,
	LocalDateTime createdAt
) {
}