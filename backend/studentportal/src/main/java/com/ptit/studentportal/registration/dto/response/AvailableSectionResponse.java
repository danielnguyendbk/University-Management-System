package com.ptit.studentportal.registration.dto.response;

public record AvailableSectionResponse(
        Long sectionId,
        String sectionCode,
        Long courseId,
        String courseCode,
        String courseName,
        Integer credits,
        String lecturerName,
        Integer maxCapacity,
        Integer currentCapacity,
        Integer remainingCapacity,
        String status,
        Boolean alreadyRegistered,
        Boolean sameCourseRegistered,
        String scheduleText,
        Boolean canRegister,
        String blockedReason
) {}
