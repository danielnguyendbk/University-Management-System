package com.ptit.studentportal.timetable.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.ptit.studentportal.timetable.enums.CalendarBlockType;
import com.ptit.studentportal.timetable.enums.CalendarBlockTypeConverter;

import jakarta.persistence.Access;
import jakarta.persistence.AccessType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
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
@Table(name = "academic_calendar_blocks")
@Access(AccessType.FIELD)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicCalendarBlock {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "calendar_block_id")
	private Long blockId;

	@Column(name = "semester_id", nullable = false)
	private Long semesterId;

	@Column(name = "start_date", nullable = false)
	private LocalDate startDate;

	@Column(name = "end_date", nullable = false)
	private LocalDate endDate;

	@Convert(converter = CalendarBlockTypeConverter.class)
	@Column(name = "block_type", nullable = false, length = 20)
	private CalendarBlockType blockType;

	@Column(name = "title", nullable = false, length = 150)
	private String title;

	@Column(name = "is_teaching_allowed", nullable = false)
	@Builder.Default
	private Boolean teachingAllowed = Boolean.TRUE;

	@Column(name = "note", length = 255)
	private String note;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;
}
