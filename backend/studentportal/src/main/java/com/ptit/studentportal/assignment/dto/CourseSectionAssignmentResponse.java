package com.ptit.studentportal.assignment.dto;

public record CourseSectionAssignmentResponse(
    Long sectionId,
    String sectionCode,
    Long courseId,
    String courseCode,
    String courseName,
    Long classId,
    String classCode,
    Long lecturerId,
    String lecturerCode,
    String lecturerName,
    Integer maxCapacity,
    String status,
    Boolean hasSchedule,
    Boolean hasGeneratedSessions,
    String assignmentStatus
) {}
