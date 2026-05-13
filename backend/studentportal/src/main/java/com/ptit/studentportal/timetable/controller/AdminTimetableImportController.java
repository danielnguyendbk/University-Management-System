package com.ptit.studentportal.timetable.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.timetable.dto.response.TimetableImportResult;
import com.ptit.studentportal.timetable.service.TimetableImportService;

@RestController
@RequestMapping("/api/admin")
public class AdminTimetableImportController {

	private final TimetableImportService timetableImportService;

	public AdminTimetableImportController(TimetableImportService timetableImportService) {
		this.timetableImportService = timetableImportService;
	}

	@PostMapping("/timetable/import")
	public ResponseEntity<ApiResponse<TimetableImportResult>> importSchedules(
			@RequestParam("file") MultipartFile file
	) {
		if (file.isEmpty()) {
			return ResponseEntity.badRequest()
					.body(ApiResponse.error("File is empty"));
		}

		TimetableImportResult result = timetableImportService.importSchedulesFromExcel(file);
		return ResponseEntity.ok(ApiResponse.success("Import completed", result));
	}
}

