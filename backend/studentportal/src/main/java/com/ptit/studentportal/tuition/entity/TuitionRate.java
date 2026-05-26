package com.ptit.studentportal.tuition.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tuition_rates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TuitionRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tuition_rate_id")
    private Long tuitionRateId;

    /** Cohort year: 2022 → D22, 2023 → D23, etc. */
    @Column(name = "enrollment_year", nullable = false, unique = true)
    private Integer enrollmentYear;

    @Column(name = "price_per_credit", nullable = false)
    private BigDecimal pricePerCredit;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
