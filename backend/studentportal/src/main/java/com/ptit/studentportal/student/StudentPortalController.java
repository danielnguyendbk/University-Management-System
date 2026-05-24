package com.ptit.studentportal.student;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.security.CustomUserDetails;

@RestController
@RequestMapping("/api/student")
public class StudentPortalController {

	private final StudentService studentService;

	public StudentPortalController(StudentService studentService) {
		this.studentService = studentService;
	}

	@GetMapping("/curriculum")
	public ApiResponse<StudentCurriculumResponse> getCurrentStudentCurriculum(
			@AuthenticationPrincipal CustomUserDetails userDetails) {
		return ApiResponse.success("Student curriculum fetched successfully",
				studentService.getCurrentStudentCurriculum(userDetails));
	}
}
