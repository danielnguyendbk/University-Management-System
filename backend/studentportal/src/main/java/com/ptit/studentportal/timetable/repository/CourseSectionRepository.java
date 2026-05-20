package com.ptit.studentportal.timetable.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ptit.studentportal.timetable.entity.CourseSection;
import com.ptit.studentportal.timetable.dto.response.SectionOptionProjection;

public interface CourseSectionRepository extends JpaRepository<CourseSection, Long> {

	List<CourseSection> findBySemesterId(Long semesterId);
	Optional<CourseSection> findBySectionCodeAndSemesterId(String sectionCode, Long semesterId);

	@Query(value = """
			SELECT
			  sec.section_id AS sectionId,
			  sec.section_code AS sectionCode,
			  c.course_code AS courseCode,
			  c.course_name AS courseName,
			  l.full_name AS lecturerName,
			  sec.status AS status
			FROM course_sections sec
			JOIN courses c ON c.course_id = sec.course_id
			LEFT JOIN lecturers l ON l.lecturer_id = sec.lecturer_id
			WHERE sec.semester_id = :semesterId
			  AND sec.status <> 'cancelled'
			ORDER BY c.course_code, sec.section_code
			""", nativeQuery = true)
	List<SectionOptionProjection> findSectionOptions(@Param("semesterId") Long semesterId);

	@Query(value = """
			SELECT 
			    sec.section_id AS sectionId,
			    sec.section_code AS sectionCode,
			    c.course_id AS courseId,
			    c.course_code AS courseCode,
			    c.course_name AS courseName,
			    sc.class_id AS classId,
			    sc.class_code AS classCode,
			    sec.lecturer_id AS lecturerId,
			    l.lecturer_code AS lecturerCode,
			    l.full_name AS lecturerName,
			    sec.max_capacity AS maxCapacity,
			    sec.status AS status,
			    EXISTS(SELECT 1 FROM schedules WHERE section_id = sec.section_id) AS hasSchedule,
			    EXISTS(SELECT 1 FROM class_sessions WHERE section_id = sec.section_id) AS hasGeneratedSessions
			FROM course_sections sec
			JOIN courses c ON c.course_id = sec.course_id
			LEFT JOIN student_classes sc ON sc.class_id = sec.class_id
			LEFT JOIN lecturers l ON l.lecturer_id = sec.lecturer_id
			WHERE sec.semester_id = :semesterId
			ORDER BY c.course_code, sec.section_code
			""", nativeQuery = true)
	List<com.ptit.studentportal.assignment.dto.CourseSectionAssignmentProjection> findAssignmentsBySemesterId(@Param("semesterId") Long semesterId);

	@Query(value = """
			SELECT EXISTS(
			  SELECT 1
			  FROM schedules target
			  JOIN schedules other_s ON other_s.day_of_week = target.day_of_week
			  JOIN course_sections other_sec ON other_sec.section_id = other_s.section_id
			  WHERE target.section_id = :sectionId
			    AND other_sec.lecturer_id = :newLecturerId
			    AND other_sec.semester_id = :semesterId
			    AND other_s.section_id <> :sectionId
			    AND NOT (target.slot_end < other_s.slot_start OR target.slot_start > other_s.slot_end)
			    AND (
			        target.from_week_no IS NULL
			        OR target.to_week_no IS NULL
			        OR other_s.from_week_no IS NULL
			        OR other_s.to_week_no IS NULL
			        OR NOT (target.to_week_no < other_s.from_week_no OR target.from_week_no > other_s.to_week_no)
			    )
			)
			""", nativeQuery = true)
	Integer checkLecturerScheduleConflict(
			@Param("sectionId") Long sectionId,
			@Param("newLecturerId") Long newLecturerId,
			@Param("semesterId") Long semesterId
	);

	@Query(value = """
			SELECT EXISTS(
			  SELECT 1
			  FROM class_sessions target
			  JOIN class_sessions other_cs
			    ON other_cs.session_date = target.session_date
			  WHERE target.section_id = :sectionId
			    AND other_cs.lecturer_id = :newLecturerId
			    AND other_cs.section_id <> :sectionId
			    AND LOWER(other_cs.session_status) <> 'cancelled'
			    AND LOWER(target.session_status) <> 'cancelled'
			    AND NOT (target.slot_end < other_cs.slot_start OR target.slot_start > other_cs.slot_end)
			)
			""", nativeQuery = true)
	Integer checkLecturerSessionConflict(
			@Param("sectionId") Long sectionId,
			@Param("newLecturerId") Long newLecturerId
	);

	@Query(value = """
			SELECT
			    sec.section_id AS sectionId,
			    sec.section_code AS sectionCode,
			
			    c.course_id AS courseId,
			    c.course_code AS courseCode,
			    c.course_name AS courseName,
			    c.credits AS credits,
			
			    sem.semester_id AS semesterId,
			    sem.semester_code AS semesterCode,
			    sem.semester_name AS semesterName,
			
			    sc.class_id AS classId,
			    sc.class_code AS classCode,
			
			    sec.max_capacity AS maxCapacity,
			    sec.status AS status,
			
			    COALESCE(v.current_capacity, 0) AS currentCapacity,
			    COALESCE(v.remaining_capacity, sec.max_capacity) AS remainingCapacity,
			
			    CASE WHEN EXISTS (
			        SELECT 1
			        FROM schedules s
			        WHERE s.section_id = sec.section_id
			    ) THEN TRUE ELSE FALSE END AS hasSchedule,
			
			    CASE WHEN EXISTS (
			        SELECT 1
			        FROM class_sessions cs
			        WHERE cs.section_id = sec.section_id
			    ) THEN TRUE ELSE FALSE END AS hasGeneratedSessions
			
			FROM course_sections sec
			JOIN courses c ON c.course_id = sec.course_id
			JOIN semesters sem ON sem.semester_id = sec.semester_id
			LEFT JOIN student_classes sc ON sc.class_id = sec.class_id
			LEFT JOIN vw_section_capacity v ON v.section_id = sec.section_id
			WHERE sec.lecturer_id = :lecturerId
			  AND (:semesterId IS NULL OR sec.semester_id = :semesterId)
			ORDER BY sem.start_date DESC, c.course_code, sec.section_code
			""", nativeQuery = true)
	List<com.ptit.studentportal.lecturer.LecturerCourseSectionProjection> findLecturerCourseSections(
			@Param("lecturerId") Long lecturerId,
			@Param("semesterId") Long semesterId
	);
}


