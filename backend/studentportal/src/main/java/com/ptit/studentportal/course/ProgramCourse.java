package com.ptit.studentportal.course;

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
@Table(name = "program_courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgramCourse {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "program_course_id")
	private Long programCourseId;

	@Column(name = "program_id", nullable = false)
	private Long programId;

	@Column(name = "course_id", nullable = false)
	private Long courseId;

	@Column(name = "recommended_semester")
	private Integer recommendedSemester;

	@Builder.Default
	@Column(name = "is_required", nullable = false)
	private Boolean isRequired = true;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;
}
