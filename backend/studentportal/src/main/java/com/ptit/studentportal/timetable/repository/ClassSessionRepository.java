package com.ptit.studentportal.timetable.repository;

import java.time.LocalDate;
import java.util.List;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ptit.studentportal.timetable.entity.ClassSession;
import com.ptit.studentportal.timetable.dto.response.ClassSessionViewProjection;

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
			  cs.session_type as sessionType, 
			  cs.practice_group_no as practiceGroupNo, 
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
			WHERE sem.semester_id = :semesterId
			  AND sw.week_no = :weekNo
			  AND (:buildingId IS NULL OR b.building_id = :buildingId)
			  AND (:roomId IS NULL OR r.room_id = :roomId)
			  AND (:sessionType IS NULL OR cs.session_type = :sessionType)
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
}

