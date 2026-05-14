package com.ptit.studentportal.timetable.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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
import com.ptit.studentportal.timetable.dto.request.UpdateClassSessionRequest;
import com.ptit.studentportal.timetable.dto.response.GenerateTimetableResponse;
import com.ptit.studentportal.timetable.dto.response.TimetableItemResponse;
import com.ptit.studentportal.timetable.dto.response.ClassSessionViewProjection;
import com.ptit.studentportal.timetable.entity.ClassSession;
import com.ptit.studentportal.timetable.service.TimetableCommandService;
import com.ptit.studentportal.timetable.service.TimetableGenerationService;
import com.ptit.studentportal.timetable.service.TimetableQueryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/timetable")
public class AdminTimetableController {

	private final TimetableQueryService timetableQueryService;
	private final TimetableCommandService timetableCommandService;
	private final TimetableGenerationService timetableGenerationService;

	public AdminTimetableController(
			TimetableQueryService timetableQueryService,
			TimetableCommandService timetableCommandService,
			TimetableGenerationService timetableGenerationService
	) {
		this.timetableQueryService = timetableQueryService;
		this.timetableCommandService = timetableCommandService;
		this.timetableGenerationService = timetableGenerationService;
	}

	@GetMapping
	public ResponseEntity<ApiResponse<List<TimetableItemResponse>>> getAdminTimetable(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
	) {
		List<TimetableItemResponse> response = timetableQueryService.getAdminTimetable(fromDate, toDate);
		return ResponseEntity.ok(ApiResponse.success("Admin timetable loaded", response));
	}

	@GetMapping("/view")
	public ResponseEntity<ApiResponse<List<ClassSessionViewProjection>>> getAdminTimetableView(
			@RequestParam Long semesterId,
			@RequestParam Integer weekNo,
			@RequestParam(required = false) Long buildingId,
			@RequestParam(required = false) Long roomId,
			@RequestParam(required = false) String sessionType,
			@RequestParam(required = false) Long lecturerId,
			@RequestParam(required = false) Long sectionId
	) {
		List<ClassSessionViewProjection> response = timetableQueryService.getAdminTimetableView(
				semesterId, weekNo, buildingId, roomId, sessionType, lecturerId, sectionId
		);
		return ResponseEntity.ok(ApiResponse.success("Timetable view loaded", response != null ? response : List.of()));
	}

	@PostMapping("/generate")
	public ResponseEntity<ApiResponse<GenerateTimetableResponse>> generateClassSessions(
			@RequestBody Map<String, Long> payload
	) {
		Long semesterId = payload.get("semesterId");
		if (semesterId == null) {
			return ResponseEntity.badRequest().body(ApiResponse.error("semesterId is required"));
		}
		GenerateTimetableResponse response = timetableGenerationService.generateForSemester(semesterId);
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

	@PatchMapping("/semesters/{semesterId}/publish")
	public ResponseEntity<ApiResponse<Void>> publishSemester(@PathVariable Long semesterId) {
		timetableCommandService.publishSemester(semesterId);
		return ResponseEntity.ok(ApiResponse.success("Semester published successfully", null));
	}

	@PatchMapping("/semesters/{semesterId}/lock")
	public ResponseEntity<ApiResponse<Void>> lockSemester(@PathVariable Long semesterId) {
		timetableCommandService.lockSemester(semesterId);
		return ResponseEntity.ok(ApiResponse.success("Semester locked successfully", null));
	}

	@PatchMapping("/semesters/{semesterId}/unlock")
	public ResponseEntity<ApiResponse<Void>> unlockSemester(@PathVariable Long semesterId) {
		timetableCommandService.unlockSemester(semesterId);
		return ResponseEntity.ok(ApiResponse.success("Semester unlocked successfully", null));
	}
}
