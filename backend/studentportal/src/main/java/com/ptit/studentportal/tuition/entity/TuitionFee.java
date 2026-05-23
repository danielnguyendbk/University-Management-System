package com.ptit.studentportal.tuition.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.ptit.studentportal.student.Student;
import com.ptit.studentportal.timetable.entity.Semester;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tuition_fees", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "semester_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TuitionFee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tuition_fee_id")
    private Long tuitionFeeId;

    @Column(name = "invoice_code", length = 50, unique = true, nullable = true)
    private String invoiceCode;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", insertable = false, updatable = false)
    private com.ptit.studentportal.student.Student student;

    @Column(name = "semester_id", nullable = false)
    private Long semesterId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", referencedColumnName = "semester_id", insertable = false, updatable = false)
    private Semester semester;


    @Column(name = "total_credits", nullable = false)
    private Integer totalCredits;

    @Column(name = "total_amount", nullable = false)
    private java.math.BigDecimal totalAmount;

    @Column(name = "discount_amount", nullable = false)
    private java.math.BigDecimal discountAmount;

    @Column(name = "final_amount", nullable = false)
    private BigDecimal finalAmount;

    @Builder.Default
    @Column(name = "paid_amount", nullable = false)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "status", nullable = false, length = 20)
    private String status = "unpaid";

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "note")
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
