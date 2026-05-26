package com.ptit.studentportal.exam.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "exam_invigilators")
@IdClass(ExamInvigilatorId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamInvigilator {

    @Id
    @Column(name = "exam_id")
    private Long examId;

    @Id
    @Column(name = "lecturer_id")
    private Long lecturerId;

    @Column(name = "role", nullable = false)
    @Builder.Default
    private String role = "assistant";

    @Column(name = "note", length = 255)
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
