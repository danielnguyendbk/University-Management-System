package com.ptit.studentportal.timetable.dto.response;

import java.time.LocalDate;

public record SemesterWeekResponse(
        Long semesterWeekId,
        Integer weekNo,
        LocalDate startDate,
        LocalDate endDate,
        Boolean isBreak,
        String weekType,
        String status
) {
}
