package com.ptit.studentportal.program;

import java.util.List;

public record ProgramCurriculumSemesterDTO(
        Integer semesterNumber,
        String semesterTitle,
        Integer totalCredits,
        List<ProgramCurriculumCourseDTO> courses
) {
}