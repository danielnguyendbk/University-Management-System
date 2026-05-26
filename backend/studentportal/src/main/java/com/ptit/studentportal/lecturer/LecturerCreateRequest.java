package com.ptit.studentportal.lecturer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LecturerCreateRequest(
        @NotNull Long userId,
        @NotNull Long departmentId,
        @NotBlank @Size(max = 20) String lecturerCode,
        @NotBlank @Size(max = 150) String fullName,
        @NotBlank @Size(max = 100) String email,
        @Size(max = 20) String phone,
        @Size(max = 100) String academicTitle
) {
}