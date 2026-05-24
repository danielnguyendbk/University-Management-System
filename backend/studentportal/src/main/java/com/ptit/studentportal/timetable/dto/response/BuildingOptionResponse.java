package com.ptit.studentportal.timetable.dto.response;

public record BuildingOptionResponse(
        Long buildingId,
        String buildingCode,
        String buildingName
) {
}
