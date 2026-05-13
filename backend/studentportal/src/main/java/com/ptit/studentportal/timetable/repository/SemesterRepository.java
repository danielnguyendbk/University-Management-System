package com.ptit.studentportal.timetable.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ptit.studentportal.timetable.entity.Semester;

import java.util.Optional;

public interface SemesterRepository extends JpaRepository<Semester, Long> {
    Optional<Semester> findBySemesterId(String semester_id);
}
