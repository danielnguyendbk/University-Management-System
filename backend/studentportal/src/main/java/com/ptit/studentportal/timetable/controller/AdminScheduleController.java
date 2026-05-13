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
import com.ptit.studentportal.timetable.dto.request.CreateScheduleRequest;
import com.ptit.studentportal.timetable.dto.request.UpdateScheduleRequest;
import com.ptit.studentportal.timetable.dto.response.TimetableItemResponse;
import com.ptit.studentportal.timetable.entity.Schedule;
import com.ptit.studentportal.timetable.service.ScheduleService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/schedules")
public class AdminScheduleController {

	private final ScheduleService scheduleService;

	public AdminScheduleController(ScheduleService scheduleService) {
		this.scheduleService = scheduleService;
	}

	@PostMapping
	public ResponseEntity<ApiResponse<Schedule>> createSchedule(@Valid @RequestBody CreateScheduleRequest request) {
		Schedule response = scheduleService.createSchedule(request);
		return ResponseEntity.ok(ApiResponse.success("Schedule created", response));
	}

	@GetMapping
	public ResponseEntity<ApiResponse<List<TimetableItemResponse>>> getSchedules(@RequestParam Long semesterId) {
		List<TimetableItemResponse> response = scheduleService.getSchedulesBySemester(semesterId);
		return ResponseEntity.ok(ApiResponse.success("Schedules loaded", response));
	}

	@PutMapping("/{scheduleId}")
	public ResponseEntity<ApiResponse<Schedule>> updateSchedule(
			@PathVariable Long scheduleId,
			@RequestBody UpdateScheduleRequest request
	) {
		Schedule response = scheduleService.updateSchedule(scheduleId, request);
		return ResponseEntity.ok(ApiResponse.success("Schedule updated", response));
	}

	@DeleteMapping("/{scheduleId}")
	public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable Long scheduleId) {
		scheduleService.deleteSchedule(scheduleId);
		return ResponseEntity.ok(ApiResponse.success("Schedule deleted", null));
	}
}

