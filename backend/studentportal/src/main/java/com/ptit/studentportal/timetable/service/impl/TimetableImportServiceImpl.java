package com.ptit.studentportal.timetable.service.impl;

import java.io.IOException;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ptit.studentportal.timetable.dto.response.TimetableImportError;
import com.ptit.studentportal.timetable.dto.response.TimetableImportResult;
import com.ptit.studentportal.timetable.entity.CourseSection;
import com.ptit.studentportal.timetable.entity.Room;
import com.ptit.studentportal.timetable.entity.Schedule;
import com.ptit.studentportal.timetable.entity.Semester;
import com.ptit.studentportal.timetable.enums.SessionType;
import com.ptit.studentportal.timetable.repository.CourseSectionRepository;
import com.ptit.studentportal.timetable.repository.RoomRepository;
import com.ptit.studentportal.timetable.repository.ScheduleRepository;
import com.ptit.studentportal.timetable.repository.SemesterRepository;
import com.ptit.studentportal.timetable.service.TimetableImportService;

@Service
public class TimetableImportServiceImpl implements TimetableImportService {

	private final SemesterRepository semesterRepository;
	private final CourseSectionRepository courseSectionRepository;
	private final RoomRepository roomRepository;
	private final ScheduleRepository scheduleRepository;
	private final JdbcTemplate jdbcTemplate;

	public TimetableImportServiceImpl(
			SemesterRepository semesterRepository,
			CourseSectionRepository courseSectionRepository,
			RoomRepository roomRepository,
			ScheduleRepository scheduleRepository,
			JdbcTemplate jdbcTemplate
	) {
		this.semesterRepository = semesterRepository;
		this.courseSectionRepository = courseSectionRepository;
		this.roomRepository = roomRepository;
		this.scheduleRepository = scheduleRepository;
		this.jdbcTemplate = jdbcTemplate;
	}

	@Override
	public TimetableImportResult importSchedulesFromExcel(MultipartFile file) {
		List<TimetableImportError> errors = new ArrayList<>();
		int totalRows = 0;
		int successRows = 0;
		int failedRows = 0;
		Set<Long> successfullySemesterIds = new HashSet<>();

		try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
			Sheet sheet = workbook.getSheetAt(0);

			int rowIndex = 0;
			for (Row row : sheet) {
				rowIndex++;

				// Skip header row
				if (rowIndex == 1) {
					continue;
				}

				// Counter
				totalRows++;
				int currentRowNum = rowIndex;

				try {
					// Parse row
					ScheduleImportRow importRow = parseRow(row, currentRowNum);

					// Validate row
					List<String> validationErrors = validateRow(importRow, currentRowNum);
					if (!validationErrors.isEmpty()) {
						failedRows++;
						for (String error : validationErrors) {
							errors.add(TimetableImportError.builder()
									.rowNumber(currentRowNum)
									.semesterCode(importRow.semesterCode)
									.sectionCode(importRow.sectionCode)
									.error(error)
									.build());
						}
						continue;
					}

					// Lookup entities
					Optional<Semester> semester = semesterRepository.findByAcademicCode(importRow.semesterCode);
					if (semester.isEmpty()) {
						failedRows++;
						errors.add(TimetableImportError.builder()
								.rowNumber(currentRowNum)
								.semesterCode(importRow.semesterCode)
								.sectionCode(importRow.sectionCode)
								.error("Semester with code '" + importRow.semesterCode + "' not found")
								.build());
						continue;
					}

					Optional<CourseSection> section = courseSectionRepository
							.findBySectionCodeAndSemesterId(importRow.sectionCode, semester.get().getSemesterId());
					if (section.isEmpty()) {
						failedRows++;
						errors.add(TimetableImportError.builder()
								.rowNumber(currentRowNum)
								.semesterCode(importRow.semesterCode)
								.sectionCode(importRow.sectionCode)
								.error("Section with code '" + importRow.sectionCode
										+ "' not found in semester '" + importRow.semesterCode + "'")
								.build());
						continue;
					}

					Optional<Room> room = roomRepository.findByRoomCode(importRow.roomCode);
					if (room.isEmpty()) {
						failedRows++;
						errors.add(TimetableImportError.builder()
								.rowNumber(currentRowNum)
								.semesterCode(importRow.semesterCode)
								.sectionCode(importRow.sectionCode)
								.error("Room with code '" + importRow.roomCode + "' not found")
								.build());
						continue;
					}

					// Check for conflicts
					List<String> conflictErrors = checkConflicts(
							semester.get(),
							section.get(),
							room.get(),
							importRow,
							currentRowNum
					);
					if (!conflictErrors.isEmpty()) {
						failedRows++;
						for (String error : conflictErrors) {
							errors.add(TimetableImportError.builder()
									.rowNumber(currentRowNum)
									.semesterCode(importRow.semesterCode)
									.sectionCode(importRow.sectionCode)
									.error(error)
									.build());
						}
						continue;
					}

					// Upsert schedule
					try {
						upsertSchedule(semester.get(), section.get(), room.get(), importRow);
						successRows++;
						successfullySemesterIds.add(semester.get().getSemesterId());
					} catch (Exception e) {
						failedRows++;
						errors.add(TimetableImportError.builder()
								.rowNumber(currentRowNum)
								.semesterCode(importRow.semesterCode)
								.sectionCode(importRow.sectionCode)
								.error("Database error: " + e.getMessage())
								.build());
					}

				} catch (Exception e) {
					failedRows++;
					errors.add(TimetableImportError.builder()
							.rowNumber(currentRowNum)
							.semesterCode("")
							.sectionCode("")
							.error("Row parsing error: " + e.getMessage())
							.build());
				}
			}

		} catch (IOException e) {
			errors.add(TimetableImportError.builder()
					.rowNumber(0)
					.semesterCode("")
					.sectionCode("")
					.error("File reading error: " + e.getMessage())
					.build());
			failedRows++;
		}

