package com.ptit.studentportal.registration.dto.response;

public record AdminSectionResponse(
        Long sectionId,
        String sectionCode,
        Long courseId,
        String courseCode,
        String courseName,
        Integer credits,
        Long semesterId,
        Long lecturerId,
        String lecturerCode,
        String lecturerName,
        Integer maxCapacity,
        Integer currentCapacity,
        Integer remainingCapacity,
        String status
) {}
