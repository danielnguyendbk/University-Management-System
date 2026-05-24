package com.ptit.studentportal.notification.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.ptit.studentportal.notification.dto.AvailableTargetsResponse;
import com.ptit.studentportal.notification.dto.NotificationResponse;
import com.ptit.studentportal.notification.dto.NotificationStatsResponse;
import com.ptit.studentportal.notification.dto.NotificationSummaryResponse;
import com.ptit.studentportal.notification.dto.ReplyNotificationRequest;
import com.ptit.studentportal.notification.dto.SendNotificationRequest;
import com.ptit.studentportal.notification.dto.UnreadCountResponse;
import com.ptit.studentportal.security.CustomUserDetails;

import java.util.List;

public interface NotificationService {

	NotificationResponse sendNotification(SendNotificationRequest request, CustomUserDetails userDetails);

	NotificationResponse replyToNotification(Long notificationId, ReplyNotificationRequest request, CustomUserDetails userDetails);

	Page<NotificationResponse> getMyNotifications(Pageable pageable, String type, Boolean isRead, CustomUserDetails userDetails);

	List<NotificationSummaryResponse> getQuickNotifications(CustomUserDetails userDetails);

	UnreadCountResponse getUnreadCount(CustomUserDetails userDetails);

	NotificationResponse markAsRead(Long notificationId, CustomUserDetails userDetails);

	UnreadCountResponse markAllAsRead(CustomUserDetails userDetails);

	NotificationResponse getNotificationDetail(Long notificationId, CustomUserDetails userDetails);

	Page<NotificationResponse> getSentNotifications(Pageable pageable, CustomUserDetails userDetails);

	NotificationStatsResponse getNotificationStats(Long notificationId, CustomUserDetails userDetails);

	NotificationResponse archiveNotification(Long notificationId, CustomUserDetails userDetails);

	AvailableTargetsResponse getAvailableTargets(CustomUserDetails userDetails);
}
