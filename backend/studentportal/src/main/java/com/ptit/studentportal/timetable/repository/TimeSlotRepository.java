package com.ptit.studentportal.timetable.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ptit.studentportal.timetable.entity.TimeSlot;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, Integer> {
    List<TimeSlot> findAllByOrderBySlotNoAsc();
}