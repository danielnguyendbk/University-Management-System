package com.ptit.studentportal.registration.controller;

import com.ptit.studentportal.commom.exception.BusinessException;
import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.registration.dto.request.RegisterSectionRequest;
import com.ptit.studentportal.registration.dto.response.*;
import com.ptit.studentportal.registration.service.StudentRegistrationService;
import com.ptit.studentportal.security.SecurityUtils;
import com.ptit.studentportal.student.Student;
import com.ptit.studentportal.student.StudentRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/student/registration")
@RequiredArgsConstructor
public class StudentRegistrationController {

    private final StudentRegistrationService registrationService;
    private final SecurityUtils securityUtils;
    private final StudentRepository studentRepository;

    @GetMapping("/semesters")
    public ResponseEntity<ApiResponse<List<RegistrationSemesterResponse>>> getSemesters() {
        List<RegistrationSemesterResponse> response = registrationService.getRegistrationSemesters();
        return ResponseEntity.ok(ApiResponse.success("Registration semesters loaded", response));
    }

    @GetMapping("/available-sections")
    public ResponseEntity<ApiResponse<List<AvailableSectionResponse>>> getAvailableSections(
            @RequestParam Long semesterId,
            Authentication authentication
    ) {
        String username = authentication.getName();
        List<AvailableSectionResponse> response = registrationService.getAvailableSections(username, semesterId);
        return ResponseEntity.ok(ApiResponse.success("Available sections loaded", response));
    }

    @GetMapping("/my-sections")
    public ResponseEntity<ApiResponse<List<MyEnrollmentResponse>>> getMySections(
            @RequestParam Long semesterId,
            Authentication authentication
    ) {
        String username = authentication.getName();
        List<MyEnrollmentResponse> response = registrationService.getMySections(username, semesterId);
        return ResponseEntity.ok(ApiResponse.success("My registered sections loaded", response));
    }

    @PostMapping("/enrollments")
    public ResponseEntity<ApiResponse<EnrollmentActionResponse>> registerSection(
            @Valid @RequestBody RegisterSectionRequest request,
            Authentication authentication
    ) {
        String username = authentication.getName();

        EnrollmentActionResponse response =
                registrationService.registerSection(username, request.sectionId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Enrollment registered successfully", response));
    }

    @DeleteMapping("/enrollments/{enrollmentId}")
    public ResponseEntity<ApiResponse<EnrollmentActionResponse>> dropEnrollment(
            @PathVariable Long enrollmentId,
            Authentication authentication
    ) {
        String username = authentication.getName();

        EnrollmentActionResponse response =
                registrationService.dropEnrollment(username, enrollmentId);

        return ResponseEntity.ok(ApiResponse.success("Enrollment dropped successfully", response));
    }


}
