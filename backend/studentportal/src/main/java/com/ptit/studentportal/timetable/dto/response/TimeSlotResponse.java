package com.ptit.studentportal.timetable.dto.response;

import java.time.LocalTime;

public record TimeSlotResponse(
        Integer slotNo,
        String slotLabel,
        LocalTime startTime,
        LocalTime endTime
) {
}
