package com.ptit.studentportal.timetable.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.timetable.dto.response.TimetableItemResponse;
import com.ptit.studentportal.timetable.entity.AcademicCalendarBlock;
import com.ptit.studentportal.timetable.service.CalendarBlockService;
import com.ptit.studentportal.timetable.service.TimetableQueryService;

import org.springframework.security.core.Authentication;

import com.ptit.studentportal.timetable.dto.response.SectionTimetableOptionResponse;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/student/timetable")
public class StudentTimetableController {

	private final TimetableQueryService timetableQueryService;
	private final CalendarBlockService calendarBlockService;

	public StudentTimetableController(
			TimetableQueryService timetableQueryService,
			CalendarBlockService calendarBlockService
	) {
		this.timetableQueryService = timetableQueryService;
		this.calendarBlockService = calendarBlockService;
	}

	@GetMapping
	public ResponseEntity<ApiResponse<List<TimetableItemResponse>>> getStudentTimetable(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
			Authentication authentication
	) {
		String username = authentication.getName();
		List<TimetableItemResponse> response = timetableQueryService.getStudentTimetableByUsername(username, fromDate, toDate);
		return ResponseEntity.ok(ApiResponse.success("Student timetable loaded", response));
	}

	@GetMapping("/sections")
	public ResponseEntity<ApiResponse<List<SectionTimetableOptionResponse>>> getSectionOptions(
			@RequestParam Long semesterId
	) {
		List<SectionTimetableOptionResponse> response = timetableQueryService.getSectionOptions(semesterId);
		return ResponseEntity.ok(ApiResponse.success("Section options loaded", response));
	}

	@GetMapping("/sections/{sectionId}")
	public ResponseEntity<ApiResponse<List<TimetableItemResponse>>> getSectionTimetable(
			@PathVariable Long sectionId,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
	) {
		List<TimetableItemResponse> response = timetableQueryService.getSectionTimetable(sectionId, fromDate, toDate);
		return ResponseEntity.ok(ApiResponse.success("Section timetable loaded", response));
	}

	@GetMapping("/semesters/{semesterId}/weeks")
	public ResponseEntity<ApiResponse<List<com.ptit.studentportal.timetable.entity.SemesterWeek>>> getSemesterWeeks(
			@PathVariable Long semesterId
	) {
		List<com.ptit.studentportal.timetable.entity.SemesterWeek> response = timetableQueryService.getSemesterWeeks(semesterId);
		return ResponseEntity.ok(ApiResponse.success("Semester weeks loaded", response));
	}

	@GetMapping("/calendar-blocks")
	public ResponseEntity<ApiResponse<List<AcademicCalendarBlock>>> getBlocks(@RequestParam Long semesterId) {
		List<AcademicCalendarBlock> response = calendarBlockService.getBySemester(semesterId);
		return ResponseEntity.ok(ApiResponse.success("Calendar blocks loaded", response));
	}
}


