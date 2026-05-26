package com.ptit.studentportal.tuition.repository;

import com.ptit.studentportal.tuition.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByTuitionFee_StudentIdAndPaymentStatus(Long studentId, String paymentStatus);
    List<Payment> findByPaymentStatusAndTuitionFee_StudentId(String paymentStatus, Long studentId);
    
    // Paginated queries
    Page<Payment> findByPaymentStatusIgnoreCase(String paymentStatus, Pageable pageable);
    Page<Payment> findByPaymentStatusIgnoreCaseAndTuitionFee_Student_StudentCodeContainingIgnoreCase(String paymentStatus, String studentCode, Pageable pageable);

    Optional<Payment> findByOrderCode(String orderCode);
    Optional<Payment> findByTransactionCode(String transactionCode);
}
