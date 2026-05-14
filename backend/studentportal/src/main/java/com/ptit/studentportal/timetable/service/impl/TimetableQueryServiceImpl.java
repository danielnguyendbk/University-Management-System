package com.ptit.studentportal.timetable.service.impl;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ptit.studentportal.timetable.dto.response.TimetableItemResponse;
import com.ptit.studentportal.timetable.dto.response.ClassSessionViewProjection;
import com.ptit.studentportal.timetable.entity.Schedule;
import com.ptit.studentportal.timetable.repository.ClassSessionRepository;
import com.ptit.studentportal.timetable.service.TimetableQueryService;

@Service
public class TimetableQueryServiceImpl implements TimetableQueryService {

    private final ClassSessionRepository classSessionRepository;

    public TimetableQueryServiceImpl(ClassSessionRepository classSessionRepository) {
        this.classSessionRepository = classSessionRepository;
    }

    @Override
    public List<TimetableItemResponse> getStudentTimetable(Long studentId, LocalDate fromDate, LocalDate toDate) {
        return Collections.emptyList();
    }

    @Override
    public List<TimetableItemResponse> getLecturerTimetable(Long lecturerId, LocalDate fromDate, LocalDate toDate) {
        return Collections.emptyList();
    }

    @Override
    public List<TimetableItemResponse> getAdminTimetable(LocalDate fromDate, LocalDate toDate) {
        return Collections.emptyList();
    }

    @Override
    public List<ClassSessionViewProjection> getAdminTimetableView(Long semesterId, Integer weekNo, Long buildingId, Long roomId, String sessionType, Long lecturerId, Long sectionId) {
        return classSessionRepository.findClassSessionsView(semesterId, weekNo, buildingId, roomId, sessionType, lecturerId, sectionId);
    }

    @Override
    public TimetableItemResponse mapScheduleToResponse(Schedule schedule) {
        if (schedule == null) {
            return null;
        }

        return new TimetableItemResponse(
                null,
                schedule.getSectionId(),
                null,
                null,
                null,
                schedule.getRoomId(),
                null,
                null,
                null,
                null,
                null,
                null,
                schedule.getDayOfWeek(),
                null,
                schedule.getPracticeGroupNo(),
                null,
                null,
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getSlotStart(),
                schedule.getSlotEnd(),
                schedule.getStatus(),
                schedule.getSessionType() != null ? schedule.getSessionType().name() : null,
                schedule.getSessionType() != null && "PRACTICE".equals(schedule.getSessionType().name()),
                null,
                schedule.getNote()
        );
    }
}