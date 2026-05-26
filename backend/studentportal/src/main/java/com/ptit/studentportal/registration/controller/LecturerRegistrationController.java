package com.ptit.studentportal.registration.controller;

import com.ptit.studentportal.commom.exception.BusinessException;
import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.lecturer.Lecturer;
import com.ptit.studentportal.lecturer.LecturerRepository;
import com.ptit.studentportal.registration.dto.response.LecturerSectionResponse;
import com.ptit.studentportal.registration.dto.response.SectionStudentResponse;
import com.ptit.studentportal.registration.service.LecturerRegistrationService;
import com.ptit.studentportal.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lecturer/registration")
@RequiredArgsConstructor
public class LecturerRegistrationController {

    private final LecturerRegistrationService registrationService;
    private final SecurityUtils securityUtils;
    private final LecturerRepository lecturerRepository;

    @GetMapping("/sections")
    public ApiResponse<List<LecturerSectionResponse>> getSections(@RequestParam Long semesterId) {
        Long lecturerId = getLecturerId();
        return ApiResponse.success("Lấy danh sách lớp giảng dạy thành công", registrationService.getLecturerSections(lecturerId, semesterId));
    }

    @GetMapping("/sections/{sectionId}/students")
    public ApiResponse<List<SectionStudentResponse>> getStudents(@PathVariable Long sectionId) {
        Long lecturerId = getLecturerId();
        return ApiResponse.success("Lấy danh sách sinh viên thành công", registrationService.getLecturerSectionStudents(lecturerId, sectionId));
    }

    private Long getLecturerId() {
        Long userId = securityUtils.getCurrentUserId();
        Lecturer lecturer = lecturerRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin giảng viên cho user này"));
        return lecturer.getLecturerId();
    }
}
