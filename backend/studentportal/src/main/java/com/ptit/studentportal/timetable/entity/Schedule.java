package com.ptit.studentportal.timetable.entity;

import java.time.LocalDateTime;
import java.time.LocalTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.ptit.studentportal.timetable.enums.SessionType;
import com.ptit.studentportal.timetable.enums.SessionTypeConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Long scheduleId;



    @Column(name = "section_id", nullable = false)
    private Long sectionId;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "day_of_week", nullable = false, length = 10)
    private String dayOfWeek;

    @Column(name = "from_week_no")
    private Integer fromWeekNo;

    @Column(name = "to_week_no")
    private Integer toWeekNo;

    @Column(name = "slot_start", nullable = false)
    private Integer slotStart;

    @Column(name = "slot_end", nullable = false)
    private Integer slotEnd;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Convert(converter = SessionTypeConverter.class)
    @Column(name = "session_type", nullable = false, length = 20)
    @Builder.Default
    private SessionType sessionType = SessionType.THEORY;

    @Builder.Default
    @Column(name = "practice_group_no", nullable = false)
    private Integer practiceGroupNo = 0;

    @Transient
    private String note;

    @Transient
    private String status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
