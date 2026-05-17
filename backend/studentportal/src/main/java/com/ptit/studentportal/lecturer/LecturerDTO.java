package com.ptit.studentportal.lecturer;

import com.ptit.studentportal.user.UserRole;
import com.ptit.studentportal.user.UserStatus;

public record LecturerDTO(
        Long lecturerId,
        Long userId,
        String username,
        String email,
        UserRole role,
        UserStatus status,
        Long departmentId,
        String lecturerCode,
        String fullName,
        String phone,
        String academicTitle
) {
}