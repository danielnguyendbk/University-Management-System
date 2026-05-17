package com.ptit.studentportal.lecturer;

import java.io.IOException;

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
@RequestMapping("/api/admin/lecturers")
@Validated
public class LecturerAdminController {

	private final LecturerAdminService lecturerAdminService;

	public LecturerAdminController(LecturerAdminService lecturerAdminService) {
		this.lecturerAdminService = lecturerAdminService;
	}

	@GetMapping
	public ApiResponse<PageResponse<LecturerAdminResponse>> listLecturers(
			@RequestParam(required = false) Long departmentId,
			@RequestParam(required = false) String academicTitle,
			@RequestParam(required = false) String accountStatus,
			@RequestParam(required = false) String search,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size,
			@RequestParam(defaultValue = "lecturerCode,asc") String sort) {
		Sort sortSpec = Sort.by(Sort.Order.asc("lecturerCode"));
		if (sort.contains(",")) {
			String[] tokens = sort.split(",", 2);
			sortSpec = Sort.by(new Sort.Order("desc".equalsIgnoreCase(tokens[1]) ? Sort.Direction.DESC : Sort.Direction.ASC, tokens[0]));
		}
		var pageData = lecturerAdminService.listLecturers(departmentId, academicTitle, accountStatus, search, PageRequest.of(page, size, sortSpec));
		return ApiResponse.success("Lecturers fetched successfully", new PageResponse<>(
				pageData.getContent().stream().map(lecturerAdminService::mapResponse).toList(),
				pageData.getTotalElements(),
				pageData.getTotalPages(),
				pageData.getNumber(),
				pageData.getSize()
		));
	}

	@GetMapping("/titles")
	public ApiResponse<java.util.List<String>> listAcademicTitles() {
		return ApiResponse.success("Academic titles fetched successfully", lecturerAdminService.listAcademicTitles());
	}

	@GetMapping("/{id}")
	public ApiResponse<LecturerAdminDetailResponse> getLecturer(@PathVariable Long id) {
		return ApiResponse.success("Lecturer fetched successfully", lecturerAdminService.getLecturer(id));
	}

	@PostMapping
	public ApiResponse<LecturerAdminDetailResponse> createLecturer(@Valid @RequestBody LecturerCreateAdminRequest request) {
		return ApiResponse.success("Lecturer created successfully", lecturerAdminService.createLecturer(request));
	}

	@PutMapping("/{id}")
	public ApiResponse<LecturerAdminDetailResponse> updateLecturer(@PathVariable Long id, @Valid @RequestBody LecturerUpdateRequest request) {
		return ApiResponse.success("Lecturer updated successfully", lecturerAdminService.updateLecturer(id, request));
	}

	@PatchMapping("/{id}/account-status")
	public ApiResponse<LecturerAdminDetailResponse> updateAccountStatus(@PathVariable Long id, @Valid @RequestBody LecturerAccountStatusRequest request) {
		return ApiResponse.success("Account status updated successfully", lecturerAdminService.updateAccountStatus(id, request.status()));
	}

	@PatchMapping("/{id}/reset-password")
	public ApiResponse<String> resetPassword(@PathVariable Long id, @Valid @RequestBody LecturerResetPasswordRequest request) {
		String password = lecturerAdminService.resetPassword(id, request.newPassword());
		return ApiResponse.success("Password reset successfully", password);
	}

	@GetMapping("/import/template")
	public ResponseEntity<Resource> downloadTemplate() throws IOException {
		ByteArrayResource resource = new ByteArrayResource(writeTemplateToBytes());
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=lecturer-import-template.xlsx")
				.contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
				.body(resource);
	}

	@PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ApiResponse<LecturerImportSummaryResponse> importLecturers(@RequestParam("file") MultipartFile file) {
		return ApiResponse.success("Lecturers imported successfully", lecturerAdminService.importLecturers(file));
	}

	private byte[] writeTemplateToBytes() throws IOException {
		try (java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream()) {
			lecturerAdminService.writeTemplate(outputStream);
			return outputStream.toByteArray();
		}
	}
}