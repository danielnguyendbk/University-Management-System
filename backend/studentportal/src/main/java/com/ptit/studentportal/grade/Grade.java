package com.ptit.studentportal.grade;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "grades")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "grade_id")
    private Long gradeId;

    @Column(name = "enrollment_id", nullable = false, unique = true)
    private Long enrollmentId;

    @Column(name = "attendance_score")
    private BigDecimal attendanceScore;

    @Column(name = "exercise_score")
    private BigDecimal exerciseScore;

    @Column(name = "practice_score")
    private BigDecimal practiceScore;

    @Column(name = "midterm_score")
    private BigDecimal midtermScore;

    @Column(name = "final_score")
    private BigDecimal finalScore;

    @Column(name = "total_score")
    private BigDecimal totalScore;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}