package com.ptit.studentportal.registration.dto.response;

import java.time.LocalDateTime;

public record SectionStudentResponse(
        Long enrollmentId,
        Long studentId,
        String studentCode,
        String fullName,
        String email,
        String enrollmentStatus,
        LocalDateTime registeredAt,
        LocalDateTime droppedAt
) {}
