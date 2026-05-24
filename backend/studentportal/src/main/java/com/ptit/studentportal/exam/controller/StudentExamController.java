package com.ptit.studentportal.exam.controller;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.exam.dto.ExamResponse;
import com.ptit.studentportal.exam.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/exams")
@RequiredArgsConstructor
public class StudentExamController {

    private final ExamService examService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExamResponse>>> getMyExams(
            @RequestParam Long semesterId,
            Authentication authentication
    ) {
        String username = authentication.getName();
        List<ExamResponse> response = examService.getStudentExams(username, semesterId);
        return ResponseEntity.ok(ApiResponse.success("Lịch thi sinh viên đã được tải thành công", response));
    }
}
