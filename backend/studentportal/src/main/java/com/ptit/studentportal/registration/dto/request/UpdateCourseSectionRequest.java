package com.ptit.studentportal.registration.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateCourseSectionRequest(
        @NotNull(message = "Lecturer ID không được để trống")
        Long lecturerId,

        @NotBlank(message = "Mã lớp học phần không được để trống")
        String sectionCode,

        @NotNull(message = "Sức chứa không được để trống")
        @Min(value = 1, message = "Sức chứa phải lớn hơn 0")
        Integer maxCapacity,

        @NotBlank(message = "Trạng thái không được để trống")
        String status
) {}
