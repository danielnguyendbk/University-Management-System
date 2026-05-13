package com.ptit.studentportal.timetable.dto.request;

import jakarta.validation.constraints.NotNull;

public record GenerateClassSessionsRequest(
        @NotNull Long semesterId,
        Long scheduleId,
        Boolean overwriteExisting
) {
}