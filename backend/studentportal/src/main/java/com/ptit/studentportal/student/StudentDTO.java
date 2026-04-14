package com.ptit.studentportal.student;

import java.time.LocalDate;

import com.ptit.studentportal.user.UserRole;
import com.ptit.studentportal.user.UserStatus;

public record StudentDTO(
	Long studentId,
	Long userId,
	String username,
	String email,
	UserRole role,
	UserStatus status,
	Long programId,
	String studentCode,
	String fullName,
	LocalDate dateOfBirth,
	Student.Gender gender,
	String phone,
	String permanentAddress,
	String currentAddress,
	String cohort,
	Student.AcademicStatus academicStatus
) {
}
