package com.ptit.studentportal.registration.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "enrollment_id")
    private Long enrollmentId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "section_id", nullable = false)
    private Long sectionId;

    /** 'registered' | 'dropped' | 'cancelled' | 'completed' */
    @Column(name = "enrollment_status", nullable = false, length = 20)
    private String enrollmentStatus;

    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;

    @Column(name = "dropped_at")
    private LocalDateTime droppedAt;

    @Column(name = "note", length = 255)
    private String note;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
