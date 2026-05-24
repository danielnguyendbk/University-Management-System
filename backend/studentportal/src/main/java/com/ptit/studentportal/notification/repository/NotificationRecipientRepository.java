package com.ptit.studentportal.notification.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ptit.studentportal.notification.entity.NotificationRecipient;

public interface NotificationRecipientRepository extends JpaRepository<NotificationRecipient, Long> {

	@Query(
			value = """
				select nr
				from NotificationRecipient nr
				join fetch nr.notification n
				left join fetch n.createdBy
				where nr.user.userId = :userId
				  and n.status = 'published'
				  and (n.createdBy is null or n.createdBy.userId <> :userId)
				  and (:type is null or n.notificationType = :type)
				  and (:isRead is null or nr.read = :isRead)
				  and (n.expiresAt is null or n.expiresAt > CURRENT_TIMESTAMP)
				order by n.publishedAt desc, n.notificationId desc
				""",
			countQuery = """
				select count(nr)
				from NotificationRecipient nr
				join nr.notification n
				where nr.user.userId = :userId
				  and n.status = 'published'
				  and (n.createdBy is null or n.createdBy.userId <> :userId)
				  and (:type is null or n.notificationType = :type)
				  and (:isRead is null or nr.read = :isRead)
				  and (n.expiresAt is null or n.expiresAt > CURRENT_TIMESTAMP)
				"""
	)
	Page<NotificationRecipient> findMyNotifications(
			@Param("userId") Long userId,
			@Param("type") String type,
			@Param("isRead") Boolean isRead,
			Pageable pageable
	);

	@Query("""
		select nr
		from NotificationRecipient nr
		join fetch nr.notification n
		left join fetch n.createdBy
		where nr.user.userId = :userId
		  and n.status = 'published'
		  and (n.createdBy is null or n.createdBy.userId <> :userId)
		  and (n.expiresAt is null or n.expiresAt > CURRENT_TIMESTAMP)
		order by n.publishedAt desc, n.notificationId desc
		""")
	List<NotificationRecipient> findQuickNotifications(@Param("userId") Long userId, Pageable pageable);

	Optional<NotificationRecipient> findByNotification_NotificationIdAndUser_UserId(Long notificationId, Long userId);

	boolean existsByNotification_NotificationIdAndUser_UserId(Long notificationId, Long userId);

	long countByNotification_NotificationId(Long notificationId);

	long countByNotification_NotificationIdAndReadTrue(Long notificationId);

	@Query("""
		select count(nr)
		from NotificationRecipient nr
		join nr.notification n
		where n.notificationId = :notificationId
		  and (n.createdBy is null or nr.user.userId <> n.createdBy.userId)
		""")
	long countRecipientsExcludingSender(@Param("notificationId") Long notificationId);

	@Query("""
		select count(nr)
		from NotificationRecipient nr
		join nr.notification n
		where n.notificationId = :notificationId
		  and nr.read = true
		  and (n.createdBy is null or nr.user.userId <> n.createdBy.userId)
		""")
	long countReadRecipientsExcludingSender(@Param("notificationId") Long notificationId);

	@Query("""
		select count(nr)
		from NotificationRecipient nr
		join nr.notification n
		where nr.user.userId = :userId
		  and nr.read = false
		  and n.status = 'published'
		  and (n.createdBy is null or n.createdBy.userId <> :userId)
		  and (n.expiresAt is null or n.expiresAt > CURRENT_TIMESTAMP)
		""")
	long countUnreadByUserId(@Param("userId") Long userId);

	@Modifying
	@Query("""
		update NotificationRecipient nr
		set nr.read = true, nr.readAt = :readAt
		where nr.user.userId = :userId
		  and nr.read = false
		  and nr.notification.notificationId in (
		  	select n.notificationId
		  	from Notification n
		  	where n.status = 'published'
		  	  and (n.createdBy is null or n.createdBy.userId <> :userId)
		  	  and (n.expiresAt is null or n.expiresAt > CURRENT_TIMESTAMP)
		  )
		""")
	int markAllAsRead(@Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);
}
