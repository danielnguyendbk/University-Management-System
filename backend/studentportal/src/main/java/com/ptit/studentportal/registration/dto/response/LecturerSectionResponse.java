package com.ptit.studentportal.registration.dto.response;

public record LecturerSectionResponse(
        Long sectionId,
        String sectionCode,
        String courseCode,
        String courseName,
        Integer credits,
        Integer maxCapacity,
        Integer currentCapacity,
        Integer remainingCapacity,
        String status
) {}
