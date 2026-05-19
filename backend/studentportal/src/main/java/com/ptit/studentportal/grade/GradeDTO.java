package com.ptit.studentportal.grade;

import java.math.BigDecimal;

public record GradeDTO(
        Long gradeId,
        Long enrollmentId,
        Long studentId,
        String studentCode,
        String studentName,
        String enrollmentStatus,
        Long sectionId,
        String sectionCode,
        String courseCode,
        String courseName,
        String semesterName,
        String academicYear,
        Long lecturerId,
        BigDecimal attendanceScore,
        BigDecimal exerciseScore,
        BigDecimal practiceScore,
        BigDecimal midtermScore,
        BigDecimal finalScore,
        BigDecimal totalScore
) {
}