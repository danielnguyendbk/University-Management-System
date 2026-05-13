package com.ptit.studentportal.timetable.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.timetable.dto.request.CreateScheduleRequest;
import com.ptit.studentportal.timetable.dto.request.GenerateClassSessionsRequest;
import com.ptit.studentportal.timetable.dto.request.UpdateClassSessionRequest;
import com.ptit.studentportal.timetable.dto.response.TimetableItemResponse;
import com.ptit.studentportal.timetable.entity.ClassSession;
import com.ptit.studentportal.timetable.entity.Schedule;
import com.ptit.studentportal.timetable.service.TimetableCommandService;
import com.ptit.studentportal.timetable.service.TimetableQueryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
public class AdminTimetableController {

	private final TimetableQueryService timetableQueryService;
	private final TimetableCommandService timetableCommandService;

	public AdminTimetableController(
			TimetableQueryService timetableQueryService,
			TimetableCommandService timetableCommandService
	) {
		this.timetableQueryService = timetableQueryService;
		this.timetableCommandService = timetableCommandService;
	}

	@GetMapping("/timetable")
	public ResponseEntity<ApiResponse<List<TimetableItemResponse>>> getAdminTimetable(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
	) {
		List<TimetableItemResponse> response = timetableQueryService.getAdminTimetable(fromDate, toDate);
		return ResponseEntity.ok(ApiResponse.success("Admin timetable loaded", response));
	}

	@PostMapping("/schedules")
	public ResponseEntity<ApiResponse<Schedule>> createSchedule(@Valid @RequestBody CreateScheduleRequest request) {
		Schedule response = timetableCommandService.createSchedule(request);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Schedule created", response));
	}

	@PostMapping("/class-sessions/generate")
	public ResponseEntity<ApiResponse<List<ClassSession>>> generateClassSessions(
			@Valid @RequestBody GenerateClassSessionsRequest request
	) {
		List<ClassSession> response = timetableCommandService.generateClassSessions(request);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Class sessions generated", response));
	}

	@PatchMapping("/class-sessions/{id}")
	public ResponseEntity<ApiResponse<ClassSession>> updateClassSession(
			@PathVariable("id") Long sessionId,
			@Valid @RequestBody UpdateClassSessionRequest request
	) {
		ClassSession response = timetableCommandService.updateClassSession(sessionId, request);
		return ResponseEntity.ok(ApiResponse.success("Class session updated", response));
	}
}

