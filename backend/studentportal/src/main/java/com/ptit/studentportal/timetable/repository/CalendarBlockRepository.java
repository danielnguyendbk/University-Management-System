package com.ptit.studentportal.timetable.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ptit.studentportal.timetable.entity.AcademicCalendarBlock;

public interface CalendarBlockRepository extends JpaRepository<AcademicCalendarBlock, Long> {

	List<AcademicCalendarBlock> findBySemesterId(Long semesterId);

	List<AcademicCalendarBlock> findBySemesterIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
			Long semesterId,
			LocalDate startDate,
			LocalDate endDate
	);
}

