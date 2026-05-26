package com.ptit.studentportal.notification.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SendNotificationRequest(
		@NotBlank
		@Size(max = 150)
		String title,

		@NotBlank
		String content,

		@JsonProperty("notification_type")
		@JsonAlias("notificationType")
		String notificationType,

		@JsonProperty("is_important")
		@JsonAlias({"isImportant", "important"})
		Boolean important,

		@NotBlank
		@JsonProperty("target_type")
		@JsonAlias("targetType")
		String targetType,

		@JsonProperty("target_ids")
		@JsonAlias("targetIds")
		List<Long> targetIds,

		@JsonProperty("expires_at")
		@JsonAlias("expiresAt")
		LocalDateTime expiresAt
) {
}
