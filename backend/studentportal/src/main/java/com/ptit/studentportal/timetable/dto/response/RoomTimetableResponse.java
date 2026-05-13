package com.ptit.studentportal.timetable.dto.response;

import java.util.List;

import lombok.Builder;

@Builder
public record RoomTimetableResponse(
		Long roomId,
		String roomCode,
		String roomName,
		List<TimetableItemResponse> sessions
) {
}

