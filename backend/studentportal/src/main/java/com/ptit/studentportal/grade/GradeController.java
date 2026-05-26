package com.ptit.studentportal.grade;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ptit.studentportal.commom.response.ApiResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/lecturers")
@Validated
public class GradeController {

    private final GradeService gradeService;

    public GradeController(GradeService gradeService) {
        this.gradeService = gradeService;
    }

    @GetMapping("/{lecturerId}/sections")
    public ResponseEntity<ApiResponse<List<LecturerSectionDTO>>> getLecturerSections(@PathVariable Long lecturerId) {
        return ResponseEntity.ok(ApiResponse.success("Lecturer sections retrieved successfully", gradeService.getLecturerSections(lecturerId)));
    }

    @GetMapping("/{lecturerId}/sections/{sectionId}/grades")
    public ResponseEntity<ApiResponse<List<GradeDTO>>> getSectionGrades(@PathVariable Long lecturerId, @PathVariable Long sectionId) {
        return ResponseEntity.ok(ApiResponse.success("Section grades retrieved successfully", gradeService.getSectionGrades(lecturerId, sectionId)));
    }

    @GetMapping("/{lecturerId}/grades/{enrollmentId}")
    public ResponseEntity<ApiResponse<GradeDTO>> getGradeByEnrollmentId(@PathVariable Long lecturerId, @PathVariable Long enrollmentId) {
        return ResponseEntity.ok(ApiResponse.success("Grade retrieved successfully", gradeService.getGradeByEnrollmentId(lecturerId, enrollmentId)));
    }

    @PutMapping("/{lecturerId}/grades/{enrollmentId}")
    public ResponseEntity<ApiResponse<GradeDTO>> updateGrade(
            @PathVariable Long lecturerId,
            @PathVariable Long enrollmentId,
            @Valid @RequestBody GradeUpdateRequest request) {
        GradeDTO updated = gradeService.updateGrade(lecturerId, enrollmentId, request);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Grade updated successfully", updated));
    }

    @PostMapping("/{lecturerId}/grades/batch-update")
    public ResponseEntity<ApiResponse<List<GradeDTO>>> batchUpdateGrades(
            @PathVariable Long lecturerId,
            @Valid @RequestBody BatchGradeUpdateRequest request) {
        List<GradeDTO> updated = gradeService.batchUpdateGrades(lecturerId, request);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Grades batch updated successfully", updated));
    }
}