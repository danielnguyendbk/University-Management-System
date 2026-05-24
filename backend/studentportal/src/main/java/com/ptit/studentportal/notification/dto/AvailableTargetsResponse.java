package com.ptit.studentportal.notification.dto;

import java.util.List;

public record AvailableTargetsResponse(
		List<NotificationTargetOptionResponse> targets
) {
}
