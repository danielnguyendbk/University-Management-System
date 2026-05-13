package com.ptit.studentportal.timetable.service;

import java.util.List;

import com.ptit.studentportal.timetable.dto.request.CreateScheduleRequest;
import com.ptit.studentportal.timetable.dto.request.UpdateScheduleRequest;
import com.ptit.studentportal.timetable.dto.response.TimetableItemResponse;
import com.ptit.studentportal.timetable.entity.Schedule;

public interface ScheduleService {

	Schedule createSchedule(CreateScheduleRequest request);

	List<TimetableItemResponse> getSchedulesBySemester(Long semesterId);

	Schedule updateSchedule(Long scheduleId, UpdateScheduleRequest request);

	void deleteSchedule(Long scheduleId);
}

