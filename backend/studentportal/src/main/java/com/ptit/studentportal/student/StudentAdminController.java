package com.ptit.studentportal.student;

import java.io.IOException;
import java.util.List;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
@RequestMapping("/api/admin/students")
@Validated
public class StudentAdminController {

	private final StudentAdminService studentAdminService;

	public StudentAdminController(StudentAdminService studentAdminService) {
		this.studentAdminService = studentAdminService;
	}

	@GetMapping
	public ApiResponse<PageResponse<StudentAdminResponse>> listStudents(
			@RequestParam(required = false) Long departmentId,
			@RequestParam(required = false) Long programId,
			@RequestParam(required = false) String cohort,
			@RequestParam(required = false) String academicStatus,
			@RequestParam(required = false) String search,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size,
			@RequestParam(defaultValue = "studentCode,asc") String sort) {
		Sort sortSpec = Sort.by(Sort.Order.asc("studentCode"));
		if (sort.contains(",")) {
			String[] tokens = sort.split(",", 2);
			sortSpec = Sort.by(new Sort.Order("desc".equalsIgnoreCase(tokens[1]) ? Sort.Direction.DESC : Sort.Direction.ASC, tokens[0]));
		}
		return ApiResponse.success("Students fetched successfully",
				studentAdminService.listStudents(departmentId, programId, cohort, academicStatus, search, PageRequest.of(page, size, sortSpec)));
	}

	@GetMapping("/cohorts")
	public ApiResponse<List<String>> listCohorts(
			@RequestParam(required = false) Long departmentId,
			@RequestParam(required = false) Long programId,
			@RequestParam(required = false) String academicStatus,
			@RequestParam(required = false) String search) {
		return ApiResponse.success("Student cohorts fetched successfully",
				studentAdminService.listAvailableCohorts(departmentId, programId, academicStatus, search));
	}

	@GetMapping("/{id}")
	public ApiResponse<StudentDetailResponse> getStudent(@PathVariable Long id) {
		return ApiResponse.success("Student fetched successfully", studentAdminService.getStudent(id));
	}

	@PutMapping("/{id}")
	public ApiResponse<StudentDetailResponse> updateStudent(@PathVariable Long id, @Valid @RequestBody StudentUpdateRequest request) {
		return ApiResponse.success("Student updated successfully", studentAdminService.updateStudent(id, request));
	}

	@PatchMapping("/{id}/status")
	public ApiResponse<StudentDetailResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody StudentStatusUpdateRequest request) {
		return ApiResponse.success("Student status updated successfully", studentAdminService.updateStudentStatus(id, request.academicStatus()));
	}

	@PatchMapping("/batch-status")
	public ApiResponse<Integer> batchStatus(@Valid @RequestBody StudentBatchStatusUpdateRequest request) {
		return ApiResponse.success("Student statuses updated successfully", studentAdminService.batchUpdateStatus(request.studentIds(), request.academicStatus()));
	}

	@GetMapping("/import/template")
	public ResponseEntity<Resource> downloadTemplate() throws IOException {
		ByteArrayResource resource = new ByteArrayResource(writeTemplateToBytes());
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=student-import-template.xlsx")
				.contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
				.body(resource);
	}

	@PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ApiResponse<StudentImportSummaryResponse> importStudents(@RequestParam("file") MultipartFile file) {
		return ApiResponse.success("Students imported successfully", studentAdminService.importStudents(file));
	}

	private byte[] writeTemplateToBytes() throws IOException {
		try (java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream()) {
			studentAdminService.writeTemplate(outputStream);
			return outputStream.toByteArray();
		}
	}
}