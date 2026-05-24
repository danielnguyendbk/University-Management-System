package com.ptit.studentportal.registration.dto.response;

import java.time.LocalDateTime;

public record RegistrationSemesterResponse(
        Long semesterId,
        String semesterCode,
        String semesterName,
        String academicYear,
        LocalDateTime registrationOpen,
        LocalDateTime registrationClose,
        String registrationStatus,
        String status
) {}
