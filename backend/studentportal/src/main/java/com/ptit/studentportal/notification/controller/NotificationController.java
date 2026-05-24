package com.ptit.studentportal.notification.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.commom.response.PageResponse;
import com.ptit.studentportal.notification.dto.AvailableTargetsResponse;
import com.ptit.studentportal.notification.dto.NotificationResponse;
import com.ptit.studentportal.notification.dto.NotificationStatsResponse;
import com.ptit.studentportal.notification.dto.NotificationSummaryResponse;
import com.ptit.studentportal.notification.dto.ReplyNotificationRequest;
import com.ptit.studentportal.notification.dto.SendNotificationRequest;
import com.ptit.studentportal.notification.dto.UnreadCountResponse;
import com.ptit.studentportal.notification.service.NotificationService;
import com.ptit.studentportal.security.CustomUserDetails;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@Validated
public class NotificationController {

	private final NotificationService notificationService;

	public NotificationController(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@PostMapping("/send")
	public ApiResponse<NotificationResponse> sendNotification(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@Valid @RequestBody SendNotificationRequest request) {
		return ApiResponse.success("Notification sent successfully", notificationService.sendNotification(request, userDetails));
	}

	@PostMapping("/{id}/reply")
	public ApiResponse<NotificationResponse> replyToNotification(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@PathVariable Long id,
			@Valid @RequestBody ReplyNotificationRequest request) {
		return ApiResponse.success("Reply sent successfully", notificationService.replyToNotification(id, request, userDetails));
	}

	@GetMapping("/my")
	public ApiResponse<PageResponse<NotificationResponse>> getMyNotifications(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false) String type,
			@RequestParam(required = false) String isRead) {
		var pageData = notificationService.getMyNotifications(
				PageRequest.of(page, size),
				emptyToNull(type),
				parseBoolean(isRead),
				userDetails
		);
		return ApiResponse.success("Notifications fetched successfully", new PageResponse<>(
				pageData.getContent(),
				pageData.getTotalElements(),
				pageData.getTotalPages(),
				pageData.getNumber(),
				pageData.getSize()
		));
	}

	@GetMapping("/quick")
	public ApiResponse<List<NotificationSummaryResponse>> getQuickNotifications(@AuthenticationPrincipal CustomUserDetails userDetails) {
		return ApiResponse.success("Quick notifications fetched successfully", notificationService.getQuickNotifications(userDetails));
	}

	@GetMapping("/unread-count")
	public ApiResponse<UnreadCountResponse> getUnreadCount(@AuthenticationPrincipal CustomUserDetails userDetails) {
		return ApiResponse.success("Unread count fetched successfully", notificationService.getUnreadCount(userDetails));
	}

	@PatchMapping("/{id}/read")
	public ApiResponse<NotificationResponse> markAsRead(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@PathVariable Long id) {
		return ApiResponse.success("Notification marked as read", notificationService.markAsRead(id, userDetails));
	}

	@PatchMapping("/read-all")
	public ApiResponse<UnreadCountResponse> markAllAsRead(@AuthenticationPrincipal CustomUserDetails userDetails) {
		return ApiResponse.success("All notifications marked as read", notificationService.markAllAsRead(userDetails));
	}

	@GetMapping("/{id}")
	public ApiResponse<NotificationResponse> getNotificationDetail(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@PathVariable Long id) {
		return ApiResponse.success("Notification fetched successfully", notificationService.getNotificationDetail(id, userDetails));
	}

	@GetMapping("/sent")
	public ApiResponse<PageResponse<NotificationResponse>> getSentNotifications(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		var pageData = notificationService.getSentNotifications(
				PageRequest.of(page, size, Sort.by(Sort.Order.desc("publishedAt"), Sort.Order.desc("notificationId"))),
				userDetails
		);
		return ApiResponse.success("Sent notifications fetched successfully", new PageResponse<>(
				pageData.getContent(),
				pageData.getTotalElements(),
				pageData.getTotalPages(),
				pageData.getNumber(),
				pageData.getSize()
		));
	}

	@GetMapping("/{id}/stats")
	public ApiResponse<NotificationStatsResponse> getNotificationStats(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@PathVariable Long id) {
		return ApiResponse.success("Notification stats fetched successfully", notificationService.getNotificationStats(id, userDetails));
	}

	@PatchMapping("/{id}/archive")
	public ApiResponse<NotificationResponse> archiveNotification(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@PathVariable Long id) {
		return ApiResponse.success("Notification archived successfully", notificationService.archiveNotification(id, userDetails));
	}

	@GetMapping("/available-targets")
	public ApiResponse<AvailableTargetsResponse> getAvailableTargets(@AuthenticationPrincipal CustomUserDetails userDetails) {
		return ApiResponse.success("Available targets fetched successfully", notificationService.getAvailableTargets(userDetails));
	}

	private String emptyToNull(String value) {
		return value == null || value.isBlank() ? null : value;
	}

	private Boolean parseBoolean(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		return Boolean.parseBoolean(value);
	}
}
