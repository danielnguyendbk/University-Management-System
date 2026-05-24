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
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "course_id")
	private Long courseId;

	@Column(name = "department_id", nullable = false)
	private Long departmentId;

	@Column(name = "course_code", nullable = false, unique = true, length = 20)
	private String courseCode;

	@Column(name = "course_name", nullable = false, length = 150)
	private String courseName;

	@Column(name = "credits", nullable = false)
	private Integer credits;

	@Column(name = "course_type", length = 20)
	private String courseType;

	@Column(name = "is_active")
	private Boolean isActive = true;

	@Column(name = "description", columnDefinition = "TEXT")
	private String description;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;
}

