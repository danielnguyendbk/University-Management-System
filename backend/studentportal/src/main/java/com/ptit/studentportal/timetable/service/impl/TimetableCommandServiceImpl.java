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
import com.ptit.studentportal.timetable.repository.SemesterRepository;
import com.ptit.studentportal.timetable.service.TimetableCommandService;
import com.ptit.studentportal.timetable.enums.TimetableStatus;
import com.ptit.studentportal.timetable.entity.Semester;
import com.ptit.studentportal.timetable.repository.SemesterWeekRepository;
import com.ptit.studentportal.timetable.entity.SemesterWeek;
import com.ptit.studentportal.timetable.validator.TimetableValidator;

@Service
@Transactional
public class TimetableCommandServiceImpl implements TimetableCommandService {

	private final ScheduleRepository scheduleRepository;
	private final ClassSessionRepository classSessionRepository;
	private final TimetableValidator timetableValidator;
	private final SemesterRepository semesterRepository;
	private final SemesterWeekRepository semesterWeekRepository;

	public TimetableCommandServiceImpl(
			ScheduleRepository scheduleRepository,
			ClassSessionRepository classSessionRepository,
			TimetableValidator timetableValidator,
			SemesterRepository semesterRepository,
			SemesterWeekRepository semesterWeekRepository
	) {
		this.scheduleRepository = scheduleRepository;
		this.classSessionRepository = classSessionRepository;
		this.timetableValidator = timetableValidator;
		this.semesterRepository = semesterRepository;
		this.semesterWeekRepository = semesterWeekRepository;
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

	@Override
	public void publishSemester(Long semesterId) {
		Semester semester = semesterRepository.findById(semesterId)
				.orElseThrow(() -> new TimetableNotFoundException("Semester not found"));
		semester.setTimetableStatus(TimetableStatus.PUBLISHED);
		semesterRepository.save(semester);
	}

	@Override
	public void lockSemester(Long semesterId) {
		Semester semester = semesterRepository.findById(semesterId)
				.orElseThrow(() -> new TimetableNotFoundException("Semester not found"));
		semester.setTimetableStatus(TimetableStatus.LOCKED);
		semesterRepository.save(semester);
	}

	@Override
	public void unlockSemester(Long semesterId) {
		Semester semester = semesterRepository.findById(semesterId)
				.orElseThrow(() -> new TimetableNotFoundException("Semester not found"));
		semester.setTimetableStatus(TimetableStatus.DRAFT);
		semesterRepository.save(semester);
	}

	@Override
	public void generateSemesterWeeks(Long semesterId) {
		Semester semester = semesterRepository.findById(semesterId)
				.orElseThrow(() -> new TimetableNotFoundException("Semester not found"));

		String semesterCode = semester.getSemesterCode();
		String semesterYear = semester.getSemesterYear(); // e.g. "2025-2026"

		int fromWeek, toWeek;
		if (semesterCode.contains("HK1")) {
			fromWeek = 1;
			toWeek = 22;
		} else if (semesterCode.contains("HK2")) {
			fromWeek = 23;
			toWeek = 46;
		} else {
			// Fallback or other semesters
			fromWeek = 1;
			toWeek = 10;
		}

		// academicYearStartDate = Aug 11 of the start year
		String startYearStr = semesterYear.split("-")[0];
		LocalDate academicYearStartDate = LocalDate.of(Integer.parseInt(startYearStr), 8, 11);

		for (int weekNo = fromWeek; weekNo <= toWeek; weekNo++) {
			LocalDate startDate = academicYearStartDate.plusDays((long) (weekNo - 1) * 7);
			LocalDate endDate = startDate.plusDays(6);

			var existing = semesterWeekRepository.findBySemesterIdAndWeekNo(semesterId, weekNo);
			SemesterWeek week;
			if (existing.isPresent()) {
				week = existing.get();
				week.setStartDate(startDate);
				week.setEndDate(endDate);
			} else {
				week = SemesterWeek.builder()
						.semesterId(semesterId)
						.weekNo(weekNo)
						.startDate(startDate)
						.endDate(endDate)
						.breakWeek(false)
						.build();
			}
			semesterWeekRepository.save(week);
		}
	}
}

