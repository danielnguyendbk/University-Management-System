package com.ptit.studentportal.student;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.ptit.studentportal.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Convert;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

	public enum Gender {
		MALE,
		FEMALE,
		OTHER;

		@JsonCreator
		public static Gender fromValue(String value) {
			if (value == null) {
				return null;
			}
			return Gender.valueOf(value.trim().toUpperCase(Locale.ROOT));
		}
	}

	public enum AcademicStatus {
		STUDYING,
		PAUSED,
		GRADUATED,
		DROPPED_OUT;

		@JsonCreator
		public static AcademicStatus fromValue(String value) {
			if (value == null) {
				return null;
			}
			return AcademicStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
		}
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "student_id")
	private Long studentId;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	private User user;

	@Column(name = "program_id", nullable = false)
	private Long programId;

	@Column(name = "student_code", nullable = false, unique = true, length = 20)
	private String studentCode;

	@Column(name = "full_name", nullable = false, length = 150)
	private String fullName;

	@Column(name = "date_of_birth")
	private LocalDate dateOfBirth;

	@Convert(converter = GenderConverter.class)
	@Column(length = 20)
	private Gender gender;

	@Column(length = 20)
	private String phone;

	@Column(name = "address", length = 255)
	private String address;

	@Builder.Default
	@Convert(converter = AcademicStatusConverter.class)
	@Column(name = "academic_status", nullable = false, length = 30)
	private AcademicStatus academicStatus = AcademicStatus.STUDYING;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;
}
