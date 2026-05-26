package com.ptit.studentportal.student;

import java.time.LocalDateTime;

public record StudentStatusHistoryResponse(
		Long historyId,
		String oldStatus,
		String newStatus,
		Long changedByUserId,
		String note,
		LocalDateTime changedAt
) {
}