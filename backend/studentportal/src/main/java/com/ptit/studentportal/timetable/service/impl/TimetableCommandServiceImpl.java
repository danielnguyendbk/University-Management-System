package com.ptit.studentportal.timetable.service.impl;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Transactional;

import com.ptit.studentportal.timetable.dto.request.CreateScheduleRequest;
import com.ptit.studentportal.timetable.dto.request.GenerateClassSessionsRequest;
import com.ptit.studentportal.timetable.dto.request.UpdateClassSessionRequest;
import com.ptit.studentportal.timetable.entity.ClassSession;
import com.ptit.studentportal.timetable.entity.Schedule;
import com.ptit.studentportal.timetable.enums.SessionStatus;
import com.ptit.studentportal.timetable.enums.SessionType;
import com.ptit.studentportal.timetable.exception.TimetableNotFoundException;
import com.ptit.studentportal.timetable.repository.ClassSessionRepository;
import com.ptit.studentportal.timetable.repository.ScheduleRepository;
import com.ptit.studentportal.timetable.repository.SemesterRepository;
import com.ptit.studentportal.timetable.service.TimetableCommandService;
import com.ptit.studentportal.timetable.enums.TimetableStatus;
import com.ptit.studentportal.timetable.entity.Semester;
import com.ptit.studentportal.timetable.repository.SemesterWeekRepository;
import com.ptit.studentportal.timetable.entity.SemesterWeek;
import com.ptit.studentportal.timetable.repository.CourseSectionRepository;
import com.ptit.studentportal.timetable.validator.TimetableValidator;

@Service
@Transactional
public class TimetableCommandServiceImpl implements TimetableCommandService {

	private final ScheduleRepository scheduleRepository;
	private final ClassSessionRepository classSessionRepository;
	private final TimetableValidator timetableValidator;
	private final SemesterRepository semesterRepository;
	private final SemesterWeekRepository semesterWeekRepository;
	private final CourseSectionRepository courseSectionRepository;

	public TimetableCommandServiceImpl(
			ScheduleRepository scheduleRepository,
			ClassSessionRepository classSessionRepository,
			TimetableValidator timetableValidator,
			SemesterRepository semesterRepository,
			SemesterWeekRepository semesterWeekRepository,
			CourseSectionRepository courseSectionRepository
	) {
		this.scheduleRepository = scheduleRepository;
		this.classSessionRepository = classSessionRepository;
		this.timetableValidator = timetableValidator;
		this.semesterRepository = semesterRepository;
		this.semesterWeekRepository = semesterWeekRepository;
		this.courseSectionRepository = courseSectionRepository;
	}

	@Override
	public Schedule createSchedule(CreateScheduleRequest request) {
		timetableValidator.validateSlotRange(request.slotStart(), request.slotEnd());
		Schedule schedule = Schedule.builder()
				.sectionId(request.sectionId())
				.roomId(request.roomId())
				.dayOfWeek(request.dayOfWeek())
				.fromWeekNo(request.fromWeekNo())
				.toWeekNo(request.toWeekNo())
				.slotStart(request.slotStart())
				.slotEnd(request.slotEnd())
				.startTime(request.startTime())
				.endTime(request.endTime())
				.sessionType(request.sessionType() == null ? SessionType.THEORY : request.sessionType())
				.practiceGroupNo(request.practiceGroupNo() == null ? 0 : request.practiceGroupNo())
				.status(request.status())
				.build();
		return scheduleRepository.save(schedule);
	}

