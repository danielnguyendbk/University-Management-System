package com.ptit.studentportal.timetable.service.impl;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ptit.studentportal.lecturer.Lecturer;
import com.ptit.studentportal.lecturer.LecturerRepository;
import com.ptit.studentportal.timetable.dto.request.CreateScheduleRequest;
import com.ptit.studentportal.timetable.dto.request.UpdateScheduleRequest;
import com.ptit.studentportal.timetable.dto.response.ScheduleResponse;
import com.ptit.studentportal.timetable.entity.Course;
import com.ptit.studentportal.timetable.entity.CourseSection;
import com.ptit.studentportal.timetable.entity.Room;
import com.ptit.studentportal.timetable.entity.Schedule;
import com.ptit.studentportal.timetable.entity.Semester;
import com.ptit.studentportal.timetable.enums.SessionType;
import com.ptit.studentportal.timetable.enums.TimetableStatus;
import com.ptit.studentportal.timetable.repository.ClassSessionRepository;
import com.ptit.studentportal.timetable.repository.CourseRepository;
import com.ptit.studentportal.timetable.repository.CourseSectionRepository;
import com.ptit.studentportal.timetable.repository.RoomRepository;
import com.ptit.studentportal.timetable.repository.ScheduleRepository;
import com.ptit.studentportal.timetable.repository.SemesterRepository;
import com.ptit.studentportal.timetable.service.ScheduleService;
import com.ptit.studentportal.timetable.service.TimetableConflictService;
import com.ptit.studentportal.timetable.utils.DayOfWeekMapper;

@Service
@Transactional
public class ScheduleServiceImpl implements ScheduleService {

	private static final LocalTime MORNING_START = LocalTime.of(7, 0);
	private static final LocalTime MORNING_END = LocalTime.of(10, 30);
	private static final LocalTime AFTERNOON_START = LocalTime.of(13, 0);
	private static final LocalTime AFTERNOON_END = LocalTime.of(16, 30);
	private static final LocalTime EVENING_START = LocalTime.of(17, 30);
	private static final LocalTime EVENING_END = LocalTime.of(21, 0);

	private final ScheduleRepository scheduleRepository;
	private final CourseSectionRepository courseSectionRepository;
	private final RoomRepository roomRepository;
	private final SemesterRepository semesterRepository;
	private final ClassSessionRepository classSessionRepository;
	private final TimetableConflictService conflictService;
	private final LecturerRepository lecturerRepository;
	private final CourseRepository courseRepository;

	public ScheduleServiceImpl(
			ScheduleRepository scheduleRepository,
			CourseSectionRepository courseSectionRepository,
			RoomRepository roomRepository,
			SemesterRepository semesterRepository,
			ClassSessionRepository classSessionRepository,
			TimetableConflictService conflictService,
			LecturerRepository lecturerRepository,
			CourseRepository courseRepository
	) {
		this.scheduleRepository = scheduleRepository;
		this.courseSectionRepository = courseSectionRepository;
		this.roomRepository = roomRepository;
		this.semesterRepository = semesterRepository;
		this.classSessionRepository = classSessionRepository;
		this.conflictService = conflictService;
		this.lecturerRepository = lecturerRepository;
		this.courseRepository = courseRepository;
	}

	@Override
	public ScheduleResponse createSchedule(CreateScheduleRequest request) {
		Semester semester = semesterRepository.findById(request.semesterId())
				.orElseThrow(() -> new IllegalArgumentException("Khong tim thay hoc ky."));
		CourseSection section = courseSectionRepository.findById(request.sectionId())
				.orElseThrow(() -> new IllegalArgumentException("Khong tim thay hoc phan."));
		if (!section.getSemesterId().equals(request.semesterId())) {
			throw new IllegalArgumentException("Hoc phan khong thuoc hoc ky nay.");
		}
		Room room = roomRepository.findById(request.roomId())
				.orElseThrow(() -> new IllegalArgumentException("Khong tim thay phong hoc."));

		if (!DayOfWeekMapper.isValidDayOfWeek(request.dayOfWeek())) {
			throw new IllegalArgumentException("Ngay trong tuan khong hop le.");
		}
		String dayOfWeekDb = DayOfWeekMapper.mapDayOfWeekToDb(request.dayOfWeek());

		validateWeekRange(request.fromWeekNo(), request.toWeekNo());
		validateSlotRange(request.slotStart(), request.slotEnd());
		validateTimeRange(request.startTime(), request.endTime());

		SessionType sessionType = request.sessionType() != null ? request.sessionType() : SessionType.THEORY;
		Integer practiceGroupNo = normalizePracticeGroupNo(sessionType, request.practiceGroupNo());

		conflictService.validateScheduleConflicts(
				semester.getSemesterId(),
				section.getSectionId(),
				room.getRoomId(),
				section.getLecturerId(),
				dayOfWeekDb,
				request.fromWeekNo(),
				request.toWeekNo(),
				request.startTime(),
				request.endTime(),
				null
		);

		Schedule schedule = Schedule.builder()
				.sectionId(request.sectionId())
				.roomId(request.roomId())
				.dayOfWeek(dayOfWeekDb)
				.fromWeekNo(request.fromWeekNo())
				.toWeekNo(request.toWeekNo())
				.slotStart(request.slotStart())
				.slotEnd(request.slotEnd())
				.startTime(request.startTime())
				.endTime(request.endTime())
				.sessionType(sessionType)
				.practiceGroupNo(practiceGroupNo)
				.note(request.note())
				.status("ACTIVE")
				.build();

		schedule = scheduleRepository.save(schedule);
		return mapToScheduleResponse(schedule);
	}

