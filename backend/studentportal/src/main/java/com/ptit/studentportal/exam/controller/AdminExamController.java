package com.ptit.studentportal.exam.controller;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.exam.dto.*;
import com.ptit.studentportal.exam.service.ExamService;
import com.ptit.studentportal.exam.service.ExamImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.util.List;

@RestController
@RequestMapping("/api/admin/exams")
@RequiredArgsConstructor
public class AdminExamController {

    private final ExamService examService;
    private final ExamImportService examImportService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExamResponse>>> getExams(@RequestParam Long semesterId) {
        List<ExamResponse> response = examService.getExams(semesterId);
        return ResponseEntity.ok(ApiResponse.success("Lịch thi đã được tải thành công", response));
    }

    @GetMapping("/eligible-sections")
    public ResponseEntity<ApiResponse<List<EligibleSectionResponse>>> getEligibleSections(@RequestParam Long semesterId) {
        List<EligibleSectionResponse> response = examService.getEligibleSections(semesterId);
        return ResponseEntity.ok(ApiResponse.success("Danh sách lớp học phần khả dụng đã được tải", response));
    }

    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<RoomDTO>>> getRooms() {
        List<RoomDTO> response = examService.getRooms();
        return ResponseEntity.ok(ApiResponse.success("Danh sách phòng thi đã được tải", response));
    }

    @GetMapping("/lecturers")
    public ResponseEntity<ApiResponse<List<LecturerDTO>>> getLecturers() {
        List<LecturerDTO> response = examService.getLecturers();
        return ResponseEntity.ok(ApiResponse.success("Danh sách giảng viên đã được tải", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExamResponse>> createExam(@RequestBody ExamCreateRequest request) {
        ExamResponse response = examService.createExam(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Tạo lịch thi mới thành công", response));
    }

    @PutMapping("/{examId}")
    public ResponseEntity<ApiResponse<ExamResponse>> updateExam(
            @PathVariable Long examId,
            @RequestBody ExamCreateRequest request
    ) {
        ExamResponse response = examService.updateExam(examId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật lịch thi thành công", response));
    }

    @DeleteMapping("/{examId}")
    public ResponseEntity<ApiResponse<Void>> deleteExam(@PathVariable Long examId) {
        examService.deleteExam(examId);
        return ResponseEntity.ok(ApiResponse.success("Xóa lịch thi thành công", null));
    }

    @PatchMapping("/{examId}/cancel")
    public ResponseEntity<ApiResponse<ExamResponse>> cancelExam(@PathVariable Long examId) {
        ExamResponse response = examService.cancelExam(examId);
        return ResponseEntity.ok(ApiResponse.success("Hủy lịch thi thành công", response));
    }

    @PostMapping("/{examId}/invigilators")
    public ResponseEntity<ApiResponse<ExamResponse>> assignInvigilator(
            @PathVariable Long examId,
            @RequestBody InvigilatorAssignRequest request
    ) {
        ExamResponse response = examService.assignInvigilator(examId, request);
        return ResponseEntity.ok(ApiResponse.success("Phân công cán bộ coi thi thành công", response));
    }

    @DeleteMapping("/{examId}/invigilators/{lecturerId}")
    public ResponseEntity<ApiResponse<ExamResponse>> removeInvigilator(
            @PathVariable Long examId,
            @PathVariable Long lecturerId
    ) {
        ExamResponse response = examService.removeInvigilator(examId, lecturerId);
        return ResponseEntity.ok(ApiResponse.success("Hủy phân công cán bộ coi thi thành công", response));
    }

    @GetMapping(value = "/import-template", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> downloadTemplate(
            @RequestParam(value = "semesterId", required = false) Long semesterId
    ) {
        byte[] data = examImportService.generateImportTemplate(semesterId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"exam_import_template.xlsx\"")
                .body(data);
    }

    @PostMapping(value = "/import/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ExcelPreviewResponse>> previewImport(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "semesterId", required = false) Long semesterId
    ) {
        ExcelPreviewResponse response = examImportService.previewExcelImport(file, semesterId);
        return ResponseEntity.ok(ApiResponse.success("Đã kiểm tra file Excel", response));
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ExcelPreviewResponse>> confirmImport(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "semesterId", required = false) Long semesterId
    ) {
        ExcelPreviewResponse response = examImportService.confirmExcelImport(file, semesterId);
        return ResponseEntity.ok(ApiResponse.success("Import lịch thi thành công", response));
    }
}
