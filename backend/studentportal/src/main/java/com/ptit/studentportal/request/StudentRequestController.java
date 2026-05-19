package com.ptit.studentportal.request;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ptit.studentportal.commom.response.ApiResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/students")
@Validated
public class StudentRequestController {

    private final RequestService requestService;

    public StudentRequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    @GetMapping("/{studentId}/requests")
    public ResponseEntity<ApiResponse<List<StudentRequestDTO>>> getStudentRequests(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success("Student requests retrieved successfully", requestService.getStudentRequests(studentId)));
    }

    @PostMapping(value = "/{studentId}/requests", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<StudentRequestDTO>> submitRequest(
            @PathVariable Long studentId,
            @Valid @RequestPart("request") StudentRequestCreateRequest request,
            @RequestPart(value = "attachment", required = false) MultipartFile attachment) {
        StudentRequestDTO created = requestService.submitStudentRequest(studentId, request, attachment);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Request submitted successfully", created));
    }
}
