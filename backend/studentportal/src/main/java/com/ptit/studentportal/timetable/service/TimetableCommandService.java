package com.ptit.studentportal.timetable.service;

import java.util.List;

import com.ptit.studentportal.timetable.dto.request.CreateScheduleRequest;
import com.ptit.studentportal.timetable.dto.request.GenerateClassSessionsRequest;
import com.ptit.studentportal.timetable.dto.request.UpdateClassSessionRequest;
import com.ptit.studentportal.timetable.entity.ClassSession;
import com.ptit.studentportal.timetable.entity.Schedule;

public interface TimetableCommandService {

	Schedule createSchedule(CreateScheduleRequest request);

	List<ClassSession> generateClassSessions(GenerateClassSessionsRequest request);

	ClassSession updateClassSession(Long sessionId, UpdateClassSessionRequest request);
}

