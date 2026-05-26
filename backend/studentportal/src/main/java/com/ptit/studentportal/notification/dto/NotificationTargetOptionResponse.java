package com.ptit.studentportal.notification.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record NotificationTargetOptionResponse(
		String value,
		String label,
		String type,

		@JsonProperty("needsSelection")
		boolean needsSelection,

		@JsonProperty("target_type")
		String targetType,

		@JsonProperty("target_ids")
		List<Long> targetIds,

		@JsonProperty("recipient_estimate")
		long recipientEstimate
) {
}
