package com.ptit.studentportal.student;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentStatusHistoryRepository extends JpaRepository<StudentStatusHistory, Long> {

	List<StudentStatusHistory> findByStudentIdOrderByChangedAtDesc(Long studentId);
}