package com.ptit.studentportal.course;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
import com.ptit.studentportal.commom.response.PageResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/courses")
@Validated
public class CourseAdminController {

	private final CourseAdminService courseAdminService;

	public CourseAdminController(CourseAdminService courseAdminService) {
		this.courseAdminService = courseAdminService;
	}

	@GetMapping
	public ApiResponse<PageResponse<CourseResponse>> listCourses(
			@RequestParam(required = false) String courseType,
			@RequestParam(required = false) Boolean isActive,
			@RequestParam(required = false) String keyword,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size,
			@RequestParam(defaultValue = "courseCode,asc") String sort) {
		Sort sortSpec = Sort.by(Sort.Order.asc("courseCode"));
		if (sort.contains(",")) {
			String[] tokens = sort.split(",", 2);
			sortSpec = Sort.by(new Sort.Order(
					"desc".equalsIgnoreCase(tokens[1]) ? Sort.Direction.DESC : Sort.Direction.ASC, tokens[0]));
		}
		return ApiResponse.success("Courses fetched successfully",
				courseAdminService.listCourses(courseType, isActive, keyword, PageRequest.of(page, size, sortSpec)));
	}

	@GetMapping("/{courseId}")
	public ApiResponse<CourseResponse> getCourse(@PathVariable Long courseId) {
		return ApiResponse.success("Course fetched successfully", courseAdminService.getCourse(courseId));
	}

	@PostMapping
	public ResponseEntity<ApiResponse<CourseResponse>> createCourse(@Valid @RequestBody CourseCreateRequest request) {
		CourseResponse response = courseAdminService.createCourse(request);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Course created successfully", response));
	}

	@PutMapping("/{courseId}")
	public ApiResponse<CourseResponse> updateCourse(@PathVariable Long courseId, @Valid @RequestBody CourseUpdateRequest request) {
		return ApiResponse.success("Course updated successfully", courseAdminService.updateCourse(courseId, request));
	}

	@DeleteMapping("/{courseId}")
	public ResponseEntity<Void> deleteCourse(@PathVariable Long courseId) {
		courseAdminService.deleteCourse(courseId);
		return ResponseEntity.noContent().build();
	}

	@PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ApiResponse<CourseImportResultResponse> importCourses(@RequestParam("file") MultipartFile file) {
		return ApiResponse.success("Courses imported successfully", courseAdminService.importFromExcel(file));
	}
}
