package com.ptit.studentportal.registration.controller;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.registration.dto.request.*;
import com.ptit.studentportal.registration.dto.response.*;
import com.ptit.studentportal.registration.service.AdminRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/registration")
@RequiredArgsConstructor
public class AdminRegistrationController {

    private final AdminRegistrationService registrationService;

    @GetMapping("/semesters")
    public ApiResponse<List<RegistrationSemesterResponse>> getSemesters() {
        return ApiResponse.success("Lấy danh sách học kỳ thành công", registrationService.getRegistrationSemesters());
    }

   @PatchMapping("/semesters/{semesterId}/open")
    public ApiResponse<Void> openRegistration(@PathVariable Long semesterId, @Valid @RequestBody OpenRegistrationRequest request) {
        registrationService.openRegistration(semesterId, request);
        return ApiResponse.success("Mở đăng ký thành công", null);
    }

    @PostMapping("/semesters/{semesterId}/close")
    public ApiResponse<Void> closeRegistration(@PathVariable Long semesterId) {
        registrationService.closeRegistration(semesterId);
        return ApiResponse.success("Đóng đăng ký thành công", null);
    }

    @PostMapping("/semesters/{semesterId}/lock")
    public ApiResponse<Void> lockRegistration(@PathVariable Long semesterId) {
        registrationService.lockRegistration(semesterId);
        return ApiResponse.success("Khóa đăng ký thành công", null);
    }

    @GetMapping("/sections")
    public ApiResponse<List<AdminSectionResponse>> getSections(@RequestParam Long semesterId) {
        return ApiResponse.success("Lấy danh sách lớp học phần thành công", registrationService.getAdminSections(semesterId));
    }

    @PostMapping("/sections")
    public ApiResponse<AdminSectionResponse> createSection(@Valid @RequestBody CreateCourseSectionRequest request) {
        return ApiResponse.success("Tạo lớp học phần thành công", registrationService.createSection(request));
    }

    @PutMapping("/sections/{sectionId}")
    public ApiResponse<AdminSectionResponse> updateSection(@PathVariable Long sectionId, @Valid @RequestBody UpdateCourseSectionRequest request) {
        return ApiResponse.success("Cập nhật lớp học phần thành công", registrationService.updateSection(sectionId, request));
    }

    @PostMapping("/sections/{sectionId}/open")
    public ApiResponse<Void> openSection(@PathVariable Long sectionId) {
        registrationService.openSection(sectionId);
        return ApiResponse.success("Mở lớp thành công", null);
    }

    @PostMapping("/sections/{sectionId}/close")
    public ApiResponse<Void> closeSection(@PathVariable Long sectionId) {
        registrationService.closeSection(sectionId);
        return ApiResponse.success("Đóng lớp thành công", null);
    }

    @DeleteMapping("/sections/{sectionId}")
    public ApiResponse<Void> cancelSection(@PathVariable Long sectionId) {
        registrationService.cancelSection(sectionId);
        return ApiResponse.success("Hủy lớp thành công", null);
    }

    @GetMapping("/sections/{sectionId}/students")
    public ApiResponse<List<SectionStudentResponse>> getSectionStudents(@PathVariable Long sectionId) {
        return ApiResponse.success("Lấy danh sách sinh viên thành công", registrationService.getSectionStudents(sectionId));
    }
}
