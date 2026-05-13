package com.ptit.studentportal.timetable.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ptit.studentportal.timetable.entity.ClassSession;

public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {

	List<ClassSession> findBySectionIdAndSessionDateBetween(Long sectionId, LocalDate fromDate, LocalDate toDate);

	List<ClassSession> findByLecturerIdAndSessionDateBetween(Long lecturerId, LocalDate fromDate, LocalDate toDate);

	List<ClassSession> findBySessionDateBetween(LocalDate fromDate, LocalDate toDate);
}

