package com.ptit.studentportal.auth;

import java.time.LocalDate;

public record StudentProfile(
        Long studentId,
        String studentCode,
        String fullName,
        LocalDate dateOfBirth,
        String gender,
        String phone,
        String address,
        Integer enrollmentYear,
        String academicStatus
) {
}
