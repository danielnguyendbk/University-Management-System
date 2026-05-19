package com.ptit.studentportal.grade;

import java.math.BigInteger;

public record LecturerSectionDTO(
        Long sectionId,
        Long courseId,
        Long semesterId,
        String sectionCode,
        String courseCode,
        String courseName,
        String semesterName,
        String academicYear,
        Integer maxCapacity,
        String status,
        Long currentCapacity
) {

    public static LecturerSectionDTO fromView(GradeRepository.LecturerSectionView view) {
        BigInteger currentCapacity = view.getCurrentCapacity();
        return new LecturerSectionDTO(
                view.getSectionId(),
                view.getCourseId(),
                view.getSemesterId(),
                view.getSectionCode(),
                view.getCourseCode(),
                view.getCourseName(),
                view.getSemesterName(),
                view.getAcademicYear(),
                view.getMaxCapacity(),
                view.getStatus(),
                currentCapacity == null ? 0L : currentCapacity.longValue()
        );
    }
}