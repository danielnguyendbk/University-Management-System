package com.ptit.studentportal.timetable.repository;

import java.time.LocalDate;
import java.util.List;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ptit.studentportal.timetable.entity.ClassSession;

public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {

	List<ClassSession> findBySectionIdAndSessionDateBetween(Long sectionId, LocalDate fromDate, LocalDate toDate);

	List<ClassSession> findByLecturerIdAndSessionDateBetween(Long lecturerId, LocalDate fromDate, LocalDate toDate);

	List<ClassSession> findBySessionDateBetween(LocalDate fromDate, LocalDate toDate);

	Optional<ClassSession> findByScheduleIdAndSemesterWeekId(Long scheduleId, Long semesterWeekId);

	boolean existsByScheduleId(Long scheduleId);

	@Query(value = """
			SELECT cs.*
			FROM class_sessions cs
			JOIN course_sections sec ON sec.section_id = cs.section_id
			JOIN semesters sem ON sem.semester_id = sec.semester_id
			WHERE cs.lecturer_id = :lecturerId
			  AND cs.session_date BETWEEN :fromDate AND :toDate
			  AND sem.timetable_status IN ('PUBLISHED', 'LOCKED')
			""", nativeQuery = true)
	List<ClassSession> findLecturerSessionsPublished(
			@Param("lecturerId") Long lecturerId,
			@Param("fromDate") LocalDate fromDate,
			@Param("toDate") LocalDate toDate
	);
}

