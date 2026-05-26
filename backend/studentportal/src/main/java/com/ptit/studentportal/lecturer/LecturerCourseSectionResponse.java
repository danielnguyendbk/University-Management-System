package com.ptit.studentportal.lecturer;

public record LecturerCourseSectionResponse(
        Long sectionId,
        String sectionCode,

        Long courseId,
        String courseCode,
        String courseName,
        Integer credits,

        Long semesterId,
        String semesterCode,
        String semesterName,

        Long classId,
        String classCode,

        Integer maxCapacity,
        String status,

        Integer currentCapacity,
        Integer remainingCapacity,

        Boolean hasSchedule,
        Boolean hasGeneratedSessions
) {}
