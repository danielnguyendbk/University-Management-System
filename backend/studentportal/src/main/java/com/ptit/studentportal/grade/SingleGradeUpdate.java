package com.ptit.studentportal.grade;

public record SingleGradeUpdate(
    Long enrollmentId,
    GradeUpdateRequest gradeData
) {}
