package com.ptit.studentportal.timetable.dto.response;

public record SemesterOptionResponse(
        Long semesterId,
        String semesterCode,
        String semesterName,
        String academicYear,
        String status,
        String timetableStatus,
        java.math.BigDecimal price_per_credit
) {
}
