package com.ptit.studentportal.timetable.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.timetable.dto.request.CreateCalendarBlockRequest;
import com.ptit.studentportal.timetable.entity.AcademicCalendarBlock;
import com.ptit.studentportal.timetable.service.CalendarBlockService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/calendar-blocks")
public class AdminCalendarBlockController {

	private final CalendarBlockService calendarBlockService;

	public AdminCalendarBlockController(CalendarBlockService calendarBlockService) {
		this.calendarBlockService = calendarBlockService;
	}

	@GetMapping
	public ResponseEntity<ApiResponse<List<AcademicCalendarBlock>>> getBlocks(@RequestParam Long semesterId) {
		List<AcademicCalendarBlock> response = calendarBlockService.getBySemester(semesterId);
		return ResponseEntity.ok(ApiResponse.success("Calendar blocks loaded", response));
	}

	@PostMapping
	public ResponseEntity<ApiResponse<AcademicCalendarBlock>> createBlock(
			@Valid @RequestBody CreateCalendarBlockRequest request
	) {
		AcademicCalendarBlock response = calendarBlockService.create(request);
		return ResponseEntity.ok(ApiResponse.success("Calendar block created", response));
	}

	@PutMapping("/{blockId}")
	public ResponseEntity<ApiResponse<AcademicCalendarBlock>> updateBlock(
			@PathVariable Long blockId,
			@Valid @RequestBody CreateCalendarBlockRequest request
	) {
		AcademicCalendarBlock response = calendarBlockService.update(blockId, request);
		return ResponseEntity.ok(ApiResponse.success("Calendar block updated", response));
	}

	@DeleteMapping("/{blockId}")
	public ResponseEntity<ApiResponse<Void>> deleteBlock(@PathVariable Long blockId) {
		calendarBlockService.delete(blockId);
		return ResponseEntity.ok(ApiResponse.success("Calendar block deleted", null));
	}
}

