package com.ptit.studentportal.program;

import java.util.List;

public record ProgramCurriculumDTO(
        Long studentId,
        String studentCode,
        String fullName,
        Long programId,
        String programCode,
        String programName,
        String departmentName,
        Integer totalCredits,
        Integer completedCredits,
        Integer inProgressCredits,
        Integer lockedCredits,
        List<ProgramCurriculumSemesterDTO> semesters
) {
}