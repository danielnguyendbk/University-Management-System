package com.ptit.studentportal.timetable.service.impl;

import java.io.IOException;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.dao.DataAccessException;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.multipart.MultipartFile;

import com.ptit.studentportal.lecturer.Lecturer;
import com.ptit.studentportal.lecturer.LecturerRepository;
import com.ptit.studentportal.timetable.dto.response.TimetableImportError;
import com.ptit.studentportal.timetable.dto.response.TimetableImportResult;
import com.ptit.studentportal.timetable.dto.response.TimetableImportRowResult;
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
import com.ptit.studentportal.timetable.utils.DayOfWeekMapper;

@Service
public class TimetableImportServiceImpl implements TimetableImportService {

	private final SemesterRepository semesterRepository;
	private final CourseSectionRepository courseSectionRepository;
	private final RoomRepository roomRepository;
	private final LecturerRepository lecturerRepository;
	private final ScheduleRepository scheduleRepository;
	private final JdbcTemplate jdbcTemplate;

	public TimetableImportServiceImpl(
			SemesterRepository semesterRepository,
			CourseSectionRepository courseSectionRepository,
			RoomRepository roomRepository,
			LecturerRepository lecturerRepository,
			ScheduleRepository scheduleRepository,
			JdbcTemplate jdbcTemplate
	) {
		this.semesterRepository = semesterRepository;
		this.courseSectionRepository = courseSectionRepository;
		this.roomRepository = roomRepository;
		this.lecturerRepository = lecturerRepository;
		this.scheduleRepository = scheduleRepository;
		this.jdbcTemplate = jdbcTemplate;
	}

