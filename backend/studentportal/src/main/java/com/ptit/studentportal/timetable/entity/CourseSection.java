package com.ptit.studentportal.timetable.entity;

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
@Table(name = "course_sections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseSection {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "section_id")
	private Long sectionId;

	@Column(name = "course_id", nullable = false)
	private Long courseId;

	@Column(name = "semester_id", nullable = false)
	private Long semesterId;

	@Column(name = "lecturer_id", nullable = false)
	private Long lecturerId;

	@Column(name = "section_code", nullable = false, length = 20)
	private String sectionCode;

	@Column(name = "max_capacity", nullable = false)
	private Integer maxCapacity;

	@Column(name = "status", length = 20)
	private String status;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;
}

