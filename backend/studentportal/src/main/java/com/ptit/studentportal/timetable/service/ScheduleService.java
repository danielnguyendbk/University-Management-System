package com.ptit.studentportal.timetable.service;

import java.util.List;

import com.ptit.studentportal.timetable.dto.request.CreateScheduleRequest;
import com.ptit.studentportal.timetable.dto.request.UpdateScheduleRequest;
import com.ptit.studentportal.timetable.dto.response.ScheduleResponse;

public interface ScheduleService {

	ScheduleResponse createSchedule(CreateScheduleRequest request);

	List<ScheduleResponse> getSchedulesBySemester(Long semesterId);

	ScheduleResponse updateSchedule(Long scheduleId, UpdateScheduleRequest request);

	void deleteSchedule(Long scheduleId);
}
