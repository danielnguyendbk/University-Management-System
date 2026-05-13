package com.ptit.studentportal.timetable.dto.response;

import java.util.List;

import lombok.Builder;

@Builder
public record BuildingTimetableResponse(
		Long buildingId,
		String buildingCode,
		String buildingName,
		List<RoomTimetableResponse> rooms
) {
}

