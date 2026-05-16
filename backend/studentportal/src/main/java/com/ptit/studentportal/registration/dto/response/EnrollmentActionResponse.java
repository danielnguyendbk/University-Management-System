package com.ptit.studentportal.registration.dto.response;

public record EnrollmentActionResponse(
        Long enrollmentId,
        Long sectionId,
        String sectionCode,
        String message
) {}
