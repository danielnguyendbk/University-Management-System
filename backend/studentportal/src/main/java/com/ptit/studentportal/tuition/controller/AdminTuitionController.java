package com.ptit.studentportal.tuition.controller;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.student.Student;
import com.ptit.studentportal.student.StudentRepository;
import com.ptit.studentportal.tuition.entity.TuitionFee;
import com.ptit.studentportal.tuition.entity.Payment;
import com.ptit.studentportal.tuition.entity.TuitionRate;
import com.ptit.studentportal.tuition.repository.TuitionFeeRepository;
import com.ptit.studentportal.tuition.repository.PaymentRepository;
import com.ptit.studentportal.tuition.repository.TuitionRateRepository;
import com.ptit.studentportal.tuition.service.PaymentService;
import com.ptit.studentportal.tuition.service.TuitionCalculationService;
import com.ptit.studentportal.tuition.service.TuitionFeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
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
    private final TuitionRateRepository tuitionRateRepository;

    public record CreditPriceRequest(BigDecimal pricePerCredit) {}
    public record TuitionRateUpdateRequest(Integer enrollmentYear, BigDecimal pricePerCredit) {}

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
        List<Student> students = studentRepository.searchByCodeOrName(studentCode);
        if (students.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Sinh viên không tồn tại trong hệ thống."));
        }
        var student = students.get(0);
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

    @Transactional
    @GetMapping("/rates")
    public ResponseEntity<ApiResponse<List<TuitionRate>>> getTuitionRates() {
        List<TuitionRate> rates = new ArrayList<>(tuitionRateRepository.findAll());

        // Auto-seed default cohort stubs (D22–D25) if the table is empty
        if (rates.isEmpty()) {
            int currentYear = java.time.Year.now().getValue();
            int startYear = currentYear - 3; // e.g. 2022 if current year is 2025
            for (int y = startYear; y <= currentYear; y++) {
                int finalY = y;
                TuitionRate seeded = tuitionRateRepository.findByEnrollmentYear(y)
                        .orElseGet(() -> {
                            TuitionRate r = new TuitionRate();
                            r.setEnrollmentYear(finalY);
                            r.setPricePerCredit(BigDecimal.ZERO);
                            return tuitionRateRepository.save(r);
                        });
                rates.add(seeded);
            }
        }

        rates = rates.stream()
                .sorted((a, b) -> b.getEnrollmentYear().compareTo(a.getEnrollmentYear()))
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Tải danh sách đơn giá theo khóa thành công", rates));
    }

    @PutMapping("/rates")
    public ResponseEntity<ApiResponse<Void>> updateTuitionRates(@RequestBody List<TuitionRateUpdateRequest> requests) {
        for (TuitionRateUpdateRequest req : requests) {
            if (req.enrollmentYear() == null || req.pricePerCredit() == null || req.pricePerCredit().compareTo(BigDecimal.ZERO) < 0) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Thông tin đơn giá không hợp lệ"));
            }
        }
        for (TuitionRateUpdateRequest req : requests) {
            TuitionRate rate = tuitionRateRepository.findByEnrollmentYear(req.enrollmentYear())
                    .orElseGet(() -> {
                        TuitionRate newRate = new TuitionRate();
                        newRate.setEnrollmentYear(req.enrollmentYear());
                        return newRate;
                    });
            rate.setPricePerCredit(req.pricePerCredit());
            tuitionRateRepository.save(rate);
        }
        return ResponseEntity.ok(ApiResponse.success("Cập nhật đơn giá theo khóa thành công", null));
    }

    @PutMapping("/rates/{enrollmentYear}")
    public ResponseEntity<ApiResponse<TuitionRate>> updateSingleRate(
            @PathVariable Integer enrollmentYear,
            @RequestBody Map<String, BigDecimal> body
    ) {
        BigDecimal price = body.get("pricePerCredit");
        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Đơn giá không hợp lệ"));
        }
        TuitionRate rate = tuitionRateRepository.findByEnrollmentYear(enrollmentYear)
                .orElseGet(() -> {
                    TuitionRate newRate = new TuitionRate();
                    newRate.setEnrollmentYear(enrollmentYear);
                    return newRate;
                });
        rate.setPricePerCredit(price);
        TuitionRate saved = tuitionRateRepository.save(rate);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật đơn giá thành công", saved));
    }
}
