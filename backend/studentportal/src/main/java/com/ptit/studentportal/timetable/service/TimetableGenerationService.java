package com.ptit.studentportal.timetable.service;

import com.ptit.studentportal.timetable.dto.response.GenerateTimetableResponse;

public interface TimetableGenerationService {

	GenerateTimetableResponse generateForSemester(Long semesterId);
}

