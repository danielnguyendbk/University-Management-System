package com.ptit.studentportal.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReplyNotificationRequest(
		@Size(max = 150)
		String title,

		@NotBlank
		String content
) {
}
