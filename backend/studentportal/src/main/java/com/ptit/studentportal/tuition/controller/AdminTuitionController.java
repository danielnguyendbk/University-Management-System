package com.ptit.studentportal.tuition.controller;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.student.StudentRepository;
import com.ptit.studentportal.tuition.entity.TuitionFee;
import com.ptit.studentportal.tuition.entity.Payment;
import com.ptit.studentportal.tuition.repository.TuitionFeeRepository;
import com.ptit.studentportal.tuition.repository.PaymentRepository;
import com.ptit.studentportal.tuition.service.PaymentService;
import com.ptit.studentportal.tuition.service.TuitionCalculationService;
import com.ptit.studentportal.tuition.service.TuitionFeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/tuition")
@RequiredArgsConstructor
public class AdminTuitionController {

    private final TuitionCalculationService tuitionCalculationService;
    private final TuitionFeeService tuitionFeeService;
    private final StudentRepository studentRepository;
    private final TuitionFeeRepository tuitionFeeRepository;
    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;

    public record CreditPriceRequest(BigDecimal pricePerCredit) {}

    @PutMapping("/semesters/{semesterId}/credit-price")
    public ResponseEntity<ApiResponse<Void>> setCreditPrice(
            @PathVariable Long semesterId,
            @RequestBody CreditPriceRequest request
    ) {
        if (request.pricePerCredit() == null || request.pricePerCredit().compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Price per credit must be greater than or equal to 0"));
        }
        tuitionCalculationService.setCreditPrice(semesterId, request.pricePerCredit());
       return ResponseEntity.ok(ApiResponse.success("Set credit price successfully", null));
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<Void>> generateTuitionFees(@RequestParam Long semesterId) {
        try {
            tuitionCalculationService.generateTuitionFees(semesterId);
            return ResponseEntity.ok(ApiResponse.success("Generated tuition fees successfully", null));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/fees")
    public ResponseEntity<ApiResponse<List<TuitionFee>>> getTuitionFees(@RequestParam Long semesterId) {
        List<TuitionFee> fees = tuitionFeeService.getTuitionFeesBySemester(semesterId);
        return ResponseEntity.ok(ApiResponse.success("Tuition fees loaded successfully", fees));
    }

    @GetMapping("/debts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentDebt(@RequestParam String studentCode) {
        var studentOpt = studentRepository.findByStudentCode(studentCode);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Sinh viên không tồn tại trong hệ thống."));
        }
        var student = studentOpt.get();
        List<TuitionFee> fees = tuitionFeeRepository.findByStudentId(student.getStudentId());
        if (fees.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success("Không tìm thấy công nợ", Map.of(
                    "studentId", student.getStudentId(),
                    "studentCode", student.getStudentCode(),
                    "fullName", student.getFullName(),
                    "cohort", student.getEnrollmentYear() != null ? student.getEnrollmentYear() : "",
                    "remainingDebt", BigDecimal.ZERO
            )));
        }
        // Get latest tuition fee
        TuitionFee latestFee = fees.stream()
                .sorted((a, b) -> b.getTuitionFeeId().compareTo(a.getTuitionFeeId()))
                .findFirst()
                .get();

        BigDecimal remainingDebt = latestFee.getFinalAmount().subtract(latestFee.getPaidAmount());
        return ResponseEntity.ok(ApiResponse.success("Tải công nợ thành công", Map.of(
                "studentId", student.getStudentId(),
                "studentCode", student.getStudentCode(),
                "fullName", student.getFullName(),
                "enrollmentYear", student.getEnrollmentYear() != null ? student.getEnrollmentYear() : "",
                "tuitionFeeId", latestFee.getTuitionFeeId(),
                "remainingDebt", remainingDebt.max(BigDecimal.ZERO),
                "totalAmount", latestFee.getTotalAmount(),
                "paidAmount", latestFee.getPaidAmount()
        )));
    }

    public record CashConfirmRequest(Long tuitionFeeId, String studentCode, BigDecimal amountPaid, String note) {}

    @PostMapping("/payments/cash-confirm")
    public ResponseEntity<ApiResponse<Payment>> confirmCashPayment(@RequestBody CashConfirmRequest request) {
        if (request.tuitionFeeId() == null || request.studentCode() == null || request.amountPaid() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Thiếu thông tin xác nhận thanh toán"));
        }
        try {
            Payment payment = paymentService.confirmCashPayment(
                    request.tuitionFeeId(),
                    request.studentCode(),
                    request.amountPaid(),
                    request.note()
            );
            return ResponseEntity.ok(ApiResponse.success("Xác nhận thu tiền mặt thành công", payment));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<Payment>>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String studentCode
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Payment> history;
        if (studentCode == null || studentCode.isBlank()) {
            history = paymentRepository.findByPaymentStatusIgnoreCase("success", pageable);
        } else {
            history = paymentRepository.findByPaymentStatusIgnoreCaseAndTuitionFee_Student_StudentCodeContainingIgnoreCase("success", studentCode, pageable);
        }
        return ResponseEntity.ok(ApiResponse.success("Tải lịch sử đối soát thành công", history));
    }
}
