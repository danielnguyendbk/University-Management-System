package com.ptit.studentportal.timetable.dto.response;

public record SectionOptionResponse(
        Long sectionId,
        String sectionCode,
        String courseCode,
        String courseName,
        Long lecturerId,
        String lecturerCode,
        String lecturerName
) {
}
