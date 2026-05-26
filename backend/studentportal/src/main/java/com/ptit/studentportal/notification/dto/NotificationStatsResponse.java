package com.ptit.studentportal.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record NotificationStatsResponse(
		@JsonProperty("total_recipients")
		long totalRecipients,

		@JsonProperty("read_count")
		long readCount,

		@JsonProperty("unread_count")
		long unreadCount
) {
}