	@Override
	@Transactional(readOnly = true)
	public List<ScheduleResponse> getSchedulesBySemester(Long semesterId) {
		semesterRepository.findById(semesterId)
				.orElseThrow(() -> new IllegalArgumentException("Khong tim thay hoc ky."));
		return scheduleRepository.findActiveSchedulesBySemesterId(semesterId).stream()
				.map(this::mapToScheduleResponse)
				.collect(Collectors.toList());
	}

	@Override
	public ScheduleResponse updateSchedule(Long scheduleId, UpdateScheduleRequest request) {
		Schedule schedule = scheduleRepository.findById(scheduleId)
				.orElseThrow(() -> new IllegalArgumentException("Khong tim thay lich mau."));

		CourseSection currentSection = courseSectionRepository.findById(schedule.getSectionId())
				.orElseThrow(() -> new IllegalArgumentException("Khong tim thay hoc phan hien tai."));
		Long currentSemesterId = currentSection.getSemesterId();

		Semester semester = semesterRepository.findById(currentSemesterId)
				.orElseThrow(() -> new IllegalArgumentException("Khong tim thay hoc ky."));
		if (semester.getTimetableStatus() == TimetableStatus.LOCKED) {
			throw new IllegalArgumentException("Hoc ky da bi khoa, khong the cap nhat lich mau.");
		}

		Long semesterId = request.semesterId() != null ? request.semesterId() : currentSemesterId;
		Long sectionId = request.sectionId() != null ? request.sectionId() : schedule.getSectionId();
		Long roomId = request.roomId() != null ? request.roomId() : schedule.getRoomId();
		String dayOfWeek = request.dayOfWeek() != null ? request.dayOfWeek() : schedule.getDayOfWeek();
		Integer fromWeekNo = request.fromWeekNo() != null ? request.fromWeekNo() : schedule.getFromWeekNo();
		Integer toWeekNo = request.toWeekNo() != null ? request.toWeekNo() : schedule.getToWeekNo();
		Integer slotStart = request.slotStart() != null ? request.slotStart() : schedule.getSlotStart();
		Integer slotEnd = request.slotEnd() != null ? request.slotEnd() : schedule.getSlotEnd();
		LocalTime startTime = request.startTime() != null ? request.startTime() : schedule.getStartTime();
		LocalTime endTime = request.endTime() != null ? request.endTime() : schedule.getEndTime();
		SessionType sessionType = request.sessionType() != null ? request.sessionType() : schedule.getSessionType();
		Integer practiceGroupNo = request.practiceGroupNo() != null ? request.practiceGroupNo() : schedule.getPracticeGroupNo();

		CourseSection section = courseSectionRepository.findById(sectionId)
				.orElseThrow(() -> new IllegalArgumentException("Khong tim thay hoc phan."));
		if (!section.getSemesterId().equals(semesterId)) {
			throw new IllegalArgumentException("Hoc phan khong thuoc hoc ky nay.");
		}
		roomRepository.findById(roomId)
				.orElseThrow(() -> new IllegalArgumentException("Khong tim thay phong hoc."));

		if (!DayOfWeekMapper.isValidDayOfWeek(dayOfWeek)) {
			throw new IllegalArgumentException("Ngay trong tuan khong hop le.");
		}
		String dayOfWeekDb = DayOfWeekMapper.mapDayOfWeekToDb(dayOfWeek);

		validateWeekRange(fromWeekNo, toWeekNo);
		validateSlotRange(slotStart, slotEnd);
		validateTimeRange(startTime, endTime);

		practiceGroupNo = normalizePracticeGroupNo(sessionType, practiceGroupNo);

		conflictService.validateScheduleConflicts(
				semesterId,
				sectionId,
				roomId,
				section.getLecturerId(),
				dayOfWeekDb,
				fromWeekNo,
				toWeekNo,
				startTime,
				endTime,
				scheduleId
		);

		schedule.setSectionId(sectionId);
		schedule.setRoomId(roomId);
		schedule.setDayOfWeek(dayOfWeekDb);
		schedule.setFromWeekNo(fromWeekNo);
		schedule.setToWeekNo(toWeekNo);
		schedule.setSlotStart(slotStart);
		schedule.setSlotEnd(slotEnd);
		schedule.setStartTime(startTime);
		schedule.setEndTime(endTime);
		schedule.setSessionType(sessionType);
		schedule.setPracticeGroupNo(practiceGroupNo);
		if (request.note() != null) {
			schedule.setNote(request.note());
		}
		if (request.status() != null) {
			schedule.setStatus(request.status());
		}

		schedule = scheduleRepository.save(schedule);
		return mapToScheduleResponse(schedule);
	}

