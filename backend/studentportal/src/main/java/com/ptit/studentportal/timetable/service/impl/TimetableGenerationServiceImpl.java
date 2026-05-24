package com.ptit.studentportal.timetable.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ptit.studentportal.timetable.dto.response.GenerateTimetableResponse;
import com.ptit.studentportal.timetable.entity.AcademicCalendarBlock;
import com.ptit.studentportal.timetable.entity.ClassSession;
import com.ptit.studentportal.timetable.entity.CourseSection;
import com.ptit.studentportal.timetable.entity.Schedule;
import com.ptit.studentportal.timetable.enums.SessionStatus;
import com.ptit.studentportal.timetable.repository.CalendarBlockRepository;
import com.ptit.studentportal.timetable.repository.ClassSessionRepository;
import com.ptit.studentportal.timetable.repository.CourseSectionRepository;
import com.ptit.studentportal.timetable.repository.ScheduleRepository;
import com.ptit.studentportal.timetable.repository.SemesterRepository;
import com.ptit.studentportal.timetable.repository.SemesterWeekRepository;
import com.ptit.studentportal.timetable.service.TimetableGenerationService;

@Service
public class TimetableGenerationServiceImpl implements TimetableGenerationService {

	private final ScheduleRepository scheduleRepository;
	private final SemesterRepository semesterRepository;
	private final SemesterWeekRepository semesterWeekRepository;
	private final CalendarBlockRepository calendarBlockRepository;
	private final ClassSessionRepository classSessionRepository;
	private final CourseSectionRepository courseSectionRepository;

	public TimetableGenerationServiceImpl(
			ScheduleRepository scheduleRepository,
			SemesterRepository semesterRepository,
			SemesterWeekRepository semesterWeekRepository,
			CalendarBlockRepository calendarBlockRepository,
			ClassSessionRepository classSessionRepository,
			CourseSectionRepository courseSectionRepository
	) {
		this.scheduleRepository = scheduleRepository;
		this.semesterRepository = semesterRepository;
		this.semesterWeekRepository = semesterWeekRepository;
		this.calendarBlockRepository = calendarBlockRepository;
		this.classSessionRepository = classSessionRepository;
		this.courseSectionRepository = courseSectionRepository;
	}

