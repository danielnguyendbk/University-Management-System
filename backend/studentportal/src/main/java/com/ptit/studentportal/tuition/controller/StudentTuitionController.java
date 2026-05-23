package com.ptit.studentportal.tuition.controller;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.security.SecurityUtils;
import com.ptit.studentportal.student.Student;
import com.ptit.studentportal.student.StudentRepository;
import com.ptit.studentportal.tuition.dto.TuitionItemResponse;
import com.ptit.studentportal.tuition.entity.Payment;
import com.ptit.studentportal.tuition.entity.TuitionFee;
import com.ptit.studentportal.tuition.service.PaymentService;
import com.ptit.studentportal.tuition.service.TuitionFeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;


import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/student/tuition")
@RequiredArgsConstructor
public class StudentTuitionController {

    private final TuitionFeeService tuitionFeeService;
    private final PaymentService paymentService;
    private final SecurityUtils securityUtils;
    private final StudentRepository studentRepository;

    public record CreatePaymentRequest(Long tuitionFeeId) {}

    private Student getAuthenticatedStudent() {
        Long userId = securityUtils.getCurrentUserId();
        if (userId == null) {
            throw new SecurityException("User not authenticated");
        }
        return studentRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found for authenticated user"));
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<TuitionFee>> getCurrentTuition(@RequestParam Long semesterId) {
        try {
            Student student = getAuthenticatedStudent();
            TuitionFee tuitionFee = tuitionFeeService.getStudentTuition(student.getStudentId(), semesterId);
            return ResponseEntity.ok(ApiResponse.success("Tuition fee loaded successfully", tuitionFee));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{tuitionFeeId}/items")
    public ResponseEntity<ApiResponse<List<TuitionItemResponse>>> getTuitionItems(@PathVariable Long tuitionFeeId) {
        try {
            Student student = getAuthenticatedStudent();
            List<TuitionItemResponse> items = tuitionFeeService.getTuitionItems(tuitionFeeId, student.getStudentId());
            return ResponseEntity.ok(ApiResponse.success("Tuition items loaded successfully", items));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/payments")
    public ResponseEntity<ApiResponse<Payment>> createPayment(@RequestBody CreatePaymentRequest request) {
        try {
            if (request.tuitionFeeId() == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Missing tuitionFeeId"));
            }
            Student student = getAuthenticatedStudent();
            Payment payment = paymentService.createPayment(request.tuitionFeeId(), student.getStudentId());
            return ResponseEntity.ok(ApiResponse.success("Payment created successfully", payment));
        } catch (IllegalStateException | IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/payments/{paymentId}")
    public ResponseEntity<ApiResponse<Payment>> getPayment(@PathVariable Long paymentId) {
        try {
            Student student = getAuthenticatedStudent();
            Payment payment = paymentService.getPaymentDetails(paymentId, student.getStudentId());
            return ResponseEntity.ok(ApiResponse.success("Payment loaded successfully", payment));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<Payment>>> getPaymentHistory() {
        try {
            Student student = getAuthenticatedStudent();
            List<Payment> history = paymentService.getStudentPaymentHistory(student.getStudentId());
            return ResponseEntity.ok(ApiResponse.success("Payment history loaded successfully", history));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/receipt/{paymentId}/export")
    public ResponseEntity<byte[]> exportReceipt(@PathVariable Long paymentId) {
        try {
            Student student = getAuthenticatedStudent();
            Payment payment = paymentService.getPaymentDetails(paymentId, student.getStudentId());
            
            // 1. Lấy mã học kỳ từ luồng dữ liệu liên kết (Bắc cầu: Payment -> TuitionFee -> Semester)
            String semesterCode = "UNKNOWN";
            if (payment.getTuitionFee() != null && payment.getTuitionFee().getSemester() != null) {
                semesterCode = payment.getTuitionFee().getSemester().getSemesterCode();
            }
            
            // 2. Định dạng lại tên file: MãSinhViên_MãHọcKỳ.pdf
            String studentCode = student.getStudentCode();
            String fileName = studentCode + "_" + semesterCode + ".pdf";

            byte[] pdfBytes = generateReceiptPdf(payment, student);
            
            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                    .header("Access-Control-Expose-Headers", "Content-Disposition")
                    .body(pdfBytes);
        } catch (Exception e) {
            log.error("Lỗi xuất hóa đơn PDF: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private byte[] generateReceiptPdf(Payment payment, Student student) throws Exception {
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        com.lowagie.text.Document document = new com.lowagie.text.Document();
        com.lowagie.text.pdf.PdfWriter.getInstance(document, baos);
        document.open();

        com.lowagie.text.Font titleFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 18, com.lowagie.text.Font.BOLD);
        com.lowagie.text.Font boldFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 12, com.lowagie.text.Font.BOLD);
        com.lowagie.text.Font regularFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 12, com.lowagie.text.Font.NORMAL);

        com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph("TUITION PAYMENT RECEIPT", titleFont);
        title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        document.add(new com.lowagie.text.Paragraph("POST AND TELECOMMUNICATIONS INSTITUTE OF TECHNOLOGY", boldFont));
        document.add(new com.lowagie.text.Paragraph("---------------------------------------------------------------------------------", regularFont));
        document.add(new com.lowagie.text.Paragraph("Student Code: " + student.getStudentCode(), regularFont));
        document.add(new com.lowagie.text.Paragraph("Student Name: " + student.getFullName(), regularFont));
        document.add(new com.lowagie.text.Paragraph("Class/Cohort: " + (student.getCohort() != null ? student.getCohort() : "N/A"), regularFont));
        document.add(new com.lowagie.text.Paragraph("---------------------------------------------------------------------------------", regularFont));
        document.add(new com.lowagie.text.Paragraph("Transaction Code: " + (payment.getTransactionCode() != null ? payment.getTransactionCode() : "N/A"), regularFont));
        document.add(new com.lowagie.text.Paragraph("Order Code: " + payment.getOrderCode(), regularFont));
        document.add(new com.lowagie.text.Paragraph("Amount Paid: " + payment.getAmount() + " VND", regularFont));
        document.add(new com.lowagie.text.Paragraph("Payment Method: " + ("cash".equalsIgnoreCase(payment.getPaymentMethod()) ? "Cash" : "QR Gate"), regularFont));
        document.add(new com.lowagie.text.Paragraph("Payment Status: " + payment.getPaymentStatus().toUpperCase(), regularFont));
        document.add(new com.lowagie.text.Paragraph("Paid At: " + (payment.getPaidAt() != null ? payment.getPaidAt().toString() : "N/A"), regularFont));
        document.add(new com.lowagie.text.Paragraph("Processed By: " + payment.getProcessedBy(), regularFont));
        document.add(new com.lowagie.text.Paragraph("Note: " + (payment.getNote() != null ? payment.getNote() : ""), regularFont));
        document.add(new com.lowagie.text.Paragraph("---------------------------------------------------------------------------------", regularFont));

        com.lowagie.text.Paragraph footer = new com.lowagie.text.Paragraph("Thank you for your payment!", boldFont);
        footer.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
        footer.setSpacingBefore(30);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }
}
