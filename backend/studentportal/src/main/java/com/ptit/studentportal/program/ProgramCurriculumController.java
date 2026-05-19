package com.ptit.studentportal.program;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ptit.studentportal.commom.response.ApiResponse;

@RestController
@RequestMapping("/api/students")
public class ProgramCurriculumController {

    private final ProgramCurriculumService programCurriculumService;

    public ProgramCurriculumController(ProgramCurriculumService programCurriculumService) {
        this.programCurriculumService = programCurriculumService;
    }

    @GetMapping("/{studentId}/program/curriculum")
    public ResponseEntity<ApiResponse<ProgramCurriculumDTO>> getCurriculum(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success("Program curriculum retrieved successfully", programCurriculumService.getCurriculumByStudentId(studentId)));
    }
}