package com.ptit.studentportal.registration.dto.request;

import jakarta.validation.constraints.NotBlank;

public record SendRegistrationNotificationRequest(
        @NotBlank(message = "Tiêu đề không được để trống")
        String title,

        @NotBlank(message = "Nội dung không được để trống")
        String content,

        @NotBlank(message = "Đối tượng nhận không được để trống")
        String target // STUDENTS, LECTURERS, ALL
) {}
