package com.ptit.studentportal.grade;

import java.util.List;

public record BatchGradeUpdateRequest(
    List<SingleGradeUpdate> grades
) {}

