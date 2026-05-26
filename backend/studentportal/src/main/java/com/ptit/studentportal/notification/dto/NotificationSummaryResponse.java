package com.ptit.studentportal.notification.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

public record NotificationSummaryResponse(
		Long id,
		String title,
		String preview,

		@JsonProperty("created_by_display_name")
		String createdByDisplayName,

		@JsonProperty("published_at")
		LocalDateTime publishedAt,

		@JsonProperty("is_read")
		boolean read
) {
}
