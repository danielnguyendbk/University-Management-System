package com.ptit.studentportal.registration.dto.request;

import jakarta.validation.constraints.NotNull;

public record RegisterSectionRequest(
        @NotNull(message = "Section ID không được để trống")
        Long sectionId
) {}
