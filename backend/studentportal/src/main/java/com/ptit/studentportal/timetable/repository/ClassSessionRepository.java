package com.ptit.studentportal.timetable.repository;

import java.time.LocalDate;
import java.util.List;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ptit.studentportal.timetable.entity.ClassSession;
import com.ptit.studentportal.timetable.dto.response.ClassSessionViewProjection;

public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {

	List<ClassSession> findBySectionId(Long sectionId);

	List<ClassSession> findBySectionIdAndSessionDateBetween(Long sectionId, LocalDate fromDate, LocalDate toDate);

	List<ClassSession> findByLecturerIdAndSessionDateBetween(Long lecturerId, LocalDate fromDate, LocalDate toDate);

	List<ClassSession> findBySessionDateBetween(LocalDate fromDate, LocalDate toDate);

	Optional<ClassSession> findByScheduleIdAndSemesterWeekId(Long scheduleId, Long semesterWeekId);

	boolean existsByScheduleId(Long scheduleId);

	@Modifying
	@Query(value = """
			DELETE cs
			FROM class_sessions cs
			JOIN course_sections sec ON sec.section_id = cs.section_id
			WHERE sec.semester_id = :semesterId
			""", nativeQuery = true)
	int deleteBySemesterId(@Param("semesterId") Long semesterId);

	@Modifying
	@Query(value = """
			DELETE cs
			FROM class_sessions cs
			JOIN semester_weeks sw ON sw.semester_week_id = cs.semester_week_id
			JOIN semesters sem ON sem.semester_id = sw.semester_id
			WHERE sem.semester_code = :semesterCode
			""", nativeQuery = true)
	int deleteBySemesterCode(@Param("semesterCode") String semesterCode);

	@Query(value = """
			SELECT cs.*
			FROM class_sessions cs
			WHERE cs.lecturer_id = :lecturerId
			  AND cs.session_date = :sessionDate
			  AND LOWER(cs.session_status) <> 'cancelled'
			  AND NOT (:newSlotEnd < cs.slot_start OR :newSlotStart > cs.slot_end)
			  AND (:excludeSessionId IS NULL OR cs.session_id <> :excludeSessionId)
			""", nativeQuery = true)
	List<ClassSession> findLecturerConflictOnDate(
			@Param("lecturerId") Long lecturerId,
			@Param("sessionDate") LocalDate sessionDate,
			@Param("newSlotStart") Integer newSlotStart,
			@Param("newSlotEnd") Integer newSlotEnd,
			@Param("excludeSessionId") Long excludeSessionId
	);

	@Query(value = """
			SELECT cs.*
			FROM class_sessions cs
			JOIN course_sections sec ON sec.section_id = cs.section_id
			WHERE cs.lecturer_id = :lecturerId
			  AND cs.session_date BETWEEN :fromDate AND :toDate
			""", nativeQuery = true)
	List<ClassSession> findLecturerSessionsPublished(
			@Param("lecturerId") Long lecturerId,
			@Param("fromDate") LocalDate fromDate,
			@Param("toDate") LocalDate toDate
	);

	@Query(value = """
			SELECT 
			  cs.session_id as sessionId, 
			  cs.schedule_id as scheduleId, 
			  sem.semester_id as semesterId, 
			  sw.week_no as weekNo, 
			  cs.session_date as sessionDate,
			  CASE DAYOFWEEK(cs.session_date)
			    WHEN 2 THEN 'MON'
			    WHEN 3 THEN 'TUE'
			    WHEN 4 THEN 'WED'
			    WHEN 5 THEN 'THU'
			    WHEN 6 THEN 'FRI'
			    WHEN 7 THEN 'SAT'
			    WHEN 1 THEN 'SUN'
			  END as dayOfWeek,
			  CASE DAYOFWEEK(cs.session_date)
				WHEN 2 THEN 'Thứ 2'
				WHEN 3 THEN 'Thứ 3'
				WHEN 4 THEN 'Thứ 4'
				WHEN 5 THEN 'Thứ 5'
				WHEN 6 THEN 'Thứ 6'
				WHEN 7 THEN 'Thứ 7'
				WHEN 1 THEN 'Chủ nhật'
			  END as dayOfWeekLabel,
			  sec.section_code as sectionCode, 
			  c.course_code as courseCode, 
			  c.course_name as courseName,
			  r.room_code as roomCode, 
			  b.building_code as buildingCode, 
			  b.building_name as buildingName,
			  l.lecturer_code as lecturerCode, 
			  l.full_name as lecturerName,
			  cs.slot_start as slotStart, 
			  cs.slot_end as slotEnd, 
			  cs.start_time as startTime, 
			  cs.end_time as endTime,
			  CASE WHEN COALESCE(cs.practice_group_no, s.practice_group_no, 0) > 0 THEN 'practice' ELSE COALESCE(s.session_type, 'theory') END as sessionType,
			  COALESCE(cs.practice_group_no, s.practice_group_no, 0) as practiceGroupNo,
			  cs.session_status as sessionStatus, 
			  cs.note as note
			FROM class_sessions cs
			JOIN semester_weeks sw ON sw.semester_week_id = cs.semester_week_id
			JOIN course_sections sec ON sec.section_id = cs.section_id
			JOIN semesters sem ON sem.semester_id = sec.semester_id
			JOIN courses c ON c.course_id = sec.course_id
			LEFT JOIN rooms r ON r.room_id = cs.room_id
			LEFT JOIN buildings b ON b.building_id = r.building_id
			LEFT JOIN lecturers l ON l.lecturer_id = cs.lecturer_id
			LEFT JOIN schedules s ON s.schedule_id = cs.schedule_id
			WHERE sem.semester_id = :semesterId
			  AND sw.week_no = :weekNo
			  AND (:buildingId IS NULL OR b.building_id = :buildingId)
			  AND (:roomId IS NULL OR r.room_id = :roomId)
			  AND (:sessionType IS NULL OR LOWER(CASE WHEN COALESCE(cs.practice_group_no, s.practice_group_no, 0) > 0 THEN 'practice' ELSE COALESCE(s.session_type, 'theory') END) = LOWER(:sessionType))
			  AND (:lecturerId IS NULL OR cs.lecturer_id = :lecturerId)
			  AND (:sectionId IS NULL OR cs.section_id = :sectionId)
			  ORDER BY cs.session_date ASC, cs.slot_start ASC
			""", nativeQuery = true)
	List<ClassSessionViewProjection> findClassSessionsView(
			@Param("semesterId") Long semesterId,
			@Param("weekNo") Integer weekNo,
			@Param("buildingId") Long buildingId,
			@Param("roomId") Long roomId,
			@Param("sessionType") String sessionType,
			@Param("lecturerId") Long lecturerId,
			@Param("sectionId") Long sectionId
	);

	@Query(value = """
			SELECT
			    cs.session_id AS sessionId,
			    cs.section_id AS sectionId,
			    cs.schedule_id AS scheduleId,
			    sec.semester_id AS semesterId,
			    NULL AS weekNo,
			    cs.session_date AS sessionDate,
			    NULL AS dayOfWeek,
			    NULL AS dayOfWeekLabel,
			    sec.section_code AS sectionCode,
			    c.course_code AS courseCode,
			    c.course_name AS courseName,
			    r.room_code AS roomCode,
			    NULL AS buildingCode,
			    NULL AS buildingName,
			    NULL AS lecturerCode,
			    l.full_name AS lecturerName,
			    cs.slot_start AS slotStart,
			    cs.slot_end AS slotEnd,
			    cs.start_time AS startTime,
			    cs.end_time AS endTime,
			    CASE WHEN COALESCE(cs.practice_group_no, s.practice_group_no, 0) > 0 THEN 'practice' ELSE COALESCE(s.session_type, 'theory') END AS sessionType,
			    COALESCE(cs.practice_group_no, s.practice_group_no, 0) AS practiceGroupNo,
			    cs.session_status AS sessionStatus,
			    cs.note AS note
			FROM class_sessions cs
			JOIN course_sections sec ON sec.section_id = cs.section_id
			JOIN courses c ON c.course_id = sec.course_id
			JOIN enrollments e ON e.section_id = sec.section_id
			JOIN students st ON st.student_id = e.student_id
			LEFT JOIN rooms r ON r.room_id = cs.room_id
			LEFT JOIN lecturers l ON l.lecturer_id = cs.lecturer_id
			LEFT JOIN schedules s ON s.schedule_id = cs.schedule_id
			WHERE st.student_id = :studentId
			  AND LOWER(e.enrollment_status) IN ('registered', 'completed')
			  AND cs.session_date BETWEEN :fromDate AND :toDate
			  AND LOWER(cs.session_status) <> 'cancelled'
			ORDER BY cs.session_date, cs.start_time
			""", nativeQuery = true)
	List<ClassSessionViewProjection> findStudentTimetable(
			@Param("studentId") Long studentId,
			@Param("fromDate") LocalDate fromDate,
			@Param("toDate") LocalDate toDate
	);

	@Query(value = """
			SELECT
			    cs.session_id AS sessionId,
			    cs.section_id AS sectionId,
			    cs.schedule_id AS scheduleId,
			    sec.semester_id AS semesterId,
			    NULL AS weekNo,
			    cs.session_date AS sessionDate,
			    NULL AS dayOfWeek,
			    NULL AS dayOfWeekLabel,
			    sec.section_code AS sectionCode,
			    c.course_code AS courseCode,
			    c.course_name AS courseName,
			    r.room_code AS roomCode,
			    NULL AS buildingCode,
			    NULL AS buildingName,
			    NULL AS lecturerCode,
			    l.full_name AS lecturerName,
			    cs.slot_start AS slotStart,
			    cs.slot_end AS slotEnd,
			    cs.start_time AS startTime,
			    cs.end_time AS endTime,
			    CASE WHEN COALESCE(cs.practice_group_no, s.practice_group_no, 0) > 0 THEN 'practice' ELSE COALESCE(s.session_type, 'theory') END AS sessionType,
			    COALESCE(cs.practice_group_no, s.practice_group_no, 0) AS practiceGroupNo,
			    cs.session_status AS sessionStatus,
			    cs.note AS note
			FROM class_sessions cs
			JOIN course_sections sec ON sec.section_id = cs.section_id
			JOIN courses c ON c.course_id = sec.course_id
			LEFT JOIN rooms r ON r.room_id = cs.room_id
			LEFT JOIN lecturers l ON l.lecturer_id = cs.lecturer_id
			LEFT JOIN schedules s ON s.schedule_id = cs.schedule_id
			WHERE cs.section_id = :sectionId
			  AND cs.session_date BETWEEN :fromDate AND :toDate
			  AND LOWER(cs.session_status) <> 'cancelled'
			ORDER BY cs.session_date, cs.start_time
			""", nativeQuery = true)
	List<ClassSessionViewProjection> findSectionTimetable(
			@Param("sectionId") Long sectionId,
			@Param("fromDate") LocalDate fromDate,
			@Param("toDate") LocalDate toDate
	);

	@Query(value = """
			SELECT
			    cs.session_id AS sessionId,
			    cs.section_id AS sectionId,
			    cs.schedule_id AS scheduleId,
			    sec.semester_id AS semesterId,
			    NULL AS weekNo,
			    cs.session_date AS sessionDate,
			    NULL AS dayOfWeek,
			    NULL AS dayOfWeekLabel,
			    sec.section_code AS sectionCode,
			    c.course_code AS courseCode,
			    c.course_name AS courseName,
			    r.room_code AS roomCode,
			    NULL AS buildingCode,
			    NULL AS buildingName,
			    NULL AS lecturerCode,
			    l.full_name AS lecturerName,
			    cs.slot_start AS slotStart,
			    cs.slot_end AS slotEnd,
			    cs.start_time AS startTime,
			    cs.end_time AS endTime,
			    CASE WHEN COALESCE(cs.practice_group_no, s.practice_group_no, 0) > 0 THEN 'practice' ELSE COALESCE(s.session_type, 'theory') END AS sessionType,
			    COALESCE(cs.practice_group_no, s.practice_group_no, 0) AS practiceGroupNo,
			    cs.session_status AS sessionStatus,
			    cs.note AS note
			FROM class_sessions cs
			JOIN course_sections sec ON sec.section_id = cs.section_id
			JOIN courses c ON c.course_id = sec.course_id
			LEFT JOIN rooms r ON r.room_id = cs.room_id
			LEFT JOIN lecturers l ON l.lecturer_id = cs.lecturer_id
			LEFT JOIN schedules s ON s.schedule_id = cs.schedule_id
			WHERE cs.lecturer_id = :lecturerId
			  AND cs.session_date BETWEEN :fromDate AND :toDate
			  AND LOWER(cs.session_status) <> 'cancelled'
			ORDER BY cs.session_date, cs.start_time
			""", nativeQuery = true)
	List<ClassSessionViewProjection> findLecturerTimetable(
			@Param("lecturerId") Long lecturerId,
			@Param("fromDate") LocalDate fromDate,
			@Param("toDate") LocalDate toDate
	);
}


