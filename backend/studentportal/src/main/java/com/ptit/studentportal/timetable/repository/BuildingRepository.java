package com.ptit.studentportal.timetable.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ptit.studentportal.timetable.entity.Building;

public interface BuildingRepository extends JpaRepository<Building, Long> {
}

