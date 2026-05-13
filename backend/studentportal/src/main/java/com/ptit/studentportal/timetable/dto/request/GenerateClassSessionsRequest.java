package com.ptit.studentportal.timetable.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record GenerateClassSessionsRequest(
        @NotNull Long semesterId,
        Long scheduleId,
        @NotNull @Min(1) Integer fromWeek,
        @NotNull @Min(1) Integer toWeek,
        Boolean overwriteExisting
) {
}