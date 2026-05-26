package com.ptit.studentportal.auth;

import com.ptit.studentportal.user.UserRole;

public record LoginResponse(
	String token,
	String username,
	UserRole role,
	String fullName,
	boolean forcePasswordChange,
	Long studentId,
	String studentCode,
	Long lecturerId
) {
}
