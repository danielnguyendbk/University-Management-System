package com.ptit.studentportal.assignment.controller;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.assignment.dto.*;
import com.ptit.studentportal.assignment.service.CourseSectionAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/course-section-assignments")
@RequiredArgsConstructor
public class AdminCourseSectionAssignmentController {

    private final CourseSectionAssignmentService assignmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseSectionAssignmentResponse>>> getAssignments(
            @RequestParam Long semesterId
    ) {
        List<CourseSectionAssignmentResponse> response = assignmentService.getAssignments(semesterId);
        return ResponseEntity.ok(ApiResponse.success("Course section assignments loaded successfully", response));
    }

    @GetMapping("/lecturers")
    public ResponseEntity<ApiResponse<List<LecturerOptionResponse>>> getLecturerOptions() {
        List<LecturerOptionResponse> response = assignmentService.getLecturerOptions();
        return ResponseEntity.ok(ApiResponse.success("Lecturer options loaded successfully", response));
    }

    @PatchMapping("/{sectionId}/lecturer")
    public ResponseEntity<ApiResponse<AssignLecturerResponse>> assignLecturer(
            @PathVariable Long sectionId,
            @Valid @RequestBody AssignLecturerRequest request
    ) {
        AssignLecturerResponse response = assignmentService.assignLecturer(sectionId, request);
        return ResponseEntity.ok(ApiResponse.success(response.message(), response));
    }

    @PatchMapping("/{sectionId}/unassign")
    public ResponseEntity<ApiResponse<AssignLecturerResponse>> unassignLecturer(
            @PathVariable Long sectionId
    ) {
        AssignLecturerResponse response = assignmentService.unassignLecturer(sectionId);
        return ResponseEntity.ok(ApiResponse.success(response.message(), response));
    }
}
