package com.ptit.studentportal.timetable.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ptit.studentportal.timetable.entity.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {
}

