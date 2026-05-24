package com.ptit.studentportal.exam.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "exams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exam_id")
    private Long examId;

    @Column(name = "semester_id")
    private Long semesterId;

    @Column(name = "section_id", nullable = false)
    private Long sectionId;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "proctor_lecturer_id")
    private Long proctorLecturerId;

    @Column(name = "exam_type", nullable = false)
    private String examType;

    @Column(name = "exam_method")
    private String examMethod;

    @Column(name = "exam_date", nullable = false)
    private LocalDate examDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "seat_range", length = 100)
    private String seatRange;

    @Column(name = "student_count")
    private Integer studentCount;

    @Column(name = "status", nullable = false)
    private String status = "SCHEDULED";

    @Column(name = "note", length = 255)
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
