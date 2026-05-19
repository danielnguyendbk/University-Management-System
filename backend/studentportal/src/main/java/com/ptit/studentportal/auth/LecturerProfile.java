package com.ptit.studentportal.auth;

public record LecturerProfile(
        Long lecturerId,
        String lecturerCode,
        String fullName,
        String workEmail,
        String phone,
        String academicTitle,
        Long departmentId
) {
}
