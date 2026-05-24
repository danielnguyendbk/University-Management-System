package com.ptit.studentportal.notification.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

public record NotificationResponse(
		Long id,
		String title,
		String content,

		@JsonProperty("notification_type")
		String notificationType,

		@JsonProperty("is_important")
		boolean important,

		@JsonProperty("published_at")
		LocalDateTime publishedAt,

		@JsonProperty("expires_at")
		LocalDateTime expiresAt,

		String status,

		@JsonProperty("target_type")
		String targetType,

		@JsonProperty("is_read")
		Boolean read,

		@JsonProperty("read_at")
		LocalDateTime readAt,

		@JsonProperty("created_by")
		Long createdBy,

		@JsonProperty("created_by_name")
		String createdByName,

		@JsonProperty("created_by_display_name")
		String createdByDisplayName
) {
}
