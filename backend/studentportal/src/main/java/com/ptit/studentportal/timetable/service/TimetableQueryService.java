package com.ptit.studentportal.timetable.service;

import java.time.LocalDate;
import java.util.List;

import com.ptit.studentportal.timetable.dto.response.TimetableItemResponse;
import com.ptit.studentportal.timetable.dto.response.ClassSessionViewProjection;
import com.ptit.studentportal.timetable.entity.Schedule;

import com.ptit.studentportal.timetable.dto.response.SectionTimetableOptionResponse;

public interface TimetableQueryService {

	List<TimetableItemResponse> getStudentTimetable(Long studentId, LocalDate fromDate, LocalDate toDate);

	List<TimetableItemResponse> getStudentTimetableByUsername(String username, LocalDate fromDate, LocalDate toDate);

	List<TimetableItemResponse> getLecturerTimetable(Long lecturerId, LocalDate fromDate, LocalDate toDate);

	List<TimetableItemResponse> getLecturerTimetableByUsername(String username, LocalDate fromDate, LocalDate toDate);

	List<TimetableItemResponse> getAdminTimetable(LocalDate fromDate, LocalDate toDate);

	List<ClassSessionViewProjection> getAdminTimetableView(Long semesterId, Integer weekNo, Long buildingId, Long roomId, String sessionType, Long lecturerId, Long sectionId);

	TimetableItemResponse mapScheduleToResponse(Schedule schedule);

	List<com.ptit.studentportal.timetable.entity.SemesterWeek> getSemesterWeeks(Long semesterId);

	List<SectionTimetableOptionResponse> getSectionOptions(Long semesterId);

	List<TimetableItemResponse> getSectionTimetable(Long sectionId, LocalDate fromDate, LocalDate toDate);
}