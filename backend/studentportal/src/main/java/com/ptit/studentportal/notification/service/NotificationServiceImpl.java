package com.ptit.studentportal.notification.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.ptit.studentportal.commom.exception.AppException;
import com.ptit.studentportal.department.DepartmentRepository;
import com.ptit.studentportal.lecturer.Lecturer;
import com.ptit.studentportal.lecturer.LecturerRepository;
import com.ptit.studentportal.notification.dto.AvailableTargetsResponse;
import com.ptit.studentportal.notification.dto.NotificationResponse;
import com.ptit.studentportal.notification.dto.NotificationStatsResponse;
import com.ptit.studentportal.notification.dto.NotificationSummaryResponse;
import com.ptit.studentportal.notification.dto.NotificationTargetOptionResponse;
import com.ptit.studentportal.notification.dto.ReplyNotificationRequest;
import com.ptit.studentportal.notification.dto.SendNotificationRequest;
import com.ptit.studentportal.notification.dto.UnreadCountResponse;
import com.ptit.studentportal.notification.entity.Notification;
import com.ptit.studentportal.notification.entity.NotificationRecipient;
import com.ptit.studentportal.notification.repository.NotificationRecipientRepository;
import com.ptit.studentportal.notification.repository.NotificationRepository;
import com.ptit.studentportal.program.ProgramRepository;
import com.ptit.studentportal.security.CustomUserDetails;
import com.ptit.studentportal.student.Student;
import com.ptit.studentportal.student.StudentRepository;
import com.ptit.studentportal.user.User;
import com.ptit.studentportal.user.UserRepository;
import com.ptit.studentportal.user.UserRole;
import com.ptit.studentportal.user.UserStatus;

