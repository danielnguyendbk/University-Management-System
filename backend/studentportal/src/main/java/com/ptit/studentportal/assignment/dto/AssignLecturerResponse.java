package com.ptit.studentportal.assignment.dto;

public record AssignLecturerResponse(
    Long sectionId,
    String sectionCode,
    Long lecturerId,
    String lecturerCode,
    String lecturerName,
    String message
) {}
