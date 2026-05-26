package com.ptit.studentportal.timetable.dto.response;

public record SectionTimetableOptionResponse(
    Long sectionId,
    String sectionCode,
    String courseCode,
    String courseName,
    String lecturerName,
    String status
) {}