@Service
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

	private static final Set<String> NOTIFICATION_TYPES = Set.of("general", "tuition", "academic", "exam", "system");
	private static final Set<String> TARGET_TYPES = Set.of("all", "student", "lecturer", "program", "department", "section", "custom");

	private final NotificationRepository notificationRepository;
	private final NotificationRecipientRepository recipientRepository;
	private final UserRepository userRepository;
	private final StudentRepository studentRepository;
	private final LecturerRepository lecturerRepository;
	private final DepartmentRepository departmentRepository;
	private final ProgramRepository programRepository;
	private final NamedParameterJdbcTemplate jdbcTemplate;

	public NotificationServiceImpl(NotificationRepository notificationRepository,
								   NotificationRecipientRepository recipientRepository,
								   UserRepository userRepository,
								   StudentRepository studentRepository,
								   LecturerRepository lecturerRepository,
								   DepartmentRepository departmentRepository,
								   ProgramRepository programRepository,
								   NamedParameterJdbcTemplate jdbcTemplate) {
		this.notificationRepository = notificationRepository;
		this.recipientRepository = recipientRepository;
		this.userRepository = userRepository;
		this.studentRepository = studentRepository;
		this.lecturerRepository = lecturerRepository;
		this.departmentRepository = departmentRepository;
		this.programRepository = programRepository;
		this.jdbcTemplate = jdbcTemplate;
	}

	@Override
	@Transactional
	public NotificationResponse sendNotification(SendNotificationRequest request, CustomUserDetails userDetails) {
		User sender = currentUser(userDetails);
		String rawTargetType = normalizeTargetType(request.targetType());
		String storedTargetType = "department".equals(rawTargetType) ? "program" : rawTargetType;
		String notificationType = normalizeNotificationType(request.notificationType());
		List<Long> targetIds = normalizeIds(request.targetIds());

		assertCanSend(rawTargetType, targetIds, sender);
		List<Long> recipientIds = excludeSender(resolveRecipientIds(rawTargetType, targetIds, sender), sender);
		if (recipientIds.isEmpty()) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Không tìm thấy người nhận phù hợp ngoài người gửi");
		}

		Notification notification = notificationRepository.save(Notification.builder()
				.createdBy(sender)
				.title(request.title().trim())
				.content(request.content().trim())
				.notificationType(notificationType)
				.important(Boolean.TRUE.equals(request.important()))
				.publishedAt(LocalDateTime.now())
				.expiresAt(null)
				.status("published")
				.targetType(storedTargetType)
				.build());

		List<User> recipients = userRepository.findAllById(recipientIds);
		List<NotificationRecipient> recipientRows = recipients.stream()
				.map(user -> NotificationRecipient.builder()
						.notification(notification)
						.user(user)
						.read(false)
						.build())
				.toList();
		recipientRepository.saveAll(recipientRows);

		return toNotificationResponse(notification, null);
	}

	@Override
	@Transactional
	public NotificationResponse replyToNotification(Long notificationId, ReplyNotificationRequest request, CustomUserDetails userDetails) {
		User replier = currentUser(userDetails);
		NotificationRecipient originalRecipient = recipientRepository
				.findByNotification_NotificationIdAndUser_UserId(notificationId, replier.getUserId())
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo để phản hồi"));
		Notification original = originalRecipient.getNotification();
		if (isSender(original, replier) || !isVisibleToRecipient(original)) {
			throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo để phản hồi");
		}
		User replyTarget = original.getCreatedBy();
		if (replyTarget == null || replyTarget.getUserId().equals(replier.getUserId())) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Không thể phản hồi thông báo này");
		}
		if (replyTarget.getStatus() != UserStatus.ACTIVE) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Người gửi ban đầu hiện không hoạt động");
		}

		markRecipientRead(originalRecipient);
		String title = StringUtils.hasText(request.title()) ? request.title().trim() : "Phản hồi: " + original.getTitle();
		if (title.length() > 150) {
			title = title.substring(0, 150);
		}

		Notification reply = notificationRepository.save(Notification.builder()
				.createdBy(replier)
				.title(title)
				.content(request.content().trim())
				.notificationType(original.getNotificationType())
				.important(false)
				.publishedAt(LocalDateTime.now())
				.status("published")
				.targetType("custom")
				.build());

		recipientRepository.save(NotificationRecipient.builder()
				.notification(reply)
				.user(replyTarget)
				.read(false)
				.build());

		return toNotificationResponse(reply, null);
	}

	@Override
	public Page<NotificationResponse> getMyNotifications(Pageable pageable, String type, Boolean isRead, CustomUserDetails userDetails) {
		Long userId = currentUser(userDetails).getUserId();
		String notificationType = StringUtils.hasText(type) ? normalizeNotificationType(type) : null;
		return recipientRepository.findMyNotifications(userId, notificationType, isRead, pageable)
				.map(this::toNotificationResponse);
	}

	@Override
	public List<NotificationSummaryResponse> getQuickNotifications(CustomUserDetails userDetails) {
		Long userId = currentUser(userDetails).getUserId();
		return recipientRepository.findQuickNotifications(userId, PageRequest.of(0, 10)).stream()
				.map(this::toSummaryResponse)
				.toList();
	}

	@Override
	public UnreadCountResponse getUnreadCount(CustomUserDetails userDetails) {
		long count = recipientRepository.countUnreadByUserId(currentUser(userDetails).getUserId());
		return new UnreadCountResponse(count);
	}

	@Override
	@Transactional
	public NotificationResponse markAsRead(Long notificationId, CustomUserDetails userDetails) {
		User currentUser = currentUser(userDetails);
		NotificationRecipient recipient = recipientRepository
				.findByNotification_NotificationIdAndUser_UserId(notificationId, currentUser.getUserId())
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo"));
		if (isSender(recipient.getNotification(), currentUser) || !isVisibleToRecipient(recipient.getNotification())) {
			throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo");
		}
		markRecipientRead(recipient);
		return toNotificationResponse(recipient);
	}

	@Override
	@Transactional
	public UnreadCountResponse markAllAsRead(CustomUserDetails userDetails) {
		recipientRepository.markAllAsRead(currentUser(userDetails).getUserId(), LocalDateTime.now());
		return getUnreadCount(userDetails);
	}

	@Override
	@Transactional
	public NotificationResponse getNotificationDetail(Long notificationId, CustomUserDetails userDetails) {
		User currentUser = currentUser(userDetails);
		Notification notification = notificationRepository.findById(notificationId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo"));
		if (isSender(notification, currentUser)) {
			return toNotificationResponse(notification, null);
		}
		if (!isVisibleToRecipient(notification)) {
			throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo");
		}
		NotificationRecipient recipient = recipientRepository
				.findByNotification_NotificationIdAndUser_UserId(notificationId, currentUser.getUserId())
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo"));
		markRecipientRead(recipient);
		return toNotificationResponse(recipient);
	}

	@Override
	public Page<NotificationResponse> getSentNotifications(Pageable pageable, CustomUserDetails userDetails) {
		User currentUser = currentUser(userDetails);
		requireAdmin(currentUser);
		return notificationRepository.findSentByUserId(currentUser.getUserId(), pageable)
				.map(notification -> toNotificationResponse(notification, null));
	}

	@Override
	public NotificationStatsResponse getNotificationStats(Long notificationId, CustomUserDetails userDetails) {
		User currentUser = currentUser(userDetails);
		requireAdmin(currentUser);
		Notification notification = notificationRepository.findById(notificationId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo"));
		if (notification.getCreatedBy() == null || !notification.getCreatedBy().getUserId().equals(currentUser.getUserId())) {
			throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem thống kê thông báo này");
		}
		long total = recipientRepository.countRecipientsExcludingSender(notificationId);
		long read = recipientRepository.countReadRecipientsExcludingSender(notificationId);
		return new NotificationStatsResponse(total, read, total - read);
	}

	@Override
	@Transactional
	public NotificationResponse archiveNotification(Long notificationId, CustomUserDetails userDetails) {
		User currentUser = currentUser(userDetails);
		requireAdmin(currentUser);
		int updated = notificationRepository.archiveSentNotification(notificationId, currentUser.getUserId());
		if (updated == 0) {
			throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo đã gửi");
		}
		Notification notification = notificationRepository.findById(notificationId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo"));
		return toNotificationResponse(notification, null);
	}

	@Override
	public AvailableTargetsResponse getAvailableTargets(CustomUserDetails userDetails) {
		User currentUser = currentUser(userDetails);
		List<NotificationTargetOptionResponse> targets = new ArrayList<>();

		if (currentUser.getRole() == UserRole.ADMIN) {
			targets.add(option("ALL", "Toàn trường", "all", "all", List.of(), estimateRecipients("all", List.of(), currentUser)));
			targets.add(option("STUDENT", "Tất cả sinh viên", "student", "student", List.of(), estimateRecipients("student", List.of(), currentUser)));
			targets.add(option("LECTURER", "Tất cả giảng viên", "lecturer", "lecturer", List.of(), estimateRecipients("lecturer", List.of(), currentUser)));
			departmentRepository.findAll().forEach(department -> targets.add(option(
					"DEPT_" + department.getDepartmentId(),
					department.getDepartmentName(),
					"department",
					"department",
					List.of(department.getDepartmentId()),
					estimateRecipients("department", List.of(department.getDepartmentId()), currentUser)
			)));
			programRepository.findAll().forEach(program -> targets.add(option(
					"PROGRAM_" + program.getProgramId(),
					program.getProgramCode() + " - " + program.getProgramName(),
					"program",
					"program",
					List.of(program.getProgramId()),
					estimateRecipients("program", List.of(program.getProgramId()), currentUser)
			)));
			return new AvailableTargetsResponse(targets);
		}

		if (currentUser.getRole() == UserRole.LECTURER) {
			Lecturer lecturer = lecturerRepository.findByUser_UserId(currentUser.getUserId())
					.orElseThrow(() -> new AppException(HttpStatus.FORBIDDEN, "Không tìm thấy hồ sơ giảng viên"));
			List<Long> adminIds = findAdminUserIds();
			targets.add(option("ADMIN", "Ban quản trị", "custom", "custom", adminIds, estimateRecipients("custom", adminIds, currentUser)));
			targets.addAll(findLecturerSections(lecturer.getLecturerId()).stream()
					.map(row -> option(
							"SECTION_" + row.id(),
							row.code() + " - " + row.name(),
							"section",
							"section",
							List.of(row.id()),
							estimateRecipients("section", List.of(row.id()), currentUser)
					))
					.toList());
			return new AvailableTargetsResponse(targets);
		}

		if (currentUser.getRole() == UserRole.STUDENT) {
			Student student = studentRepository.findByUser_UserId(currentUser.getUserId())
					.orElseThrow(() -> new AppException(HttpStatus.FORBIDDEN, "Không tìm thấy hồ sơ sinh viên"));
			List<Long> adminIds = findAdminUserIds();
			targets.add(option("ADMIN", "Ban quản trị", "custom", "custom", adminIds, estimateRecipients("custom", adminIds, currentUser)));
			targets.addAll(findStudentLecturerTargets(student.getStudentId()).stream()
					.map(row -> option(
							"SECTION_LECTURER_" + row.sectionId(),
							row.sectionCode() + " - " + row.courseName() + " (" + row.lecturerName() + ")",
							"custom",
							"custom",
							List.of(row.lecturerUserId()),
							estimateRecipients("custom", List.of(row.lecturerUserId()), currentUser)
					))
					.toList());
			return new AvailableTargetsResponse(targets);
		}

		return new AvailableTargetsResponse(targets);
	}

	private void assertCanSend(String rawTargetType, List<Long> targetIds, User sender) {
		if (sender.getRole() == UserRole.ADMIN) {
			return;
		}

		if (sender.getRole() == UserRole.LECTURER) {
			Lecturer lecturer = lecturerRepository.findByUser_UserId(sender.getUserId())
					.orElseThrow(() -> new AppException(HttpStatus.FORBIDDEN, "Không tìm thấy hồ sơ giảng viên"));
			if ("custom".equals(rawTargetType)) {
				assertNotEmpty(targetIds, "Vui lòng chọn người nhận");
				if (!allIdsBelongToAdmins(targetIds)) {
					throw new AppException(HttpStatus.FORBIDDEN, "Giảng viên chỉ được gửi custom đến admin");
				}
				return;
			}
			if ("section".equals(rawTargetType)) {
				assertNotEmpty(targetIds, "Vui lòng chọn lớp học phần");
				if (!allSectionsBelongToLecturer(targetIds, lecturer.getLecturerId())) {
					throw new AppException(HttpStatus.FORBIDDEN, "Bạn chỉ được gửi đến lớp học phần mình đang dạy");
				}
				return;
			}
			throw new AppException(HttpStatus.FORBIDDEN, "Giảng viên không được gửi đến đối tượng này");
		}

		if (sender.getRole() == UserRole.STUDENT) {
			Student student = studentRepository.findByUser_UserId(sender.getUserId())
					.orElseThrow(() -> new AppException(HttpStatus.FORBIDDEN, "Không tìm thấy hồ sơ sinh viên"));
			if ("custom".equals(rawTargetType)) {
				assertNotEmpty(targetIds, "Vui lòng chọn người nhận");
				if (!allIdsAllowedForStudentCustom(targetIds, student.getStudentId())) {
						throw new AppException(HttpStatus.FORBIDDEN, "Sinh viên chỉ được gửi đến admin hoặc giảng viên đang dạy lớp học phần mình đang học");
				}
				return;
			}
			throw new AppException(HttpStatus.FORBIDDEN, "Sinh viên không được gửi đến đối tượng này");
		}
	}

	private List<Long> resolveRecipientIds(String rawTargetType, List<Long> targetIds, User sender) {
		return switch (rawTargetType) {
			case "all" -> queryUserIds("""
				select user_id from users where status = 'active'
				""", Map.of());
			case "student" -> queryUserIds("""
				select distinct s.user_id
				from students s
				join users u on u.user_id = s.user_id
				where u.status = 'active'
				""", Map.of());
			case "lecturer" -> queryUserIds("""
				select distinct l.user_id
				from lecturers l
				join users u on u.user_id = l.user_id
				where u.status = 'active'
				""", Map.of());
			case "department" -> {
				if (sender.getRole() != UserRole.ADMIN) {
					throw new AppException(HttpStatus.FORBIDDEN, "Chỉ admin được gửi đến khoa");
				}
				yield resolveDepartmentRecipients(targetIds, sender);
			}
			case "program" -> {
				if (sender.getRole() != UserRole.ADMIN) {
					throw new AppException(HttpStatus.FORBIDDEN, "Chỉ admin được gửi đến ngành");
				}
				yield resolveProgramRecipients(targetIds);
			}
			case "section" -> {
				assertNotEmpty(targetIds, "Vui lòng chọn lớp học phần");
				yield queryUserIds("""
					select distinct s.user_id
					from enrollments e
					join students s on s.student_id = e.student_id
					join users u on u.user_id = s.user_id
					where e.section_id in (:ids)
					  and e.enrollment_status = 'registered'
					  and u.status = 'active'
					""", Map.of("ids", targetIds));
			}
			case "custom" -> {
				assertNotEmpty(targetIds, "Vui lòng chọn người nhận");
				yield queryUserIds("""
					select distinct user_id
					from users
					where user_id in (:ids)
					  and status = 'active'
					""", Map.of("ids", targetIds));
			}
			default -> throw new AppException(HttpStatus.BAD_REQUEST, "Đối tượng gửi không hợp lệ");
		};
	}

	private List<Long> resolveDepartmentRecipients(List<Long> departmentIds, User sender) {
		assertNotEmpty(departmentIds, "Vui lòng chọn khoa");
		if (sender.getRole() == UserRole.LECTURER) {
			return queryUserIds("""
				select distinct l.user_id
				from lecturers l
				join users u on u.user_id = l.user_id
				where l.department_id in (:ids)
				  and u.status = 'active'
				""", Map.of("ids", departmentIds));
		}
		if (sender.getRole() == UserRole.STUDENT) {
			return queryUserIds("""
				select distinct s.user_id
				from students s
				join programs p on p.program_id = s.program_id
				join users u on u.user_id = s.user_id
				where p.department_id in (:ids)
				  and u.status = 'active'
				""", Map.of("ids", departmentIds));
		}
		return queryUserIds("""
			select distinct user_id
			from (
				select s.user_id
				from students s
				join programs p on p.program_id = s.program_id
				join users u on u.user_id = s.user_id
				where p.department_id in (:ids)
				  and u.status = 'active'
				union
				select l.user_id
				from lecturers l
				join users u on u.user_id = l.user_id
				where l.department_id in (:ids)
				  and u.status = 'active'
			) recipients
			""", Map.of("ids", departmentIds));
	}

	private List<Long> resolveProgramRecipients(List<Long> programIds) {
		assertNotEmpty(programIds, "Vui lòng chọn ngành");
		return queryUserIds("""
			select distinct s.user_id
			from students s
			join users u on u.user_id = s.user_id
			where s.program_id in (:ids)
			  and u.status = 'active'
			""", Map.of("ids", programIds));
	}

	private NotificationResponse toNotificationResponse(NotificationRecipient recipient) {
		Notification notification = recipient.getNotification();
		return toNotificationResponse(notification, recipient);
	}

	private NotificationResponse toNotificationResponse(Notification notification, NotificationRecipient recipient) {
		User createdBy = notification.getCreatedBy();
		return new NotificationResponse(
				notification.getNotificationId(),
				notification.getTitle(),
				notification.getContent(),
				notification.getNotificationType(),
				notification.isImportant(),
				notification.getPublishedAt(),
				notification.getExpiresAt(),
				notification.getStatus(),
				notification.getTargetType(),
				recipient == null ? null : recipient.isRead(),
				recipient == null ? null : recipient.getReadAt(),
				createdBy == null ? null : createdBy.getUserId(),
				resolveFullName(createdBy),
				resolveSenderDisplayName(createdBy)
		);
	}

	private NotificationSummaryResponse toSummaryResponse(NotificationRecipient recipient) {
		Notification notification = recipient.getNotification();
		return new NotificationSummaryResponse(
				notification.getNotificationId(),
				notification.getTitle(),
				preview(notification.getContent()),
				resolveSenderDisplayName(notification.getCreatedBy()),
				notification.getPublishedAt(),
				recipient.isRead()
		);
	}

	private void markRecipientRead(NotificationRecipient recipient) {
		if (!recipient.isRead()) {
			recipient.setRead(true);
			recipient.setReadAt(LocalDateTime.now());
			recipientRepository.save(recipient);
		}
	}

	private List<Long> excludeSender(List<Long> userIds, User sender) {
		if (sender == null || userIds == null || userIds.isEmpty()) {
			return List.of();
		}
		return userIds.stream()
				.filter(userId -> !sender.getUserId().equals(userId))
				.toList();
	}

	private long estimateRecipients(String rawTargetType, List<Long> targetIds, User sender) {
		if (Set.of("custom", "department", "program", "section").contains(rawTargetType)
				&& (targetIds == null || targetIds.isEmpty())) {
			return 0;
		}
		return excludeSender(resolveRecipientIds(rawTargetType, targetIds, sender), sender).size();
	}

	private boolean isSender(Notification notification, User user) {
		return notification.getCreatedBy() != null
				&& user != null
				&& notification.getCreatedBy().getUserId().equals(user.getUserId());
	}

	private boolean isVisibleToRecipient(Notification notification) {
		return "published".equals(notification.getStatus())
				&& (notification.getExpiresAt() == null || notification.getExpiresAt().isAfter(LocalDateTime.now()));
	}

	private User currentUser(CustomUserDetails userDetails) {
		if (userDetails == null || userDetails.getUser() == null) {
			throw new AppException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập");
		}
		return userDetails.getUser();
	}

	private void requireAdmin(User user) {
		if (user.getRole() != UserRole.ADMIN) {
			throw new AppException(HttpStatus.FORBIDDEN, "Chỉ admin được thực hiện thao tác này");
		}
	}

	private String normalizeNotificationType(String value) {
		String normalized = StringUtils.hasText(value) ? value.trim().toLowerCase(Locale.ROOT) : "general";
		if (!NOTIFICATION_TYPES.contains(normalized)) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Loại thông báo không hợp lệ: " + value);
		}
		return normalized;
	}

	private String normalizeTargetType(String value) {
		String normalized = StringUtils.hasText(value) ? value.trim().toLowerCase(Locale.ROOT) : "";
		if (!TARGET_TYPES.contains(normalized)) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Đối tượng gửi không hợp lệ: " + value);
		}
		return normalized;
	}

	private List<Long> normalizeIds(Collection<Long> ids) {
		if (ids == null) {
			return List.of();
		}
		return ids.stream()
				.filter(id -> id != null && id > 0)
				.collect(java.util.stream.Collectors.collectingAndThen(
						java.util.stream.Collectors.toCollection(LinkedHashSet::new),
						ArrayList::new
				));
	}

	private void assertNotEmpty(List<Long> ids, String message) {
		if (ids == null || ids.isEmpty()) {
			throw new AppException(HttpStatus.BAD_REQUEST, message);
		}
	}

	private boolean allIdsBelongToAdmins(List<Long> userIds) {
		return countLong("""
			select count(distinct user_id)
			from users
			where user_id in (:ids)
			  and role = 'admin'
			  and status = 'active'
			""", Map.of("ids", userIds)) == userIds.size();
	}

	private boolean allIdsAllowedForStudentCustom(List<Long> targetUserIds, Long studentId) {
		Set<Long> allowed = new LinkedHashSet<>(findAdminUserIds());
		allowed.addAll(findLecturerUserIdsForStudentSections(studentId));
		return allowed.containsAll(targetUserIds);
	}

	private boolean allSectionsBelongToLecturer(List<Long> sectionIds, Long lecturerId) {
		return countLong("""
			select count(distinct section_id)
			from course_sections
			where section_id in (:ids)
			  and lecturer_id = :lecturerId
			""", Map.of("ids", sectionIds, "lecturerId", lecturerId)) == sectionIds.size();
	}

	private List<Long> findAdminUserIds() {
		return queryUserIds("""
			select user_id
			from users
			where role = 'admin'
			  and status = 'active'
			order by user_id
			""", Map.of());
	}

	private List<Long> findLecturerUserIdsForStudentSections(Long studentId) {
		return queryUserIds("""
			select distinct l.user_id
			from enrollments e
			join course_sections cs on cs.section_id = e.section_id
			join lecturers l on l.lecturer_id = cs.lecturer_id
			join users u on u.user_id = l.user_id
			where e.student_id = :studentId
			  and e.enrollment_status = 'registered'
			  and u.status = 'active'
			""", Map.of("studentId", studentId));
	}

	private List<SectionTargetRow> findLecturerSections(Long lecturerId) {
		return jdbcTemplate.query("""
			select cs.section_id, cs.section_code, c.course_name
			from course_sections cs
			join courses c on c.course_id = cs.course_id
			where cs.lecturer_id = :lecturerId
			order by cs.section_code
			""", new MapSqlParameterSource("lecturerId", lecturerId),
				(rs, rowNum) -> new SectionTargetRow(rs.getLong("section_id"), rs.getString("section_code"), rs.getString("course_name")));
	}

	private List<StudentLecturerTargetRow> findStudentLecturerTargets(Long studentId) {
		return jdbcTemplate.query("""
			select distinct cs.section_id, cs.section_code, c.course_name, l.user_id as lecturer_user_id, l.full_name as lecturer_name
			from enrollments e
			join course_sections cs on cs.section_id = e.section_id
			join courses c on c.course_id = cs.course_id
			join lecturers l on l.lecturer_id = cs.lecturer_id
			join users u on u.user_id = l.user_id
			where e.student_id = :studentId
			  and e.enrollment_status = 'registered'
			  and u.status = 'active'
			order by cs.section_code
			""", new MapSqlParameterSource("studentId", studentId),
				(rs, rowNum) -> new StudentLecturerTargetRow(
						rs.getLong("section_id"),
						rs.getString("section_code"),
						rs.getString("course_name"),
						rs.getLong("lecturer_user_id"),
						rs.getString("lecturer_name")
				));
	}

	private List<Long> queryUserIds(String sql, Map<String, ?> params) {
		List<Long> ids = jdbcTemplate.query(sql, new MapSqlParameterSource(params), (rs, rowNum) -> rs.getLong(1));
		return ids.stream()
				.collect(java.util.stream.Collectors.collectingAndThen(
						java.util.stream.Collectors.toCollection(LinkedHashSet::new),
						ArrayList::new
				));
	}

	private long countLong(String sql, Map<String, ?> params) {
		Long value = jdbcTemplate.queryForObject(sql, new MapSqlParameterSource(params), Long.class);
		return value == null ? 0 : value;
	}

	private NotificationTargetOptionResponse option(String value, String label, String type, String targetType, List<Long> targetIds, long estimate) {
		return new NotificationTargetOptionResponse(value, label, type, false, targetType, targetIds, estimate);
	}

	private String preview(String content) {
		if (content == null) {
			return "";
		}
		String compact = content.replaceAll("\\s+", " ").trim();
		return compact.length() <= 80 ? compact : compact.substring(0, 80) + "...";
	}

	private String resolveFullName(User user) {
		if (user == null) {
			return null;
		}
		if (user.getRole() == UserRole.STUDENT) {
			return studentRepository.findByUser_UserId(user.getUserId())
					.map(Student::getFullName)
					.orElse(user.getUsername());
		}
		if (user.getRole() == UserRole.LECTURER) {
			return lecturerRepository.findByUser_UserId(user.getUserId())
					.map(Lecturer::getFullName)
					.orElse(user.getUsername());
		}
		return user.getUsername();
	}

	private String resolveSenderDisplayName(User user) {
		if (user == null) {
			return "Hệ thống";
		}
		if (user.getRole() == UserRole.ADMIN) {
			return "Nhà trường";
		}
		if (user.getRole() == UserRole.LECTURER) {
			return lecturerRepository.findByUser_UserId(user.getUserId())
					.map(lecturer -> {
						String title = shortAcademicTitle(lecturer.getAcademicTitle());
						String prefix = StringUtils.hasText(title) ? "Giảng viên " + title + " " : "Giảng viên ";
						return prefix + lecturer.getFullName();
					})
					.orElse("Giảng viên " + user.getUsername());
		}
		if (user.getRole() == UserRole.STUDENT) {
			return studentRepository.findByUser_UserId(user.getUserId())
					.map(student -> {
						StringBuilder builder = new StringBuilder("Sinh viên ")
								.append(student.getFullName());
						if (StringUtils.hasText(student.getStudentCode())) {
							builder.append(" - ").append(student.getStudentCode());
						}
						programRepository.findById(student.getProgramId())
								.ifPresent(program -> builder.append(" (").append(program.getProgramName()).append(")"));
						return builder.toString();
					})
					.orElse("Sinh viên " + user.getUsername());
		}
		return user.getUsername();
	}

	private String shortAcademicTitle(String academicTitle) {
		if (!StringUtils.hasText(academicTitle)) {
			return "";
		}
		String normalized = academicTitle.trim().toLowerCase(Locale.ROOT);
		if (normalized.contains("tiến sĩ") || normalized.equals("ts") || normalized.equals("ts.")) {
			return "TS";
		}
		if (normalized.contains("thạc sĩ") || normalized.equals("ths") || normalized.equals("ths.")) {
			return "ThS";
		}
		if (normalized.contains("phó giáo sư") || normalized.equals("pgs") || normalized.equals("pgs.")) {
			return "PGS";
		}
		if (normalized.contains("giáo sư") || normalized.equals("gs") || normalized.equals("gs.")) {
			return "GS";
		}
		return academicTitle.trim();
	}

	private record SectionTargetRow(Long id, String code, String name) {
	}

	private record StudentLecturerTargetRow(Long sectionId, String sectionCode, String courseName, Long lecturerUserId, String lecturerName) {
	}
}
