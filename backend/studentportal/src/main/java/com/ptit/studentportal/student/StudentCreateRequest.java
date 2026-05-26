package com.ptit.studentportal.student;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StudentCreateRequest(
        @NotNull Long userId,
        @NotNull Long programId,
        @NotBlank @Size(max = 20) String studentCode,
        @NotBlank @Size(max = 150) String fullName,
        LocalDate dateOfBirth,
        Student.Gender gender,
        @Size(max = 20) String phone,
        @Size(max = 255) String address,
        Integer enrollmentYear,
        @NotNull Student.AcademicStatus academicStatus
) {
}