	@Override
	@Transactional
	public TimetableImportResult importSchedulesFromExcel(MultipartFile file) {
		List<TimetableImportError> errors = new ArrayList<>();
		List<TimetableImportRowResult> importedRows = new ArrayList<>();
		List<ScheduleImportRow> parsedRows = new ArrayList<>();

		int totalRows = 0;

		try (Workbook workbook = file.getOriginalFilename().endsWith(".xls") 
				? new HSSFWorkbook(file.getInputStream()) 
				: new XSSFWorkbook(file.getInputStream())) {
			
			Sheet sheet = workbook.getSheetAt(0);

			Row headerRow = sheet.getRow(0);
			if (headerRow == null) {
				return createErrorResult("File is empty or missing header");
			}

			// Find header indices
			int semesterCodeIdx = -1, sectionCodeIdx = -1, roomCodeIdx = -1, lecturerCodeIdx = -1, dayOfWeekIdx = -1;
			int fromWeekNoIdx = -1, toWeekNoIdx = -1, slotStartIdx = -1, slotEndIdx = -1, startTimeIdx = -1, endTimeIdx = -1;
			int sessionTypeIdx = -1, practiceGroupNoIdx = -1, noteIdx = -1;

			for (Cell cell : headerRow) {
				String headerName = getCellValueAsString(cell).trim();
				switch (headerName) {
					case "semesterCode" -> semesterCodeIdx = cell.getColumnIndex();
					case "sectionCode" -> sectionCodeIdx = cell.getColumnIndex();
					case "roomCode" -> roomCodeIdx = cell.getColumnIndex();
					case "lecturerCode" -> lecturerCodeIdx = cell.getColumnIndex();
					case "dayOfWeek" -> dayOfWeekIdx = cell.getColumnIndex();
					case "fromWeekNo" -> fromWeekNoIdx = cell.getColumnIndex();
					case "toWeekNo" -> toWeekNoIdx = cell.getColumnIndex();
					case "slotStart" -> slotStartIdx = cell.getColumnIndex();
					case "slotEnd" -> slotEndIdx = cell.getColumnIndex();
					case "startTime" -> startTimeIdx = cell.getColumnIndex();
					case "endTime" -> endTimeIdx = cell.getColumnIndex();
					case "sessionType" -> sessionTypeIdx = cell.getColumnIndex();
					case "practiceGroupNo" -> practiceGroupNoIdx = cell.getColumnIndex();
					case "note" -> noteIdx = cell.getColumnIndex();
				}
			}

			if (semesterCodeIdx == -1 || sectionCodeIdx == -1 || roomCodeIdx == -1 || dayOfWeekIdx == -1) {
				return createErrorResult("Missing required headers: semesterCode, sectionCode, roomCode, dayOfWeek");
			}

			int rowIndex = 0;
			for (Row row : sheet) {
				rowIndex++;
				if (rowIndex == 1) continue; // Skip header

				if (isBlankRow(
							row,
							semesterCodeIdx,
							sectionCodeIdx,
							roomCodeIdx,
							lecturerCodeIdx,
							dayOfWeekIdx,
							fromWeekNoIdx,
							toWeekNoIdx,
							slotStartIdx,
							slotEndIdx,
							startTimeIdx,
							endTimeIdx,
							sessionTypeIdx,
							practiceGroupNoIdx,
							noteIdx
				)) {
					continue;
				}

				totalRows++;
				int currentRowNum = rowIndex;

				try {
					ScheduleImportRow importRow = new ScheduleImportRow();
					importRow.rowNum = currentRowNum;
					importRow.semesterCode = getCellValueAsString(row.getCell(semesterCodeIdx));
					importRow.sectionCode = getCellValueAsString(row.getCell(sectionCodeIdx));
					importRow.roomCode = getCellValueAsString(row.getCell(roomCodeIdx));
					importRow.lecturerCode = lecturerCodeIdx != -1 ? getCellValueAsString(row.getCell(lecturerCodeIdx)) : "";
					importRow.dayOfWeek = getCellValueAsString(row.getCell(dayOfWeekIdx));
					importRow.fromWeekNo = getCellValueAsInteger(row.getCell(fromWeekNoIdx));
					importRow.toWeekNo = getCellValueAsInteger(row.getCell(toWeekNoIdx));
					importRow.slotStart = getCellValueAsInteger(row.getCell(slotStartIdx));
					importRow.slotEnd = getCellValueAsInteger(row.getCell(slotEndIdx));
					importRow.startTime = parseTime(row.getCell(startTimeIdx));
					importRow.endTime = parseTime(row.getCell(endTimeIdx));
					importRow.sessionType = getCellValueAsString(row.getCell(sessionTypeIdx));
					importRow.practiceGroupNo = practiceGroupNoIdx != -1
							? getCellValueAsIntegerOrDefault(row.getCell(practiceGroupNoIdx), 0)
							: Integer.valueOf(0);
					importRow.note = noteIdx != -1 ? getCellValueAsString(row.getCell(noteIdx)) : "";

					parsedRows.add(importRow);
				} catch (Exception e) {
					addError(errors, currentRowNum, "", "", "Row parsing error: " + e.getMessage());
				}
			}
		} catch (IOException e) {
			return createErrorResult("File reading error: " + e.getMessage());
		}

		if (totalRows == 0) {
			return createErrorResult("File is empty (no data rows)");
		}

		Set<String> semesterCodes = new HashSet<>();
		for (ScheduleImportRow row : parsedRows) {
			if (!row.semesterCode.isEmpty()) {
				semesterCodes.add(row.semesterCode);
			}
		}
		for (String semesterCode : semesterCodes) {
			Optional<Semester> semesterOpt = semesterRepository.findBySemesterCode(semesterCode);
			if (semesterOpt.isPresent()
					&& scheduleRepository.countSchedulesBySemesterId(semesterOpt.get().getSemesterId()) > 0) {
				return createErrorResult(
							"Học kỳ này đã có thời khóa biểu. Vui lòng bấm Xóa lịch hiện có trước khi import lại.");
			}
		}

		Map<Long, Long> importedSectionLecturerIds = new HashMap<>();
		for (ScheduleImportRow row : parsedRows) {
			if (row.lecturerCode.isEmpty() || row.semesterCode.isEmpty() || row.sectionCode.isEmpty()) {
				continue;
			}

			Optional<Semester> semesterOpt = semesterRepository.findBySemesterCode(row.semesterCode);
			if (semesterOpt.isEmpty()) {
				continue;
			}

			Optional<CourseSection> sectionOpt = courseSectionRepository.findBySectionCodeAndSemesterId(
					row.sectionCode, semesterOpt.get().getSemesterId());
			Optional<Lecturer> lecturerOpt = lecturerRepository.findByLecturerCode(row.lecturerCode);
			if (sectionOpt.isEmpty() || lecturerOpt.isEmpty()) {
				continue;
			}

			importedSectionLecturerIds.putIfAbsent(
					sectionOpt.get().getSectionId(),
					lecturerOpt.get().getLecturerId());
		}

		// Validation phase
		List<Schedule> schedulesToSave = new ArrayList<>();
		List<Long> scheduleSemesterIdsToSave = new ArrayList<>();
		List<Long> scheduleLecturerIdsToSave = new ArrayList<>();
		List<Long> successfullySemesterIds = new ArrayList<>();

		for (ScheduleImportRow row : parsedRows) {
			List<String> rowErrors = new ArrayList<>();

			// Required fields
			if (row.semesterCode.isEmpty()) rowErrors.add("semesterCode is required");
			if (row.sectionCode.isEmpty()) rowErrors.add("sectionCode is required");
			if (row.roomCode.isEmpty()) rowErrors.add("roomCode is required");

			if (row.dayOfWeek.isEmpty()) {
				rowErrors.add("dayOfWeek is required");
			} else if (!DayOfWeekMapper.isValidDayOfWeek(row.dayOfWeek)) {
				rowErrors.add("dayOfWeek must be MON, TUE, WED, THU, FRI, SAT, or SUN");
			}

			// numeric validations
			if (row.fromWeekNo == null || row.fromWeekNo <= 0) rowErrors.add("fromWeekNo must be > 0");
			if (row.toWeekNo == null) rowErrors.add("toWeekNo is required");
			if (row.fromWeekNo != null && row.toWeekNo != null && row.toWeekNo < row.fromWeekNo) {
				rowErrors.add("toWeekNo must be >= fromWeekNo");
			}

			if (row.slotStart == null || row.slotStart <= 0) rowErrors.add("slotStart must be > 0");
			if (row.slotEnd == null) rowErrors.add("slotEnd is required");
			if (row.slotStart != null && row.slotEnd != null && row.slotEnd < row.slotStart) {
				rowErrors.add("slotEnd must be >= slotStart");
			}

			if (row.startTime == null) rowErrors.add("startTime is required or has invalid format");
			if (row.endTime == null) rowErrors.add("endTime is required or has invalid format");
			if (row.startTime != null && row.endTime != null && !row.startTime.isBefore(row.endTime)) {
				rowErrors.add("startTime must be before endTime");
			}

			if (row.sessionType.isEmpty()) {
				rowErrors.add("sessionType is required");
			} else if (!row.sessionType.equalsIgnoreCase("THEORY") && !row.sessionType.equalsIgnoreCase("PRACTICE")) {
				rowErrors.add("sessionType must be THEORY or PRACTICE");
			}

			if (row.practiceGroupNo == null) row.practiceGroupNo = 0;

			if (!rowErrors.isEmpty()) {
				errors.add(TimetableImportError.builder()
						.rowNumber(row.rowNum).semesterCode(row.semesterCode).sectionCode(row.sectionCode)
						.errors(rowErrors).build());
				continue;
			}

			// Entity Lookup
			Optional<Semester> semesterOpt = semesterRepository.findBySemesterCode(row.semesterCode);
			if (semesterOpt.isEmpty()) {
				rowErrors.add("Semester with code '" + row.semesterCode + "' not found");
				errors.add(buildError(row, rowErrors));
				continue;
			}
			Semester semester = semesterOpt.get();

			Optional<CourseSection> sectionOpt = courseSectionRepository.findBySectionCodeAndSemesterId(row.sectionCode, semester.getSemesterId());
			if (sectionOpt.isEmpty()) {
				rowErrors.add("Section '" + row.sectionCode + "' not found in semester '" + row.semesterCode + "'");
				errors.add(buildError(row, rowErrors));
				continue;
			}
			CourseSection section = sectionOpt.get();
			Long effectiveLecturerId = importedSectionLecturerIds.getOrDefault(
					section.getSectionId(), section.getLecturerId());

			Optional<Room> roomOpt = roomRepository.findByRoomCode(row.roomCode);
			if (roomOpt.isEmpty()) {
				rowErrors.add("Room '" + row.roomCode + "' not found");
				errors.add(buildError(row, rowErrors));
				continue;
			}
			Room room = roomOpt.get();

			if (!row.lecturerCode.isEmpty()) {
				Optional<Lecturer> lecturerOpt = lecturerRepository.findByLecturerCode(row.lecturerCode);
				if (lecturerOpt.isEmpty()) {
					rowErrors.add("Lecturer '" + row.lecturerCode + "' not found");
				} else if (!lecturerOpt.get().getLecturerId().equals(effectiveLecturerId)) {
					rowErrors.add("Section '" + row.sectionCode + "' has multiple lecturerCode values in import file");
				}
			}

			if (!rowErrors.isEmpty()) {
				errors.add(buildError(row, rowErrors));
				continue;
			}

			// Conflict checks
			String dayOfWeekDb = DayOfWeekMapper.mapDayOfWeekToDb(row.dayOfWeek);
			List<Schedule> roomSlotConflicts = scheduleRepository.findRoomSlotOverlaps(
					semester.getSemesterId(), dayOfWeekDb, room.getRoomId(),
					row.fromWeekNo, row.toWeekNo, row.slotStart, row.slotEnd, null);
			List<Schedule> roomConflicts = scheduleRepository.findRoomOverlaps(
					semester.getSemesterId(), dayOfWeekDb, room.getRoomId(),
					row.fromWeekNo, row.toWeekNo, row.startTime, row.endTime, null);
			if (!roomSlotConflicts.isEmpty() || !roomConflicts.isEmpty()) {
				rowErrors.add("Room conflict: room '" + room.getRoomCode() + "' is already booked");
			}

			List<Schedule> sectionSlotConflicts = scheduleRepository.findSectionSlotOverlaps(
					semester.getSemesterId(), dayOfWeekDb, section.getSectionId(),
					row.fromWeekNo, row.toWeekNo, row.slotStart, row.slotEnd, null);
			List<Schedule> sectionConflicts = scheduleRepository.findSectionOverlaps(
					semester.getSemesterId(), dayOfWeekDb, section.getSectionId(),
					row.fromWeekNo, row.toWeekNo, row.startTime, row.endTime, null);
			if (!sectionSlotConflicts.isEmpty() || !sectionConflicts.isEmpty()) {
				rowErrors.add("Section conflict: section '" + section.getSectionCode() + "' already has a class");
			}

			if (effectiveLecturerId != null) {
				List<Schedule> lecturerSlotConflicts = scheduleRepository.findLecturerSlotOverlaps(
						semester.getSemesterId(), dayOfWeekDb, effectiveLecturerId,
						row.fromWeekNo, row.toWeekNo, row.slotStart, row.slotEnd, null);
				List<Schedule> lecturerConflicts = scheduleRepository.findLecturerOverlaps(
						semester.getSemesterId(), dayOfWeekDb, effectiveLecturerId,
						row.fromWeekNo, row.toWeekNo, row.startTime, row.endTime, null);
				if (!lecturerSlotConflicts.isEmpty() || !lecturerConflicts.isEmpty()) {
					rowErrors.add("Lecturer conflict: lecturer already has a class at this time");
				}
			}

			// In-memory cross-row check (simplified logic: check if the exact same schedule logic exists in schedulesToSave)
			for (int i = 0; i < schedulesToSave.size(); i++) {
				Schedule prev = schedulesToSave.get(i);
				if (scheduleSemesterIdsToSave.get(i).equals(semester.getSemesterId())
						&& prev.getDayOfWeek().equals(dayOfWeekDb)
						&& Math.max(prev.getFromWeekNo(), row.fromWeekNo) <= Math.min(prev.getToWeekNo(), row.toWeekNo)
						&& isSlotOverlap(prev.getSlotStart(), prev.getSlotEnd(), row.slotStart, row.slotEnd)) {
					if (prev.getRoomId().equals(room.getRoomId())) {
						rowErrors.add("Cross-row conflict: Room " + room.getRoomCode() + " overlaps with another row in the same file");
					}
					if (prev.getSectionId().equals(section.getSectionId())) {
						rowErrors.add("Cross-row conflict: Section " + section.getSectionCode() + " overlaps with another row");
					}
					if (effectiveLecturerId != null && effectiveLecturerId.equals(scheduleLecturerIdsToSave.get(i))) {
						rowErrors.add("Cross-row conflict: Lecturer overlaps with another row");
					}
				}
			}

			if (!rowErrors.isEmpty()) {
				errors.add(buildError(row, rowErrors));
				continue;
			}

			// Add to save list
			Schedule newSchedule = Schedule.builder()
					.sectionId(section.getSectionId())
					.roomId(room.getRoomId())
					.dayOfWeek(dayOfWeekDb)
					.fromWeekNo(row.fromWeekNo)
					.toWeekNo(row.toWeekNo)
					.slotStart(row.slotStart)
					.slotEnd(row.slotEnd)
					.startTime(row.startTime)
					.endTime(row.endTime)
					.sessionType(SessionType.valueOf(row.sessionType.toUpperCase()))
					.practiceGroupNo(row.practiceGroupNo)
					.status("ACTIVE")
					.note(row.note)
					.build();

			schedulesToSave.add(newSchedule);
			scheduleSemesterIdsToSave.add(semester.getSemesterId());
			scheduleLecturerIdsToSave.add(effectiveLecturerId);
			if (!successfullySemesterIds.contains(semester.getSemesterId())) {
				successfullySemesterIds.add(semester.getSemesterId());
			}
		}

		if (!errors.isEmpty()) {
			TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
			return TimetableImportResult.builder()
					.totalRows(totalRows)
					.successRows(0)
					.errorRows(errors.size())
					.errors(errors)
					.importedRows(new ArrayList<>())
					.build();
		}

		// Save all
		List<CourseSection> sectionsToUpdate = new ArrayList<>();
		for (Map.Entry<Long, Long> entry : importedSectionLecturerIds.entrySet()) {
			CourseSection section = courseSectionRepository.findById(entry.getKey()).orElse(null);
			if (section != null && !entry.getValue().equals(section.getLecturerId())) {
				section.setLecturerId(entry.getValue());
				sectionsToUpdate.add(section);
			}
		}
		List<Schedule> savedSchedules;
		try {
			courseSectionRepository.saveAll(sectionsToUpdate);
			savedSchedules = scheduleRepository.saveAll(schedulesToSave);
			for (int i = 0; i < savedSchedules.size(); i++) {
				ScheduleImportRow row = parsedRows.get(i);
				importedRows.add(new TimetableImportRowResult(
						row.rowNum, row.semesterCode, row.sectionCode, savedSchedules.get(i).getScheduleId()));
			}
		} catch (DataAccessException ex) {
			TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
			return TimetableImportResult.builder()
					.totalRows(totalRows)
					.successRows(0)
					.errorRows(1)
					.errors(List.of(TimetableImportError.builder()
								.rowNumber(0)
								.semesterCode("")
								.sectionCode("")
								.errors(List.of("Lỗi xung đột thời khóa biểu. Vui lòng kiểm tra trùng phòng/giảng viên/lớp học phần trước khi import."))
								.build()))
					.importedRows(new ArrayList<>())
					.build();
		}

		return TimetableImportResult.builder()
				.totalRows(totalRows)
				.successRows(savedSchedules.size())
				.errorRows(0)
				.errors(new ArrayList<>())
				.importedRows(importedRows)
				.build();
	}

