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
import com.ptit.studentportal.timetable.service.TimetableQueryService;

@RestController
@RequestMapping("/api/student/timetable")
public class StudentTimetableController {

	private final TimetableQueryService timetableQueryService;

	public StudentTimetableController(TimetableQueryService timetableQueryService) {
		this.timetableQueryService = timetableQueryService;
	}

	@GetMapping
	public ResponseEntity<ApiResponse<List<TimetableItemResponse>>> getStudentTimetable(
			@RequestParam Long studentId,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
	) {
		List<TimetableItemResponse> response = timetableQueryService.getStudentTimetable(studentId, fromDate, toDate);
		return ResponseEntity.ok(ApiResponse.success("Student timetable loaded", response));
	}
}

