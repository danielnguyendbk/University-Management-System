package com.ptit.studentportal.assignment.dto;

public record LecturerOptionResponse(
    Long lecturerId,
    String lecturerCode,
    String fullName,
    Long departmentId,
    String departmentCode
) {}
