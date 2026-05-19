package com.ptit.studentportal.studentgrade;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ptit.studentportal.commom.response.ApiResponse;

@RestController
@RequestMapping("/api/students")
@Validated
public class StudentGradesController {

    private final StudentGradesService studentGradesService;

    public StudentGradesController(StudentGradesService studentGradesService) {
        this.studentGradesService = studentGradesService;
    }

    @GetMapping("/{studentId}/grades")
    public ResponseEntity<ApiResponse<StudentGradesService.StudentGradesResponse>> getAllGrades(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success("Student grades retrieved successfully", studentGradesService.getAllGrades(studentId)));
    }

    @GetMapping("/{studentId}/grades/semester/{semesterId}")
    public ResponseEntity<ApiResponse<StudentGradesService.StudentGradesResponse>> getGradesBySemester(
            @PathVariable Long studentId,
            @PathVariable Long semesterId) {
        return ResponseEntity.ok(ApiResponse.success("Student semester grades retrieved successfully", studentGradesService.getGradesBySemester(studentId, semesterId)));
    }

    @GetMapping("/{studentId}/gpa")
    public ResponseEntity<ApiResponse<StudentGradesService.StudentGpaResponse>> getGpaSummary(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success("Student GPA summary retrieved successfully", studentGradesService.getGpaSummary(studentId)));
    }

    @GetMapping("/{studentId}/transcript")
    public ResponseEntity<ApiResponse<StudentGradesService.StudentGradesResponse>> getTranscript(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success("Student transcript retrieved successfully", studentGradesService.getAllGrades(studentId)));
    }
}