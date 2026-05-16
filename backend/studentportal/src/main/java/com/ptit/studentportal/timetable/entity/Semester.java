package com.ptit.studentportal.timetable.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.ptit.studentportal.timetable.enums.SemesterStatus;
import com.ptit.studentportal.timetable.enums.TimetableStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "semesters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Semester {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "semester_id")
	private Long semesterId;

	@Column(name = "semester_code", nullable = false, length = 50)
	private String semesterCode;

	@Column(name = "semester_year", nullable = false, length = 20)
	private String semesterYear;

	@Column(name = "semester_short_name", length = 20)
	private String semesterShortName;

	@Column(name = "semester_name", length = 150)
	private String semesterName;

	@Column(name = "start_date", nullable = false)
	private LocalDate startDate;

	@Column(name = "end_date", nullable = false)
	private LocalDate endDate;

	@Column(name = "registration_open")
	private LocalDateTime registrationOpen;

	@Column(name = "registration_close")
	private LocalDateTime registrationClose;

	@Enumerated(EnumType.STRING)
	@Column(name = "registration_status", nullable = false, length = 20)
	@Builder.Default
	private com.ptit.studentportal.registration.enums.RegistrationStatus registrationStatus = com.ptit.studentportal.registration.enums.RegistrationStatus.CLOSED;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", length = 20)
	private SemesterStatus status;

	@Enumerated(EnumType.STRING)
	@Column(name = "timetable_status", nullable = false, length = 20)
	@Builder.Default
	private TimetableStatus timetableStatus = TimetableStatus.DRAFT;

	@Column(name = "academic_code", length = 50)
	private String academicCode;

	@Column(name = "academic_year", length = 20)
	private String academicYear;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;
}
