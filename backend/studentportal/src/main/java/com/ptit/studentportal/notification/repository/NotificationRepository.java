package com.ptit.studentportal.notification.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ptit.studentportal.notification.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

	@Query(
			value = """
				select n
				from Notification n
				left join fetch n.createdBy
				where n.createdBy.userId = :userId
				""",
			countQuery = """
				select count(n)
				from Notification n
				where n.createdBy.userId = :userId
				"""
	)
	Page<Notification> findSentByUserId(@Param("userId") Long userId, Pageable pageable);

	@Modifying
	@Query("update Notification n set n.status = 'archived' where n.notificationId = :notificationId and n.createdBy.userId = :userId")
	int archiveSentNotification(@Param("notificationId") Long notificationId, @Param("userId") Long userId);
}