	private TimetableImportError buildError(ScheduleImportRow row, List<String> errs) {
		return TimetableImportError.builder()
				.rowNumber(row.rowNum).semesterCode(row.semesterCode)
				.sectionCode(row.sectionCode).errors(new ArrayList<>(errs)).build();
	}

	private void addError(List<TimetableImportError> errors, int rowNum, String semCode, String secCode, String err) {
		errors.add(TimetableImportError.builder()
				.rowNumber(rowNum).semesterCode(semCode).sectionCode(secCode).errors(List.of(err)).build());
	}

	private TimetableImportResult createErrorResult(String error) {
		return TimetableImportResult.builder()
				.totalRows(0).successRows(0).errorRows(1)
				.errors(List.of(TimetableImportError.builder().rowNumber(0).semesterCode("").sectionCode("").errors(List.of(error)).build()))
				.importedRows(new ArrayList<>())
				.build();
	}

	private String getCellValueAsString(Cell cell) {
		if (cell == null) return "";
		switch (cell.getCellType()) {
		case STRING: return cell.getStringCellValue().trim();
		case NUMERIC: return String.valueOf((long) cell.getNumericCellValue());
		default: return "";
		}
	}

	private boolean isBlankRow(
			Row row,
			int semesterCodeIdx,
			int sectionCodeIdx,
			int roomCodeIdx,
			int lecturerCodeIdx,
			int dayOfWeekIdx,
			int fromWeekNoIdx,
			int toWeekNoIdx,
			int slotStartIdx,
			int slotEndIdx,
			int startTimeIdx,
			int endTimeIdx,
			int sessionTypeIdx,
			int practiceGroupNoIdx,
			int noteIdx
	) {
		if (row == null) return true;
		return isCellBlank(getCellSafe(row, semesterCodeIdx))
				&& isCellBlank(getCellSafe(row, sectionCodeIdx))
				&& isCellBlank(getCellSafe(row, roomCodeIdx))
				&& isCellBlank(getCellSafe(row, lecturerCodeIdx))
				&& isCellBlank(getCellSafe(row, dayOfWeekIdx))
				&& isCellBlank(getCellSafe(row, fromWeekNoIdx))
				&& isCellBlank(getCellSafe(row, toWeekNoIdx))
				&& isCellBlank(getCellSafe(row, slotStartIdx))
				&& isCellBlank(getCellSafe(row, slotEndIdx))
				&& isCellBlank(getCellSafe(row, startTimeIdx))
				&& isCellBlank(getCellSafe(row, endTimeIdx))
				&& isCellBlank(getCellSafe(row, sessionTypeIdx))
				&& isCellBlank(getCellSafe(row, practiceGroupNoIdx))
				&& isCellBlank(getCellSafe(row, noteIdx));
	}

