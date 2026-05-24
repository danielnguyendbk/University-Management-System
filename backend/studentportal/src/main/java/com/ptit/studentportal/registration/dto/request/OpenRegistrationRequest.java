package com.ptit.studentportal.registration.dto.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;

public record OpenRegistrationRequest(
        @NotNull LocalDateTime registrationOpen,
        @NotNull LocalDateTime registrationClose,
        Boolean sendNotification
) {
}
