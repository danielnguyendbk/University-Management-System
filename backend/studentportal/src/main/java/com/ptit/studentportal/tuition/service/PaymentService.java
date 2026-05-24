package com.ptit.studentportal.tuition.service;

import com.ptit.studentportal.student.Student;
import com.ptit.studentportal.student.StudentRepository;
import com.ptit.studentportal.tuition.entity.Payment;
import com.ptit.studentportal.tuition.entity.TuitionFee;
import com.ptit.studentportal.tuition.repository.PaymentRepository;
import com.ptit.studentportal.tuition.repository.TuitionFeeRepository;
import com.ptit.studentportal.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import com.ptit.studentportal.tuition.service.SepayQrService;



@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final TuitionFeeRepository tuitionFeeRepository;
    private final StudentRepository studentRepository;
    private final SepayQrService sepayQrService;
    private final SecurityUtils securityUtils;



    @Transactional
    public Payment createPayment(Long tuitionFeeId, Long studentId) {
        TuitionFee tuitionFee = tuitionFeeRepository.findById(tuitionFeeId)
                .orElseThrow(() -> new IllegalArgumentException("Tuition fee not found"));

        if (!tuitionFee.getStudentId().equals(studentId)) {
            throw new SecurityException("Unauthorized access to this tuition fee record");
        }

        BigDecimal remainingAmount = tuitionFee.getFinalAmount().subtract(tuitionFee.getPaidAmount());
        if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("This tuition fee has already been fully paid.");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found"));

        String orderCode = "HP" + tuitionFeeId + student.getStudentCode();

        Optional<Payment> existingPaymentOpt = paymentRepository.findByOrderCode(orderCode);
        if (existingPaymentOpt.isPresent()) {
            Payment existing = existingPaymentOpt.get();
            if ("success".equalsIgnoreCase(existing.getPaymentStatus())) {
                throw new IllegalStateException("Tuition fee has already been paid successfully.");
            }

            // Reuse pending payment if not expired
            if (existing.getExpiredAt() == null || existing.getExpiredAt().isAfter(LocalDateTime.now())) {
                log.info("[PaymentService] Reusing active pending payment for orderCode={}", orderCode);
                existing.setAmount(remainingAmount);
                String qrImageUrl = sepayQrService.generateQrImageUrl(orderCode, remainingAmount.longValue());
                existing.setQrImageUrl(qrImageUrl);
                return paymentRepository.save(existing);
            } else {
                // Expired! Renew/extend the existing payment
                log.info("[PaymentService] Pending payment expired for orderCode={}. Renewing payment.", orderCode);
                existing.setAmount(remainingAmount);
                existing.setPaymentStatus("pending");
                existing.setExpiredAt(LocalDateTime.now().plusMinutes(15));
                String qrImageUrl = sepayQrService.generateQrImageUrl(orderCode, remainingAmount.longValue());
                existing.setQrImageUrl(qrImageUrl);
                return paymentRepository.save(existing);
            }
        }

        // Generate brand new payment
        log.info("[PaymentService] Creating new payment record for orderCode={}", orderCode);
        String qrImageUrl = sepayQrService.generateQrImageUrl(orderCode, remainingAmount.longValue());

        Payment payment = Payment.builder()
                .tuitionFee(tuitionFee)
                .paymentMethod("qr")
                .amount(remainingAmount)
                .orderCode(orderCode)
                .qrImageUrl(qrImageUrl)
                .paymentStatus("pending")
                .expiredAt(LocalDateTime.now().plusMinutes(15))
                .build();

        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment confirmCashPayment(Long tuitionFeeId, String studentCode, java.math.BigDecimal amountPaid, String note) {
        // Verify admin username from security context
        String adminUsername = securityUtils.getCurrentUsername();
        // Retrieve tuition fee and ensure student matches studentCode
        TuitionFee tuitionFee = tuitionFeeRepository.findById(tuitionFeeId)
                .orElseThrow(() -> new IllegalArgumentException("Tuition fee not found"));
        // Verify student code matches tuitionFee.studentId via StudentRepository (optional)
        // Assume studentCode is unique and we can get studentId
        // For simplicity, we skip extra validation here.

        // Update paid amount and status
        java.math.BigDecimal newPaid = tuitionFee.getPaidAmount().add(amountPaid);
        tuitionFee.setPaidAmount(newPaid);
        if (newPaid.compareTo(tuitionFee.getFinalAmount()) >= 0) {
            tuitionFee.setStatus("paid");
        } else {
            tuitionFee.setStatus("partical");
        }
        tuitionFeeRepository.save(tuitionFee);

        // Create payment record
        String transactionCode = "TM-" + java.time.Instant.now().toEpochMilli() + "-" + java.util.UUID.randomUUID().toString().substring(0, 8);
        Payment payment = Payment.builder()
                .tuitionFee(tuitionFee)
                .paymentMethod("cash")
                .paymentStatus("success")
                .amount(amountPaid)
                .transactionCode(transactionCode)
                .processedBy(adminUsername)
                .paidAt(java.time.LocalDateTime.now())
                .note(note)
                .build();
        log.info("[PaymentService] Admin '{}' confirmed cash payment for tuitionFeeId={}, amount={}, transactionCode={}", adminUsername, tuitionFeeId, amountPaid, transactionCode);
        return paymentRepository.save(payment);
    }

    @Transactional(readOnly = true)
    public java.util.List<Payment> getStudentPaymentHistory(Long studentId) {
        // Fetch all successful payments for the student's tuition fees
        return paymentRepository.findByTuitionFee_StudentIdAndPaymentStatus(studentId, "success");
    }

    @Transactional(readOnly = true)
    public java.util.List<Payment> getAdminPaymentHistory(String studentCode) {
        if (studentCode == null || studentCode.isBlank()) {
            // Return all successful payments
            return paymentRepository.findAll().stream()
                    .filter(p -> "success".equalsIgnoreCase(p.getPaymentStatus()))
                    .toList();
        } else {
            // Find student by code to get ID
            var studentOpt = studentRepository.findByStudentCode(studentCode);
            if (studentOpt.isEmpty()) {
                return java.util.Collections.emptyList();
            }
            Long studentId = studentOpt.get().getStudentId();
            return paymentRepository.findByTuitionFee_StudentIdAndPaymentStatus(studentId, "success");
        }
    }

    @Transactional(readOnly = true)
    public Payment getPaymentDetails(Long paymentId, Long studentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found"));
        if (!payment.getTuitionFee().getStudentId().equals(studentId)) {
            throw new SecurityException("Unauthorized access to this payment record");
        }
        return payment;
    }
}