	@Override
	public void deleteSchedule(Long scheduleId) {
		Schedule schedule = scheduleRepository.findById(scheduleId)
				.orElseThrow(() -> new IllegalArgumentException("Khong tim thay lich mau."));
		if (classSessionRepository.existsByScheduleId(scheduleId)) {
			schedule.setStatus("INACTIVE");
			scheduleRepository.save(schedule);
			return;
		}
		scheduleRepository.delete(schedule);
	}

	private ScheduleResponse mapToScheduleResponse(Schedule schedule) {
		CourseSection section = courseSectionRepository.findById(schedule.getSectionId()).orElse(null);
		Semester semester = section != null ? semesterRepository.findById(section.getSemesterId()).orElse(null) : null;
		Course course = section != null ? courseRepository.findById(section.getCourseId()).orElse(null) : null;
		Room room = roomRepository.findById(schedule.getRoomId()).orElse(null);
		Lecturer lecturer = section != null ? lecturerRepository.findById(section.getLecturerId()).orElse(null) : null;

		String dayLabel = switch (schedule.getDayOfWeek()) {
			case "Mon" -> "Thứ 2";
			case "Tue" -> "Thứ 3";
			case "Wed" -> "Thứ 4";
			case "Thu" -> "Thứ 5";
			case "Fri" -> "Thứ 6";
			case "Sat" -> "Thứ 7";
			case "Sun" -> "Chủ nhật";
			default -> schedule.getDayOfWeek();
		};

		return ScheduleResponse.builder()
				.scheduleId(schedule.getScheduleId())
				.semesterId(semester != null ? semester.getSemesterId() : null)
				.semesterCode(semester != null ? semester.getSemesterCode() : null)
				.sectionId(section != null ? section.getSectionId() : null)
				.sectionCode(section != null ? section.getSectionCode() : null)
				.courseName(course != null ? course.getCourseName() : null)
				.roomId(room != null ? room.getRoomId() : null)
				.roomCode(room != null ? room.getRoomCode() : null)
				.lecturerId(lecturer != null ? lecturer.getLecturerId() : null)
				.lecturerCode(lecturer != null ? lecturer.getLecturerCode() : null)
				.lecturerName(lecturer != null ? lecturer.getFullName() : null)
				.dayOfWeek(schedule.getDayOfWeek() != null ? schedule.getDayOfWeek().toUpperCase() : null)
				.dayOfWeekLabel(dayLabel)
				.fromWeekNo(schedule.getFromWeekNo())
				.toWeekNo(schedule.getToWeekNo())
				.slotStart(schedule.getSlotStart())
				.slotEnd(schedule.getSlotEnd())
				.startTime(schedule.getStartTime())
				.endTime(schedule.getEndTime())
				.sessionType(schedule.getSessionType() != null ? schedule.getSessionType().name() : null)
				.practiceGroupNo(schedule.getPracticeGroupNo())
				.status(schedule.getStatus())
				.note(schedule.getNote())
				.build();
	}

	private void validateWeekRange(Integer fromWeek, Integer toWeek) {
		if (fromWeek == null || toWeek == null || fromWeek > toWeek) {
			throw new IllegalArgumentException("Khoang tuan khong hop le.");
		}
	}

	private void validateSlotRange(Integer slotStart, Integer slotEnd) {
		if (slotStart == null || slotEnd == null) {
			throw new IllegalArgumentException("Tiet hoc khong hop le.");
		}
		if (slotStart < 1 || slotStart > 12 || slotEnd < 1 || slotEnd > 12) {
			throw new IllegalArgumentException("Tiet hoc chi nam trong khoang 1..12.");
		}
		if (slotStart > slotEnd) {
			throw new IllegalArgumentException("slotStart phai nho hon hoac bang slotEnd.");
		}
	}

	private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
		if (startTime == null || endTime == null || !startTime.isBefore(endTime)) {
			throw new IllegalArgumentException("Khung gio khong hop le.");
		}
		if (!(isWithinBlock(startTime, endTime, MORNING_START, MORNING_END)
				|| isWithinBlock(startTime, endTime, AFTERNOON_START, AFTERNOON_END)
				|| isWithinBlock(startTime, endTime, EVENING_START, EVENING_END))) {
			throw new IllegalArgumentException("Khung gio nam ngoai gio hoc chinh thuc.");
		}
	}

	private boolean isWithinBlock(LocalTime start, LocalTime end, LocalTime blockStart, LocalTime blockEnd) {
		return !start.isBefore(blockStart) && !end.isAfter(blockEnd);
	}

	private Integer normalizePracticeGroupNo(SessionType sessionType, Integer practiceGroupNo) {
		if (sessionType == SessionType.PRACTICE) {
			if (practiceGroupNo == null || practiceGroupNo <= 0) {
				throw new IllegalArgumentException("practiceGroupNo phai > 0 cho buoi thuc hanh.");
			}
			return practiceGroupNo;
		}
		return 0;
	}
}
