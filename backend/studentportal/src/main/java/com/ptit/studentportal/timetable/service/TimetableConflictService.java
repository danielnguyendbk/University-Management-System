package com.ptit.studentportal.timetable.service;

import java.time.LocalTime;

public interface TimetableConflictService {

	void validateScheduleConflicts(
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
	);
}

