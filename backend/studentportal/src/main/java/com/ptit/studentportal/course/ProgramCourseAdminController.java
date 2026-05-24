package com.ptit.studentportal.course;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ptit.studentportal.commom.response.ApiResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/programs/{programId}/courses")
@Validated
public class ProgramCourseAdminController {

	private final ProgramCourseService programCourseService;

	public ProgramCourseAdminController(ProgramCourseService programCourseService) {
		this.programCourseService = programCourseService;
	}

	@GetMapping
	public ApiResponse<List<ProgramCourseResponse>> getCoursesByProgram(@PathVariable Long programId) {
		return ApiResponse.success("Program courses fetched successfully",
				programCourseService.getCoursesByProgram(programId));
	}

	@GetMapping("/available")
	public ApiResponse<List<CourseSimpleResponse>> getAvailableCourses(@PathVariable Long programId) {
		return ApiResponse.success("Available courses fetched successfully",
				programCourseService.getAvailableCoursesForProgram(programId));
	}

	@PostMapping
	public ResponseEntity<ApiResponse<ProgramCourseResponse>> assignCourse(
			@PathVariable Long programId, @Valid @RequestBody ProgramCourseAssignRequest request) {
		ProgramCourseResponse response = programCourseService.assignCourse(programId, request);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Course assigned to program successfully", response));
	}

	@PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ApiResponse<ProgramCourseImportResponse> importCourses(
			@PathVariable Long programId,
			@RequestParam("file") MultipartFile file) {
		return ApiResponse.success("Program courses imported successfully",
				programCourseService.importCourses(programId, file));
	}

	@PutMapping("/{programCourseId}")
	public ApiResponse<ProgramCourseResponse> updateProgramCourse(
			@PathVariable Long programId,
			@PathVariable Long programCourseId,
			@Valid @RequestBody ProgramCourseAssignRequest request) {
		return ApiResponse.success("Program course updated successfully",
				programCourseService.updateProgramCourse(programCourseId, request));
	}

	@DeleteMapping("/{courseId}")
	public ResponseEntity<Void> removeCourseFromProgram(
			@PathVariable Long programId, @PathVariable Long courseId) {
		programCourseService.removeCourseFromProgram(programId, courseId);
		return ResponseEntity.noContent().build();
	}
}
