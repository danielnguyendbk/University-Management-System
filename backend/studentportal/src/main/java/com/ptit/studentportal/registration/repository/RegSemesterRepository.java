package com.ptit.studentportal.registration.repository;

import com.ptit.studentportal.timetable.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegSemesterRepository extends JpaRepository<Semester, Long> {

    List<Semester> findAllByOrderBySemesterIdDesc();
}