	@Override
	public List<ClassSession> generateClassSessions(GenerateClassSessionsRequest request) {
		Schedule schedule = scheduleRepository.findById(request.scheduleId())
				.orElseThrow(() -> new TimetableNotFoundException("Schedule not found: " + request.scheduleId()));
		var section = courseSectionRepository.findById(schedule.getSectionId())
				.orElseThrow(() -> new TimetableNotFoundException("Course section not found: " + schedule.getSectionId()));

		List<ClassSession> generated = new ArrayList<>();
		for (int week = request.fromWeek(); week <= request.toWeek(); week++) {
			int weekNo = week;
			SemesterWeek semesterWeek = semesterWeekRepository.findBySemesterIdAndWeekNo(request.semesterId(), weekNo)
					.orElseThrow(() -> new TimetableNotFoundException("Semester week not found: " + weekNo));
			LocalDate sessionDate = semesterWeek.getStartDate().plusDays(mapDayOffset(schedule.getDayOfWeek()));
			ClassSession session = ClassSession.builder()
					.scheduleId(schedule.getScheduleId())
					.sectionId(schedule.getSectionId())
					.semesterWeekId(semesterWeek.getSemesterWeekId())
					.roomId(schedule.getRoomId())
					.lecturerId(section.getLecturerId())
					.slotStart(schedule.getSlotStart())
					.slotEnd(schedule.getSlotEnd())
					.startTime(schedule.getStartTime())
					.endTime(schedule.getEndTime())
					.sessionType(schedule.getSessionType())
					.practiceGroupNo(schedule.getPracticeGroupNo() == null ? 0 : schedule.getPracticeGroupNo())
					.sessionStatus(SessionStatus.SCHEDULED)
					.sessionDate(sessionDate)
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

		LocalDate semesterStartDate = semester.getStartDate();
		LocalDate semesterEndDate = semester.getEndDate();
		if (semesterStartDate == null || semesterEndDate == null) {
			throw new TimetableNotFoundException("Semester start/end date not set");
		}

		LocalDate academicYearStartDate = resolveAcademicYearStartDate(semester);
		int fromWeek = Math.max(1, weekNoForDate(semesterStartDate, academicYearStartDate));
		int toWeek = Math.max(fromWeek, weekNoForDate(semesterEndDate, academicYearStartDate));

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
						.cohortYear(parseCohortYear(semester.getSemesterYear()))
						.weekNo(weekNo)
						.startDate(startDate)
						.endDate(endDate)
						.breakWeek(false)
						.build();
			}
			semesterWeekRepository.save(week);
		}

		semesterWeekRepository.deleteBySemesterIdAndWeekNoLessThan(semesterId, fromWeek);
		semesterWeekRepository.deleteBySemesterIdAndWeekNoGreaterThan(semesterId, toWeek);
	}

	private int weekNoForDate(LocalDate date, LocalDate academicYearStartDate) {
		long days = ChronoUnit.DAYS.between(academicYearStartDate, date);
		if (days < 0) {
			return 1;
		}
		return (int) (days / 7) + 1;
	}

	private LocalDate resolveAcademicYearStartDate(Semester semester) {
		String semesterYear = semester.getSemesterYear();
		if (semesterYear != null && semesterYear.contains("-")) {
			String startYearStr = semesterYear.split("-")[0].trim();
			try {
				int startYear = Integer.parseInt(startYearStr);
				return LocalDate.of(startYear, 8, 11);
			} catch (NumberFormatException ignored) {
				// Fallback to semester start date when semesterYear is not parseable.
			}
		}

		LocalDate semesterStartDate = semester.getStartDate();
		if (semesterStartDate == null) {
			return LocalDate.of(LocalDate.now().getYear(), 8, 11);
		}
		LocalDate candidate = LocalDate.of(semesterStartDate.getYear(), 8, 11);
		if (semesterStartDate.isBefore(candidate)) {
			candidate = candidate.minusYears(1);
		}
		return candidate;
	}

	@Override
	@Transactional
	public Map<String, Integer> clearSemesterTimetable(Long semesterId) {
		Semester semester = semesterRepository.findById(semesterId)
				.orElseThrow(() -> new TimetableNotFoundException("Semester not found"));

		int deletedSessions = classSessionRepository.deleteBySemesterId(semesterId);
		int deletedSchedules = scheduleRepository.deleteBySemesterId(semesterId);
		if (deletedSessions == 0 && deletedSchedules == 0) {
			String semesterCode = semester.getSemesterCode();
			if (semesterCode != null && !semesterCode.isBlank()) {
				deletedSessions = classSessionRepository.deleteBySemesterCode(semesterCode);
				deletedSchedules = scheduleRepository.deleteBySemesterCode(semesterCode);
			}
		}

		return Map.of(
				"deletedClassSessions", deletedSessions,
				"deletedSchedules", deletedSchedules
		);
	}

	private int mapDayOffset(String dayOfWeek) {
		if (dayOfWeek == null) {
			return 0;
		}
		return switch (dayOfWeek) {
			case "Mon" -> 0;
			case "Tue" -> 1;
			case "Wed" -> 2;
			case "Thu" -> 3;
			case "Fri" -> 4;
			case "Sat" -> 5;
			case "Sun" -> 6;
			default -> 0;
		};
	}

	private int parseCohortYear(String semesterYear) {
		if (semesterYear == null || semesterYear.isBlank()) {
			return LocalDate.now().getYear();
		}
		return Integer.parseInt(semesterYear.split("-")[0].trim());
	}
}

