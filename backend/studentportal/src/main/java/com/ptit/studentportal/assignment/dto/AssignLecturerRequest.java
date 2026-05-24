package com.ptit.studentportal.assignment.dto;

import jakarta.validation.constraints.NotNull;

public record AssignLecturerRequest(
    @NotNull(message = "Lecturer ID cannot be null") Long lecturerId,
    Boolean applyToGeneratedSessions
) {}
