package com.ptit.studentportal.registration.dto.response;

import java.time.LocalDateTime;

public record MyEnrollmentResponse(
        Long enrollmentId,
        Long sectionId,
        String sectionCode,
        String courseCode,
        String courseName,
        Integer credits,
        String lecturerName,
        String enrollmentStatus,
        LocalDateTime registeredAt,
        Boolean canDrop,
        String scheduleText
) {}
