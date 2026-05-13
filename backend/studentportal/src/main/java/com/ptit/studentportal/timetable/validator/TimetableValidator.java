package com.ptit.studentportal.timetable.validator;

import org.springframework.stereotype.Component;

import com.ptit.studentportal.timetable.dto.request.CreateScheduleRequest;
import com.ptit.studentportal.timetable.dto.request.GenerateClassSessionsRequest;
import com.ptit.studentportal.timetable.dto.request.UpdateClassSessionRequest;
import com.ptit.studentportal.timetable.exception.ScheduleConflictException;

@Component
public class TimetableValidator {

    public void validateCreateSchedule(CreateScheduleRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Create schedule request must not be null");
        }

        if (request.slotStart() != null && request.slotEnd() != null
                && request.slotEnd() < request.slotStart()) {
            throw new ScheduleConflictException("slotEnd must be greater than or equal to slotStart");
        }

        if (request.fromWeekNo() != null && request.toWeekNo() != null
                && request.toWeekNo() < request.fromWeekNo()) {
            throw new ScheduleConflictException("toWeekNo must be greater than or equal to fromWeekNo");
        }

        if (request.startTime() != null && request.endTime() != null
                && !request.endTime().isAfter(request.startTime())) {
            throw new ScheduleConflictException("endTime must be after startTime");
        }
    }

    public void validateGenerateClassSessions(GenerateClassSessionsRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Generate class sessions request must not be null");
        }
    }

    public void validateUpdateClassSession(UpdateClassSessionRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Update class session request must not be null");
        }

        if (request.slotStart() != null && request.slotEnd() != null
                && request.slotEnd() < request.slotStart()) {
            throw new ScheduleConflictException("slotEnd must be greater than or equal to slotStart");
        }

        if (request.startTime() != null && request.endTime() != null
                && !request.endTime().isAfter(request.startTime())) {
            throw new ScheduleConflictException("endTime must be after startTime");
        }
    }
}
