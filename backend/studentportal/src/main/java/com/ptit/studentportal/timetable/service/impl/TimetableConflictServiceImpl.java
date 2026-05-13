package com.ptit.studentportal.timetable.service.impl;

import java.time.LocalTime;

import org.springframework.stereotype.Service;

import com.ptit.studentportal.timetable.repository.ScheduleRepository;
import com.ptit.studentportal.timetable.service.TimetableConflictService;

@Service
public class TimetableConflictServiceImpl implements TimetableConflictService {

	private final ScheduleRepository scheduleRepository;

	public TimetableConflictServiceImpl(ScheduleRepository scheduleRepository) {
		this.scheduleRepository = scheduleRepository;
	}

	@Override
	public void validateScheduleConflicts(
			Long semesterId,
			Long sectionId,
			Long roomId,
			Long lecturerId,
			String dayOfWeek,
			Integer fromWeekNo,
			Integer toWeekNo,
			LocalTime startTime,
			LocalTime endTime,
			Long excludeScheduleId
	) {
		if (!scheduleRepository.findRoomOverlaps(
					semesterId,
					dayOfWeek,
					roomId,
					fromWeekNo,
					toWeekNo,
					startTime,
					endTime,
					excludeScheduleId
		).isEmpty()) {
			throw new IllegalArgumentException("Trung phong theo khung gio/tuß║ºn.");
		}

		if (!scheduleRepository.findSectionOverlaps(
					semesterId,
					dayOfWeek,
					sectionId,
					fromWeekNo,
					toWeekNo,
					startTime,
					endTime,
					excludeScheduleId
		).isEmpty()) {
			throw new IllegalArgumentException("Trung lop hoc phan theo khung gio/tuß║ºn.");
		}

		if (lecturerId != null && !scheduleRepository.findLecturerOverlaps(
					semesterId,
					dayOfWeek,
					lecturerId,
					fromWeekNo,
					toWeekNo,
					startTime,
					endTime,
					excludeScheduleId
		).isEmpty()) {
			throw new IllegalArgumentException("Trung giang vien theo khung gio/tuß║ºn.");
		}
	}
}

