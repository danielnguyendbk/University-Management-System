package com.ptit.studentportal.timetable.service;

import java.util.List;

import com.ptit.studentportal.timetable.dto.request.CreateCalendarBlockRequest;
import com.ptit.studentportal.timetable.entity.AcademicCalendarBlock;

public interface CalendarBlockService {

	AcademicCalendarBlock create(CreateCalendarBlockRequest request);

	List<AcademicCalendarBlock> getBySemester(Long semesterId);

	AcademicCalendarBlock update(Long blockId, CreateCalendarBlockRequest request);

	void delete(Long blockId);
}

