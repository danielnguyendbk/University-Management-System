package com.ptit.studentportal.auth;

import com.ptit.studentportal.user.UserRole;
import com.ptit.studentportal.user.UserStatus;

public record CurrentUserResponse(
        Long userId,
        String username,
        String email,
        UserRole role,
        UserStatus status,
        String fullName,
        Long studentId,
        Long lecturerId,
        StudentProfile student,
        LecturerProfile lecturer
) {
}