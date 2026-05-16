package com.ptit.studentportal.registration.repository;

import com.ptit.studentportal.registration.entity.EnrollmentLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentLogRepository extends JpaRepository<EnrollmentLog, Long> {
}
