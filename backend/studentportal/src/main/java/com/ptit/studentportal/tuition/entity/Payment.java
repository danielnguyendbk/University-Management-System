package com.ptit.studentportal.tuition.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tuition_fee_id")
    private TuitionFee tuitionFee;

    @Builder.Default
    @Column(name = "payment_method", nullable = false, length = 20)
    private String paymentMethod = "qr";

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "transaction_code", length = 100, unique = true)
    private String transactionCode;

    @Column(name = "order_code", length = 50, unique = true)
    private String orderCode;

    @Column(name = "qr_image_url", length = 500)
    private String qrImageUrl;

    @Builder.Default
    @Column(name = "payment_status", nullable = false, length = 20)
    private String paymentStatus = "pending";

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Builder.Default
    @Column(name = "processed_by", nullable = false, length = 100)
    private String processedBy = "SYSTEM";

    @Column(name = "note", length = 255)
    private String note;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
