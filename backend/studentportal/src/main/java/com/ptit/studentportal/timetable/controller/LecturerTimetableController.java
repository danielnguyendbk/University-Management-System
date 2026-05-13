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
@RequestMapping("/api/lecturer/timetable")
public class LecturerTimetableController {

	private final TimetableQueryService timetableQueryService;

	public LecturerTimetableController(TimetableQueryService timetableQueryService) {
		this.timetableQueryService = timetableQueryService;
	}

	@GetMapping
	public ResponseEntity<ApiResponse<List<TimetableItemResponse>>> getLecturerTimetable(
			@RequestParam Long lecturerId,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
	) {
		List<TimetableItemResponse> response = timetableQueryService.getLecturerTimetable(lecturerId, fromDate, toDate);
		return ResponseEntity.ok(ApiResponse.success("Lecturer timetable loaded", response));
	}
}

