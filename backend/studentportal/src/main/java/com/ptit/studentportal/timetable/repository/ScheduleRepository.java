package com.ptit.studentportal.timetable.repository;

import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ptit.studentportal.timetable.entity.Schedule;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

	List<Schedule> findBySectionId(Long sectionId);

	@Query(value = "SELECT s.* FROM schedules s JOIN course_sections cs ON s.section_id = cs.section_id WHERE cs.semester_id = :semesterId", nativeQuery = true)
	List<Schedule> findActiveSchedulesBySemesterId(@Param("semesterId") Long semesterId);

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
}