	private Cell getCellSafe(Row row, int index) {
		if (row == null || index < 0) return null;
		return row.getCell(index);
	}

	private boolean isCellBlank(Cell cell) {
		if (cell == null) return true;
		switch (cell.getCellType()) {
		case BLANK:
			return true;
		case STRING:
			return cell.getStringCellValue().trim().isEmpty();
		case FORMULA:
			return isFormulaResultBlank(cell);
		default:
			return false;
		}
	}

	private boolean isFormulaResultBlank(Cell cell) {
		switch (cell.getCachedFormulaResultType()) {
		case STRING:
			return cell.getStringCellValue().trim().isEmpty();
		case BLANK:
			return true;
		default:
			return false;
		}
	}

	private Integer getCellValueAsInteger(Cell cell) {
		if (cell == null) return null;
		try {
			switch (cell.getCellType()) {
			case NUMERIC: return (int) cell.getNumericCellValue();
			case STRING: return Integer.parseInt(cell.getStringCellValue().trim());
			default: return null;
			}
		} catch (Exception e) { return null; }
	}

	private Integer getCellValueAsIntegerOrDefault(Cell cell, int defaultValue) {
		Integer value = getCellValueAsInteger(cell);
		return value != null ? value : Integer.valueOf(defaultValue);
	}

	private boolean isSlotOverlap(Integer startA, Integer endA, Integer startB, Integer endB) {
		if (startA == null || endA == null || startB == null || endB == null) return false;
		return !(endA < startB || startA > endB);
	}

	private LocalTime parseTime(Cell cell) {
		if (cell == null) return null;
		try {
			switch (cell.getCellType()) {
			case NUMERIC:
				double timeValue = cell.getNumericCellValue();
				int hours = (int) (timeValue * 24);
				int minutes = (int) ((timeValue * 24 - hours) * 60);
				return LocalTime.of(hours, minutes);
			case STRING:
				String timeStr = cell.getStringCellValue().trim();
				if (timeStr.isEmpty()) return null;
				try { return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("HH:mm:ss")); } 
				catch (Exception e1) {
					try { return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("HH:mm")); } 
					catch (Exception e2) { return null; }
				}
			default: return null;
			}
		} catch (Exception e) { return null; }
	}

	private static class ScheduleImportRow {
		int rowNum;
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
		Integer practiceGroupNo;
		String note;
	}
}
