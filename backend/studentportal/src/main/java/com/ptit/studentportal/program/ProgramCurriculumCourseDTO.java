package com.ptit.studentportal.program;

public record ProgramCurriculumCourseDTO(
        String courseCode,
        String courseName,
        Integer credits,
        Boolean required,
        String status
) {
}