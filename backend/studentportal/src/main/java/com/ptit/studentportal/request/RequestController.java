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
import org.springframework.web.bind.annotation.RestController;

import com.ptit.studentportal.commom.response.ApiResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/lecturers")
@Validated
public class RequestController {

    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    @GetMapping("/{lecturerId}/requests/pending")
    public ResponseEntity<ApiResponse<List<StudentRequestDTO>>> getPendingRequests(@PathVariable Long lecturerId) {
        return ResponseEntity.ok(ApiResponse.success("Pending requests retrieved successfully", requestService.getPendingRequests(lecturerId)));
    }

    @GetMapping("/{lecturerId}/requests/{requestId}")
    public ResponseEntity<ApiResponse<StudentRequestDTO>> getRequestById(
            @PathVariable Long lecturerId,
            @PathVariable Long requestId) {
        return ResponseEntity.ok(ApiResponse.success("Request retrieved successfully", requestService.getRequestById(lecturerId, requestId)));
    }

    @PostMapping("/{lecturerId}/requests/{requestId}/approve")
    public ResponseEntity<ApiResponse<StudentRequestDTO>> approveRequest(
            @PathVariable Long lecturerId,
            @PathVariable Long requestId,
            @Valid @RequestBody(required = false) RequestDecisionRequest request) {
        StudentRequestDTO updated = requestService.approveRequest(lecturerId, requestId, request);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Request approved successfully", updated));
    }

    @PostMapping("/{lecturerId}/requests/{requestId}/reject")
    public ResponseEntity<ApiResponse<StudentRequestDTO>> rejectRequest(
            @PathVariable Long lecturerId,
            @PathVariable Long requestId,
            @Valid @RequestBody(required = false) RequestDecisionRequest request) {
        StudentRequestDTO updated = requestService.rejectRequest(lecturerId, requestId, request);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Request rejected successfully", updated));
    }
}