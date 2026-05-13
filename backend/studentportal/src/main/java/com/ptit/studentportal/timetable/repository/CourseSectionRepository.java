package com.ptit.studentportal.timetable.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ptit.studentportal.timetable.entity.CourseSection;

public interface CourseSectionRepository extends JpaRepository<CourseSection, Long> {

	List<CourseSection> findBySemesterId(Long semesterId);
}

