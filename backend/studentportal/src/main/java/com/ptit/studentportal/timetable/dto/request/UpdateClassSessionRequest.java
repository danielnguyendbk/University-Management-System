package com.ptit.studentportal.timetable.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;

import com.ptit.studentportal.timetable.enums.SessionStatus;
import com.ptit.studentportal.timetable.enums.SessionType;

public record UpdateClassSessionRequest(
        Long sectionId,
        Long roomId,
        Long lecturerId,
        LocalDate sessionDate,
        Integer slotStart,
        Integer slotEnd,
        LocalTime startTime,
        LocalTime endTime,
        SessionType sessionType,
        Integer practiceGroupNo,
        SessionStatus sessionStatus,
        String note
) {
}