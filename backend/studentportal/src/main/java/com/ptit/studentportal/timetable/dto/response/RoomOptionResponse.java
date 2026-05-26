package com.ptit.studentportal.timetable.dto.response;

public record RoomOptionResponse(
        Long roomId,
        String roomCode,
        String buildingCode,
        String buildingName,
        String roomType,
        Integer capacity
) {
}
