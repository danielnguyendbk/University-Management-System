package com.ptit.studentportal.timetable.service;

import java.time.LocalDate;
import java.util.List;

import com.ptit.studentportal.timetable.dto.response.TimetableItemResponse;
import com.ptit.studentportal.timetable.entity.Schedule;

public interface TimetableQueryService {

	List<TimetableItemResponse> getStudentTimetable(Long studentId, LocalDate fromDate, LocalDate toDate);

	List<TimetableItemResponse> getLecturerTimetable(Long lecturerId, LocalDate fromDate, LocalDate toDate);

	List<TimetableItemResponse> getAdminTimetable(LocalDate fromDate, LocalDate toDate);

	TimetableItemResponse mapScheduleToResponse(Schedule schedule);
}