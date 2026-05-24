package com.ptit.studentportal.timetable.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.ptit.studentportal.timetable.enums.SessionStatus;
import com.ptit.studentportal.timetable.enums.SessionStatusConverter;
import com.ptit.studentportal.timetable.enums.SessionType;

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
@Table(name = "class_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassSession {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "session_id")
	private Long sessionId;

	@Column(name = "schedule_id")
	private Long scheduleId;

	@Column(name = "section_id", nullable = false)
	private Long sectionId;

	@Column(name = "semester_week_id", nullable = false)
	private Long semesterWeekId;

	@Column(name = "session_date", nullable = false)
	private LocalDate sessionDate;

	@Column(name = "room_id")
	private Long roomId;

	@Column(name = "lecturer_id")
	private Long lecturerId;

	@Column(name = "slot_start", nullable = false)
	private Integer slotStart;

	@Column(name = "slot_end", nullable = false)
	private Integer slotEnd;

	@Column(name = "start_time")
	private LocalTime startTime;

	@Column(name = "end_time")
	private LocalTime endTime;

	@Transient
	@Builder.Default
	private SessionType sessionType = SessionType.THEORY;

	@Column(name = "practice_group_no", nullable = false)
	@Builder.Default
	private Integer practiceGroupNo = 0;

	@Convert(converter = SessionStatusConverter.class)
	@Column(name = "session_status", nullable = false, length = 20)
	@Builder.Default
	private SessionStatus sessionStatus = SessionStatus.SCHEDULED;

	@Column(name = "note", length = 255)
	private String note;

	@Transient
	private String cancellationReason;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;
}
