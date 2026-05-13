package com.ptit.studentportal.timetable.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ptit.studentportal.timetable.entity.Semester;

public interface SemesterRepository extends JpaRepository<Semester, Long> {
}
