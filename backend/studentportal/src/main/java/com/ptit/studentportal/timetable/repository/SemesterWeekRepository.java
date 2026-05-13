package com.ptit.studentportal.timetable.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ptit.studentportal.timetable.entity.SemesterWeek;

public interface SemesterWeekRepository extends JpaRepository<SemesterWeek, Long> {

	Optional<SemesterWeek> findBySemesterIdAndWeekNo(Long semesterId, Integer weekNo);

	List<SemesterWeek> findBySemesterIdOrderByWeekNo(Long semesterId);

	List<SemesterWeek> findBySemesterIdAndWeekNoBetweenOrderByWeekNo(Long semesterId, Integer fromWeekNo, Integer toWeekNo);
}

