package com.ptit.studentportal.timetable.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ptit.studentportal.timetable.dto.request.CreateScheduleRequest;
import com.ptit.studentportal.timetable.dto.request.GenerateClassSessionsRequest;
import com.ptit.studentportal.timetable.dto.request.UpdateClassSessionRequest;
import com.ptit.studentportal.timetable.entity.ClassSession;
import com.ptit.studentportal.timetable.entity.Schedule;
import com.ptit.studentportal.timetable.enums.SessionStatus;
import com.ptit.studentportal.timetable.exception.TimetableNotFoundException;
import com.ptit.studentportal.timetable.repository.ClassSessionRepository;
import com.ptit.studentportal.timetable.repository.ScheduleRepository;
import com.ptit.studentportal.timetable.service.TimetableCommandService;
import com.ptit.studentportal.timetable.validator.TimetableValidator;

@Service
@Transactional
public class TimetableCommandServiceImpl implements TimetableCommandService {

	private final ScheduleRepository scheduleRepository;
	private final ClassSessionRepository classSessionRepository;
	private final TimetableValidator timetableValidator;

	public TimetableCommandServiceImpl(
			ScheduleRepository scheduleRepository,
			ClassSessionRepository classSessionRepository,
			TimetableValidator timetableValidator
	) {
		this.scheduleRepository = scheduleRepository;
		this.classSessionRepository = classSessionRepository;
		this.timetableValidator = timetableValidator;
	}

	@Override
	public Schedule createSchedule(CreateScheduleRequest request) {
		timetableValidator.validateSlotRange(request.slotStart(), request.slotEnd());
		Schedule schedule = Schedule.builder()
				.sectionId(request.sectionId())
				.roomId(request.roomId())
				.dayOfWeek(request.dayOfWeek())
				.slotStart(request.slotStart())
				.slotEnd(request.slotEnd())
				.status(request.status())
				.build();
		return scheduleRepository.save(schedule);
	}

	@Override
	public List<ClassSession> generateClassSessions(GenerateClassSessionsRequest request) {
		Schedule schedule = scheduleRepository.findById(request.scheduleId())
				.orElseThrow(() -> new TimetableNotFoundException("Schedule not found: " + request.scheduleId()));

		List<ClassSession> generated = new ArrayList<>();
		for (int week = request.fromWeek(); week <= request.toWeek(); week++) {
			ClassSession session = ClassSession.builder()
					.scheduleId(schedule.getScheduleId())
					.sectionId(schedule.getSectionId())
					.slotStart(schedule.getSlotStart())
					.slotEnd(schedule.getSlotEnd())
					.sessionStatus(SessionStatus.SCHEDULED)
					.sessionDate(LocalDate.now())
					.build();
			generated.add(classSessionRepository.save(session));
		}
		return generated;
	}

	@Override
	public ClassSession updateClassSession(Long sessionId, UpdateClassSessionRequest request) {
		ClassSession classSession = classSessionRepository.findById(sessionId)
				.orElseThrow(() -> new TimetableNotFoundException("Class session not found: " + sessionId));

		if (request.slotStart() != null && request.slotEnd() != null) {
			timetableValidator.validateSlotRange(request.slotStart(), request.slotEnd());
			classSession.setSlotStart(request.slotStart());
			classSession.setSlotEnd(request.slotEnd());
		}
		if (request.roomId() != null) {
			classSession.setRoomId(request.roomId());
		}
		if (request.lecturerId() != null) {
			classSession.setLecturerId(request.lecturerId());
		}
		if (request.sessionDate() != null) {
			classSession.setSessionDate(request.sessionDate());
		}
		if (request.startTime() != null) {
			classSession.setStartTime(request.startTime());
		}
		if (request.endTime() != null) {
			classSession.setEndTime(request.endTime());
		}
		if (request.sessionStatus() != null) {
			classSession.setSessionStatus(request.sessionStatus());
		}
		if (request.note() != null) {
			classSession.setNote(request.note());
		}

		return classSessionRepository.save(classSession);
	}
}

