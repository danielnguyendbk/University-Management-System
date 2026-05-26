package com.ptit.studentportal.timetable.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.ptit.studentportal.registration.enums.RegistrationStatus;
import com.ptit.studentportal.timetable.enums.SemesterStatus;
import com.ptit.studentportal.timetable.enums.TimetableStatus;

import jakarta.persistence.Column;
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

	@Column(name = "price_per_credit")
	private java.math.BigDecimal pricePerCredit;

	@Column(name = "start_date", nullable = false)
	private LocalDate startDate;

	@Column(name = "end_date", nullable = false)
	private LocalDate endDate;

	@Column(name = "tuition_due_date")
	private LocalDate tuitionDueDate;

	@Column(name = "registration_open")
	private LocalDateTime registrationOpen;

	@Column(name = "registration_close")
	private LocalDateTime registrationClose;

	@Transient
	private SemesterStatus status;

	@Transient
	@Builder.Default
	private TimetableStatus timetableStatus = TimetableStatus.DRAFT;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	public String getSemesterName() {
		return semesterCode;
	}

	public String getAcademicYear() {
		return semesterYear;
	}

	public RegistrationStatus getRegistrationStatus() {
		LocalDateTime now = LocalDateTime.now();
		if (registrationOpen != null && now.isBefore(registrationOpen)) {
			return RegistrationStatus.CLOSED;
		}
		if (registrationClose != null && now.isAfter(registrationClose)) {
			return RegistrationStatus.CLOSED;
		}
		if (registrationOpen == null && registrationClose == null) {
			return RegistrationStatus.CLOSED;
		}
		return RegistrationStatus.OPEN;
	}
}