	@Override
	@Transactional
	public GenerateTimetableResponse generateForSemester(Long semesterId) {
		semesterRepository.findById(semesterId)
				.orElseThrow(() -> new IllegalArgumentException("Khong tim thay hoc ky."));

		List<Schedule> schedules = scheduleRepository.findActiveSchedulesBySemesterId(semesterId);

		List<AcademicCalendarBlock> blocks = calendarBlockRepository.findBySemesterId(semesterId);
		List<String> warnings = new ArrayList<>();
		int created = 0;
		int updated = 0;
		int cancelled = 0;
		int skipped = 0;

		for (Schedule schedule : schedules) {
			if (schedule.getFromWeekNo() == null || schedule.getToWeekNo() == null) {
				warnings.add("Lich mau thieu khoang tuan: scheduleId=" + schedule.getScheduleId());
				continue;
			}
			CourseSection section = courseSectionRepository.findById(schedule.getSectionId())
					.orElse(null);
			if (section == null) {
				warnings.add("Khong tim thay hoc phan cho scheduleId=" + schedule.getScheduleId());
				continue;
			}
			int dayOffset = mapDayOffset(schedule.getDayOfWeek());
			var weeks = semesterWeekRepository.findBySemesterIdAndWeekNoBetweenOrderByWeekNo(
					semesterId,
					schedule.getFromWeekNo(),
					schedule.getToWeekNo()
			);
			for (var week : weeks) {
				LocalDate sessionDate = week.getStartDate().plusDays(dayOffset);
				AcademicCalendarBlock block = findBlock(blocks, sessionDate);

				var existing = classSessionRepository.findByScheduleIdAndSemesterWeekId(
						schedule.getScheduleId(),
						week.getSemesterWeekId()
				);
				if (existing.isPresent()) {
					ClassSession session = existing.get();
					if (session.getSessionStatus() == SessionStatus.COMPLETED
								|| session.getSessionStatus() == SessionStatus.MAKEUP) {
						skipped++;
						continue;
					}
					// Lecturer conflict check khi update
					if (section.getLecturerId() != null && schedule.getSlotStart() != null && schedule.getSlotEnd() != null) {
						var lecturerConflicts = classSessionRepository.findLecturerConflictOnDate(
								section.getLecturerId(), sessionDate,
								schedule.getSlotStart(), schedule.getSlotEnd(),
								session.getSessionId()
						);
						if (!lecturerConflicts.isEmpty()) {
							var conflict = lecturerConflicts.get(0);
							warnings.add("Lecturer conflict: lecturerId=" + section.getLecturerId()
									+ " tren " + sessionDate + " slot " + schedule.getSlotStart() + "-" + schedule.getSlotEnd()
									+ " trung voi sessionId=" + conflict.getSessionId()
									+ " (scheduleId=" + conflict.getScheduleId() + ")");
							skipped++;
							continue;
						}
					}
					applySchedule(session, schedule, section, week.getSemesterWeekId(), sessionDate, block);
					try {
						classSessionRepository.save(session);
						updated++;
						if (block != null && Boolean.FALSE.equals(block.getTeachingAllowed())) {
							cancelled++;
						}
					} catch (DataIntegrityViolationException ex) {
						warnings.add("Trung lich: scheduleId=" + schedule.getScheduleId() + " - " + ex.getMostSpecificCause().getMessage());
					}
					continue;
				}

				// Lecturer conflict check khi create
				if (section.getLecturerId() != null && schedule.getSlotStart() != null && schedule.getSlotEnd() != null) {
					var lecturerConflicts = classSessionRepository.findLecturerConflictOnDate(
							section.getLecturerId(), sessionDate,
							schedule.getSlotStart(), schedule.getSlotEnd(),
							null
					);
					if (!lecturerConflicts.isEmpty()) {
						var conflict = lecturerConflicts.get(0);
						warnings.add("Lecturer conflict: lecturerId=" + section.getLecturerId()
								+ " tren " + sessionDate + " slot " + schedule.getSlotStart() + "-" + schedule.getSlotEnd()
								+ " trung voi sessionId=" + conflict.getSessionId()
								+ " (scheduleId=" + conflict.getScheduleId() + ")");
						skipped++;
						continue;
					}
				}

				ClassSession session = new ClassSession();
				applySchedule(session, schedule, section, week.getSemesterWeekId(), sessionDate, block);
				try {
					classSessionRepository.save(session);
					created++;
					if (block != null && Boolean.FALSE.equals(block.getTeachingAllowed())) {
						cancelled++;
					}
				} catch (DataIntegrityViolationException ex) {
					warnings.add("Trung lich: scheduleId=" + schedule.getScheduleId() + " - " + ex.getMostSpecificCause().getMessage());
				}
			}
		}

		return GenerateTimetableResponse.builder()
				.semesterId(semesterId)
				.createdCount(created)
				.updatedCount(updated)
				.cancelledByHolidayCount(cancelled)
				.skippedCount(skipped)
				.warnings(warnings)
				.build();
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

	private AcademicCalendarBlock findBlock(List<AcademicCalendarBlock> blocks, LocalDate sessionDate) {
		for (AcademicCalendarBlock block : blocks) {
			if (!sessionDate.isBefore(block.getStartDate()) && !sessionDate.isAfter(block.getEndDate())) {
				return block;
			}
		}
		return null;
	}

	private void applySchedule(
			ClassSession session,
			Schedule schedule,
			CourseSection section,
			Long semesterWeekId,
			LocalDate sessionDate,
			AcademicCalendarBlock block
	) {
		session.setScheduleId(schedule.getScheduleId());
		session.setSectionId(schedule.getSectionId());
		session.setSemesterWeekId(semesterWeekId);
		session.setSessionDate(sessionDate);
		session.setRoomId(schedule.getRoomId());
		session.setLecturerId(section.getLecturerId());
		session.setSlotStart(schedule.getSlotStart());
		session.setSlotEnd(schedule.getSlotEnd());
		session.setStartTime(schedule.getStartTime());
		session.setEndTime(schedule.getEndTime());
		session.setSessionType(schedule.getSessionType());
		session.setPracticeGroupNo(schedule.getPracticeGroupNo());

		if (block != null && Boolean.FALSE.equals(block.getTeachingAllowed())) {
			session.setSessionStatus(SessionStatus.CANCELLED);
			session.setCancellationReason(block.getTitle());
			session.setNote("Nghi do " + block.getTitle());
			return;
		}

		session.setSessionStatus(SessionStatus.SCHEDULED);
		session.setCancellationReason(null);
	}
}

