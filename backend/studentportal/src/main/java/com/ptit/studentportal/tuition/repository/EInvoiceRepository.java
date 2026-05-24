package com.ptit.studentportal.tuition.repository;

import com.ptit.studentportal.tuition.entity.EInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EInvoiceRepository extends JpaRepository<EInvoice, Long> {
    Optional<EInvoice> findByPaymentId(Long paymentId);
}
