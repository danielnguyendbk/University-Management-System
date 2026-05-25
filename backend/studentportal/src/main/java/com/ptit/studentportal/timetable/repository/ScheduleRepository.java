package com.ptit.studentportal.timetable.repository;

import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ptit.studentportal.timetable.entity.Schedule;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

	List<Schedule> findBySectionId(Long sectionId);

	@Query(value = "SELECT s.* FROM schedules s JOIN course_sections cs ON s.section_id = cs.section_id WHERE cs.semester_id = :semesterId", nativeQuery = true)
	List<Schedule> findActiveSchedulesBySemesterId(@Param("semesterId") Long semesterId);

	@Query(value = """
			SELECT COUNT(*)
			FROM schedules s
			JOIN course_sections cs ON s.section_id = cs.section_id
			WHERE cs.semester_id = :semesterId
			""", nativeQuery = true)
	Integer countSchedulesBySemesterId(@Param("semesterId") Long semesterId);

	@Modifying
	@Query(value = """
			DELETE s
			FROM schedules s
			JOIN course_sections cs ON cs.section_id = s.section_id
			WHERE cs.semester_id = :semesterId
			""", nativeQuery = true)
	int deleteBySemesterId(@Param("semesterId") Long semesterId);

	@Modifying
	@Query(value = """
			DELETE s
			FROM schedules s
			JOIN course_sections cs ON cs.section_id = s.section_id
			JOIN semesters sem ON sem.semester_id = cs.semester_id
			WHERE sem.semester_code = :semesterCode
			""", nativeQuery = true)
	int deleteBySemesterCode(@Param("semesterCode") String semesterCode);

	@Query(value = """
			SELECT s.*
			FROM schedules s
			JOIN course_sections cs ON s.section_id = cs.section_id
			WHERE cs.semester_id = :semesterId
			  AND s.day_of_week = :dayOfWeek
			  AND s.room_id = :roomId
			  AND s.from_week_no <= :toWeekNo
			  AND s.to_week_no >= :fromWeekNo
			  AND s.start_time < :endTime
			  AND s.end_time > :startTime
			  AND (:excludeId IS NULL OR s.schedule_id <> :excludeId)
			""", nativeQuery = true)
	List<Schedule> findRoomOverlaps(
			@Param("semesterId") Long semesterId,
			@Param("dayOfWeek") String dayOfWeek,
			@Param("roomId") Long roomId,
			@Param("fromWeekNo") Integer fromWeekNo,
			@Param("toWeekNo") Integer toWeekNo,
			@Param("startTime") LocalTime startTime,
			@Param("endTime") LocalTime endTime,
			@Param("excludeId") Long excludeId
	);

	@Query(value = """
			SELECT s.*
			FROM schedules s
			JOIN course_sections cs ON s.section_id = cs.section_id
			WHERE cs.semester_id = :semesterId
			  AND s.day_of_week = :dayOfWeek
			  AND s.room_id = :roomId
			  AND s.from_week_no <= :toWeekNo
			  AND s.to_week_no >= :fromWeekNo
			  AND NOT (:slotEnd < s.slot_start OR :slotStart > s.slot_end)
			  AND (:excludeId IS NULL OR s.schedule_id <> :excludeId)
			""", nativeQuery = true)
	List<Schedule> findRoomSlotOverlaps(
			@Param("semesterId") Long semesterId,
			@Param("dayOfWeek") String dayOfWeek,
			@Param("roomId") Long roomId,
			@Param("fromWeekNo") Integer fromWeekNo,
			@Param("toWeekNo") Integer toWeekNo,
			@Param("slotStart") Integer slotStart,
			@Param("slotEnd") Integer slotEnd,
			@Param("excludeId") Long excludeId
	);

	@Query(value = """
			SELECT s.*
			FROM schedules s
			JOIN course_sections cs ON s.section_id = cs.section_id
			WHERE cs.semester_id = :semesterId
			  AND s.day_of_week = :dayOfWeek
			  AND s.section_id = :sectionId
			  AND s.from_week_no <= :toWeekNo
			  AND s.to_week_no >= :fromWeekNo
			  AND s.start_time < :endTime
			  AND s.end_time > :startTime
			  AND (:excludeId IS NULL OR s.schedule_id <> :excludeId)
			""", nativeQuery = true)
	List<Schedule> findSectionOverlaps(
			@Param("semesterId") Long semesterId,
			@Param("dayOfWeek") String dayOfWeek,
			@Param("sectionId") Long sectionId,
			@Param("fromWeekNo") Integer fromWeekNo,
			@Param("toWeekNo") Integer toWeekNo,
			@Param("startTime") LocalTime startTime,
			@Param("endTime") LocalTime endTime,
			@Param("excludeId") Long excludeId
	);

	@Query(value = """
			SELECT s.*
			FROM schedules s
			JOIN course_sections cs ON s.section_id = cs.section_id
			WHERE cs.semester_id = :semesterId
			  AND s.day_of_week = :dayOfWeek
			  AND s.section_id = :sectionId
			  AND s.from_week_no <= :toWeekNo
			  AND s.to_week_no >= :fromWeekNo
			  AND NOT (:slotEnd < s.slot_start OR :slotStart > s.slot_end)
			  AND (:excludeId IS NULL OR s.schedule_id <> :excludeId)
			""", nativeQuery = true)
	List<Schedule> findSectionSlotOverlaps(
			@Param("semesterId") Long semesterId,
			@Param("dayOfWeek") String dayOfWeek,
			@Param("sectionId") Long sectionId,
			@Param("fromWeekNo") Integer fromWeekNo,
			@Param("toWeekNo") Integer toWeekNo,
			@Param("slotStart") Integer slotStart,
			@Param("slotEnd") Integer slotEnd,
			@Param("excludeId") Long excludeId
	);

	@Query(value = """
			SELECT s.*
			FROM schedules s
			JOIN course_sections sec ON sec.section_id = s.section_id
			WHERE sec.semester_id = :semesterId
			  AND s.day_of_week = :dayOfWeek
			  AND sec.lecturer_id = :lecturerId
			  AND s.from_week_no <= :toWeekNo
			  AND s.to_week_no >= :fromWeekNo
			  AND s.start_time < :endTime
			  AND s.end_time > :startTime
			  AND (:excludeId IS NULL OR s.schedule_id <> :excludeId)
			""", nativeQuery = true)
	List<Schedule> findLecturerOverlaps(
			@Param("semesterId") Long semesterId,
			@Param("dayOfWeek") String dayOfWeek,
			@Param("lecturerId") Long lecturerId,
			@Param("fromWeekNo") Integer fromWeekNo,
			@Param("toWeekNo") Integer toWeekNo,
			@Param("startTime") LocalTime startTime,
			@Param("endTime") LocalTime endTime,
			@Param("excludeId") Long excludeId
	);

	@Query(value = """
			SELECT s.*
			FROM schedules s
			JOIN course_sections sec ON sec.section_id = s.section_id
			WHERE sec.semester_id = :semesterId
			  AND s.day_of_week = :dayOfWeek
			  AND sec.lecturer_id = :lecturerId
			  AND s.from_week_no <= :toWeekNo
			  AND s.to_week_no >= :fromWeekNo
			  AND NOT (:slotEnd < s.slot_start OR :slotStart > s.slot_end)
			  AND (:excludeId IS NULL OR s.schedule_id <> :excludeId)
			""", nativeQuery = true)
	List<Schedule> findLecturerSlotOverlaps(
			@Param("semesterId") Long semesterId,
			@Param("dayOfWeek") String dayOfWeek,
			@Param("lecturerId") Long lecturerId,
			@Param("fromWeekNo") Integer fromWeekNo,
			@Param("toWeekNo") Integer toWeekNo,
			@Param("slotStart") Integer slotStart,
			@Param("slotEnd") Integer slotEnd,
			@Param("excludeId") Long excludeId
	);

	@Query(value = """
			SELECT
			    s.schedule_id AS scheduleId,
			    s.section_id AS sectionId,
			    sec.section_code AS sectionCode,
			    c.course_code AS courseCode,
			    c.course_name AS courseName,
			    r.room_code AS roomCode,
			    r.room_code AS roomName,
			    l.full_name AS lecturerName,
			    s.day_of_week AS dayOfWeek,
			    s.from_week_no AS fromWeekNo,
			    s.to_week_no AS toWeekNo,
			    s.slot_start AS slotStart,
			    s.slot_end AS slotEnd,
			    s.start_time AS startTime,
			    s.end_time AS endTime,
			    s.session_type AS sessionType,
			    s.practice_group_no AS practiceGroupNo,
			    NULL AS note
			FROM schedules s
			JOIN course_sections sec ON sec.section_id = s.section_id
			JOIN courses c ON c.course_id = sec.course_id
			JOIN enrollments e ON e.section_id = sec.section_id
			JOIN students st ON st.student_id = e.student_id
			LEFT JOIN rooms r ON r.room_id = s.room_id
			LEFT JOIN lecturers l ON l.lecturer_id = sec.lecturer_id
			WHERE st.student_id = :studentId
			  AND LOWER(e.enrollment_status) IN ('registered', 'completed')
			ORDER BY s.day_of_week, s.start_time
			""", nativeQuery = true)
	List<com.ptit.studentportal.timetable.dto.response.ScheduleViewProjection> findStudentSchedules(@Param("studentId") Long studentId);

	@Query(value = """
			SELECT
			    s.schedule_id AS scheduleId,
			    s.section_id AS sectionId,
			    sec.section_code AS sectionCode,
			    c.course_code AS courseCode,
			    c.course_name AS courseName,
			    r.room_code AS roomCode,
			    r.room_code AS roomName,
			    l.full_name AS lecturerName,
			    s.day_of_week AS dayOfWeek,
			    s.from_week_no AS fromWeekNo,
			    s.to_week_no AS toWeekNo,
			    s.slot_start AS slotStart,
			    s.slot_end AS slotEnd,
			    s.start_time AS startTime,
			    s.end_time AS endTime,
			    s.session_type AS sessionType,
			    s.practice_group_no AS practiceGroupNo,
			    NULL AS note
			FROM schedules s
			JOIN course_sections sec ON sec.section_id = s.section_id
			JOIN courses c ON c.course_id = sec.course_id
			LEFT JOIN rooms r ON r.room_id = s.room_id
			LEFT JOIN lecturers l ON l.lecturer_id = sec.lecturer_id
			WHERE s.section_id = :sectionId
			ORDER BY s.day_of_week, s.start_time
			""", nativeQuery = true)
	List<com.ptit.studentportal.timetable.dto.response.ScheduleViewProjection> findSectionSchedules(@Param("sectionId") Long sectionId);

	@Query(value = """
			SELECT
			    s.schedule_id AS scheduleId,
			    s.section_id AS sectionId,
			    sec.section_code AS sectionCode,
			    c.course_code AS courseCode,
			    c.course_name AS courseName,
			    r.room_code AS roomCode,
			    r.room_code AS roomName,
			    l.full_name AS lecturerName,
			    s.day_of_week AS dayOfWeek,
			    s.from_week_no AS fromWeekNo,
			    s.to_week_no AS toWeekNo,
			    s.slot_start AS slotStart,
			    s.slot_end AS slotEnd,
			    s.start_time AS startTime,
			    s.end_time AS endTime,
			    s.session_type AS sessionType,
			    s.practice_group_no AS practiceGroupNo,
			    NULL AS note
			FROM schedules s
			JOIN course_sections sec ON sec.section_id = s.section_id
			JOIN courses c ON c.course_id = sec.course_id
			LEFT JOIN rooms r ON r.room_id = s.room_id
			LEFT JOIN lecturers l ON l.lecturer_id = sec.lecturer_id
			WHERE sec.lecturer_id = :lecturerId
			ORDER BY s.day_of_week, s.start_time
			""", nativeQuery = true)
	List<com.ptit.studentportal.timetable.dto.response.ScheduleViewProjection> findLecturerSchedules(@Param("lecturerId") Long lecturerId);
}