		// Call stored procedure for each successfully imported semester
		for (Long semesterId : successfullySemesterIds) {
			try {
				callStoredProcedure(semesterId);
			} catch (Exception e) {
				// Log but don't fail the entire import
				System.err.println("Warning: Failed to call sp_generate_class_sessions_for_semester for semester "
						+ semesterId + ": " + e.getMessage());
			}
		}

		return TimetableImportResult.builder()
				.totalRows(totalRows)
				.successRows(successRows)
				.failedRows(failedRows)
				.errors(errors)
				.build();
	}

	private ScheduleImportRow parseRow(Row row, int rowNum) {
		ScheduleImportRow importRow = new ScheduleImportRow();

		// Column order per requirements: semesterCode, sectionCode, roomCode, lecturerCode,
		// dayOfWeek, fromWeekNo, toWeekNo, slotStart, slotEnd, startTime, endTime, sessionType,
		// groupName, practiceGroupNo, note

		importRow.semesterCode = getCellValueAsString(row.getCell(0));
		importRow.sectionCode = getCellValueAsString(row.getCell(1));
		importRow.roomCode = getCellValueAsString(row.getCell(2));
		importRow.lecturerCode = getCellValueAsString(row.getCell(3));
		importRow.dayOfWeek = getCellValueAsString(row.getCell(4));
		importRow.fromWeekNo = getCellValueAsInteger(row.getCell(5));
		importRow.toWeekNo = getCellValueAsInteger(row.getCell(6));
		importRow.slotStart = getCellValueAsInteger(row.getCell(7));
		importRow.slotEnd = getCellValueAsInteger(row.getCell(8));
		importRow.startTime = parseTime(row.getCell(9), rowNum);
		importRow.endTime = parseTime(row.getCell(10), rowNum);
		importRow.sessionType = getCellValueAsString(row.getCell(11));
		importRow.groupName = getCellValueAsString(row.getCell(12));
		importRow.practiceGroupNo = getCellValueAsInteger(row.getCell(13));
		importRow.note = getCellValueAsString(row.getCell(14));

		return importRow;
	}

	private String getCellValueAsString(Cell cell) {
		if (cell == null) {
			return "";
		}
		switch (cell.getCellType()) {
		case STRING:
			return cell.getStringCellValue().trim();
		case NUMERIC:
			return String.valueOf((long) cell.getNumericCellValue());
		default:
			return "";
		}
	}

	private Integer getCellValueAsInteger(Cell cell) {
		if (cell == null) {
			return null;
		}
		try {
			switch (cell.getCellType()) {
			case NUMERIC:
				return (int) cell.getNumericCellValue();
			case STRING:
				return Integer.parseInt(cell.getStringCellValue().trim());
			default:
				return null;
			}
		} catch (Exception e) {
			return null;
		}
	}

	private LocalTime parseTime(Cell cell, int rowNum) {
		if (cell == null) {
			return null;
		}

		try {
			switch (cell.getCellType()) {
			case NUMERIC:
				// Excel time is stored as fraction of day
				double timeValue = cell.getNumericCellValue();
				int hours = (int) (timeValue * 24);
				int minutes = (int) ((timeValue * 24 - hours) * 60);
				return LocalTime.of(hours, minutes);
			case STRING:
				String timeStr = cell.getStringCellValue().trim();
				if (timeStr.isEmpty()) {
					return null;
				}
				// Try HH:mm:ss format first
				try {
					return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("HH:mm:ss"));
				} catch (Exception e1) {
					// Try HH:mm format
					try {
						return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("HH:mm"));
					} catch (Exception e2) {
						return null;
					}
				}
			default:
				return null;
			}
		} catch (Exception e) {
			return null;
		}
	}

	private List<String> validateRow(ScheduleImportRow row, int rowNum) {
		List<String> errors = new ArrayList<>();

		// Required fields
		if (row.semesterCode == null || row.semesterCode.isEmpty()) {
			errors.add("semesterCode is required");
		}
		if (row.sectionCode == null || row.sectionCode.isEmpty()) {
			errors.add("sectionCode is required");
		}
		if (row.roomCode == null || row.roomCode.isEmpty()) {
			errors.add("roomCode is required");
		}

		// dayOfWeek validation
		if (row.dayOfWeek == null || row.dayOfWeek.isEmpty()) {
			errors.add("dayOfWeek is required");
		} else {
			if (!isValidDayOfWeek(row.dayOfWeek)) {
				errors.add("dayOfWeek must be MON, TUE, WED, THU, FRI, SAT, or SUN");
			}
		}

		// fromWeekNo and toWeekNo
		if (row.fromWeekNo == null) {
			errors.add("fromWeekNo is required");
		}
		if (row.toWeekNo == null) {
			errors.add("toWeekNo is required");
		}
		if (row.fromWeekNo != null && row.toWeekNo != null && row.fromWeekNo > row.toWeekNo) {
			errors.add("fromWeekNo must be <= toWeekNo");
		}

		// Slot validation
		if (row.slotStart == null) {
			errors.add("slotStart is required");
		}
		if (row.slotEnd == null) {
			errors.add("slotEnd is required");
		}
		if (row.slotStart != null && row.slotEnd != null && row.slotStart > row.slotEnd) {
			errors.add("slotStart must be <= slotEnd");
		}

		// Time validation
		if (row.startTime == null) {
			errors.add("startTime is required or has invalid format");
		}
		if (row.endTime == null) {
			errors.add("endTime is required or has invalid format");
		}
		if (row.startTime != null && row.endTime != null && !row.startTime.isBefore(row.endTime)) {
			errors.add("startTime must be before endTime");
		}

		// sessionType validation
		if (row.sessionType == null || row.sessionType.isEmpty()) {
			errors.add("sessionType is required");
		} else {
			if (row.sessionType.equalsIgnoreCase("EXAM")) {
				errors.add("EXAM sessions are not supported");
			}
			if (!row.sessionType.equalsIgnoreCase("THEORY") && !row.sessionType.equalsIgnoreCase("PRACTICE")) {
				errors.add("sessionType must be THEORY or PRACTICE");
			}
		}

		// practiceGroupNo
		if (row.practiceGroupNo == null || row.practiceGroupNo < 0) {
			row.practiceGroupNo = 0; // Default to 0 if not provided
		}

		return errors;
	}

	private boolean isValidDayOfWeek(String day) {
		String upper = day.toUpperCase();
		return upper.equals("MON") || upper.equals("TUE") || upper.equals("WED") || upper.equals("THU")
				|| upper.equals("FRI") || upper.equals("SAT") || upper.equals("SUN");
	}

	private String mapDayOfWeekToDb(String day) {
		// Map from MON to Mon format expected in DB
		return day.substring(0, 1).toUpperCase() + day.substring(1).toLowerCase();
	}

	private List<String> checkConflicts(Semester semester, CourseSection section, Room room,
			ScheduleImportRow row, int rowNum) {
		List<String> errors = new ArrayList<>();

		String dayOfWeek = mapDayOfWeekToDb(row.dayOfWeek);

		// Check room conflicts
		List<Schedule> roomConflicts = scheduleRepository.findRoomOverlaps(
				semester.getSemesterId(),
				dayOfWeek,
				room.getRoomId(),
				row.fromWeekNo,
				row.toWeekNo,
				row.startTime,
				row.endTime,
				null
		);
		if (!roomConflicts.isEmpty()) {
			errors.add("Room conflict: room '" + room.getRoomCode() + "' is already booked");
		}

		// Check section conflicts
		List<Schedule> sectionConflicts = scheduleRepository.findSectionOverlaps(
				semester.getSemesterId(),
				dayOfWeek,
				section.getSectionId(),
				row.fromWeekNo,
				row.toWeekNo,
				row.startTime,
				row.endTime,
				null
		);
		if (!sectionConflicts.isEmpty()) {
			errors.add("Section conflict: section '" + section.getSectionCode() + "' already has a class");
		}

		// Check lecturer conflicts (using lecturer_id from course_sections)
		List<Schedule> lecturerConflicts = scheduleRepository.findLecturerOverlaps(
				semester.getSemesterId(),
				dayOfWeek,
				section.getLecturerId(),
				row.fromWeekNo,
				row.toWeekNo,
				row.startTime,
				row.endTime,
				null
		);
		if (!lecturerConflicts.isEmpty()) {
			errors.add("Lecturer conflict: lecturer already has a class at this time");
		}

		return errors;
	}

	private void upsertSchedule(Semester semester, CourseSection section, Room room, ScheduleImportRow row) {
		String dayOfWeek = mapDayOfWeekToDb(row.dayOfWeek);
		SessionType sessionType = SessionType.valueOf(row.sessionType.toUpperCase());

		// Check if exists by composite key
		List<Schedule> existing = scheduleRepository.findBySectionId(section.getSectionId());
		Schedule existingSchedule = existing.stream()
				.filter(s -> s.getDayOfWeek().equals(dayOfWeek)
						&& s.getFromWeekNo().equals(row.fromWeekNo)
						&& s.getToWeekNo().equals(row.toWeekNo)
						&& s.getSlotStart().equals(row.slotStart)
						&& s.getSlotEnd().equals(row.slotEnd)
						&& s.getSessionType().equals(sessionType)
						&& s.getPracticeGroupNo().equals(row.practiceGroupNo))
				.findFirst()
				.orElse(null);

		if (existingSchedule != null) {
			// Update
			existingSchedule.setRoomId(room.getRoomId());
			existingSchedule.setStartTime(row.startTime);
			existingSchedule.setEndTime(row.endTime);
			existingSchedule.setStatus("active");
			existingSchedule.setNote(row.note);
			scheduleRepository.save(existingSchedule);
		} else {
			// Insert
			Schedule newSchedule = Schedule.builder()
					.sectionId(section.getSectionId())
					.roomId(room.getRoomId())
					.dayOfWeek(dayOfWeek)
					.fromWeekNo(row.fromWeekNo)
					.toWeekNo(row.toWeekNo)
					.slotStart(row.slotStart)
					.slotEnd(row.slotEnd)
					.startTime(row.startTime)
					.endTime(row.endTime)
					.sessionType(sessionType)
					.practiceGroupNo(row.practiceGroupNo)
					.status("active")
					.note(row.note)
					.build();
			scheduleRepository.save(newSchedule);
		}
	}

	private void callStoredProcedure(Long semesterId) {
		jdbcTemplate.update("CALL sp_generate_class_sessions_for_semester(?)", semesterId);
	}

	// Inner class for import row data
	private static class ScheduleImportRow {
		String semesterCode;
		String sectionCode;
		String roomCode;
		String lecturerCode;
		String dayOfWeek;
		Integer fromWeekNo;
		Integer toWeekNo;
		Integer slotStart;
		Integer slotEnd;
		LocalTime startTime;
		LocalTime endTime;
		String sessionType;
		String groupName;
		Integer practiceGroupNo;
		String note;
	}
}

