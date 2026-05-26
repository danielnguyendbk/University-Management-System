package com.ptit.studentportal.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UnreadCountResponse(
		@JsonProperty("unread_count")
		long unreadCount
) {
}
