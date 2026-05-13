package com.ptit.studentportal.timetable.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;

import com.ptit.studentportal.lecturer.LecturerRepository;
import com.ptit.studentportal.timetable.dto.response.TimetableImportResult;
import com.ptit.studentportal.timetable.entity.CourseSection;
import com.ptit.studentportal.timetable.entity.Room;
import com.ptit.studentportal.timetable.entity.Schedule;
import com.ptit.studentportal.timetable.entity.Semester;
import com.ptit.studentportal.timetable.repository.CourseSectionRepository;
import com.ptit.studentportal.timetable.repository.RoomRepository;
import com.ptit.studentportal.timetable.repository.ScheduleRepository;
import com.ptit.studentportal.timetable.repository.SemesterRepository;

@ExtendWith(MockitoExtension.class)
class TimetableImportServiceImplTest {

	@Mock
	private SemesterRepository semesterRepository;
	@Mock
	private CourseSectionRepository courseSectionRepository;
	@Mock
	private RoomRepository roomRepository;
	@Mock
	private LecturerRepository lecturerRepository;
	@Mock
	private ScheduleRepository scheduleRepository;
	@Mock
	private JdbcTemplate jdbcTemplate;

	@Test
	void importSchedulesFromExcel_groupsMultipleErrorsIntoSingleRowErrorObject() throws IOException {
		TimetableImportServiceImpl service = new TimetableImportServiceImpl(
				semesterRepository,
				courseSectionRepository,
				roomRepository,
				lecturerRepository,
				scheduleRepository,
				jdbcTemplate
		);

		Semester semester = Semester.builder().semesterId(1L).academicCode("2025-2026-HK2").build();
		CourseSection section = CourseSection.builder()
				.sectionId(10L)
				.sectionCode("CN205.01")
				.semesterId(1L)
				.lecturerId(77L)
				.build();
		Room room = Room.builder().roomId(5L).roomCode("A101").build();

		when(semesterRepository.findByAcademicCode("2025-2026-HK2")).thenReturn(Optional.of(semester));
		when(courseSectionRepository.findBySectionCodeAndSemesterId("CN205.01", 1L)).thenReturn(Optional.of(section));
		when(roomRepository.findByRoomCode("A101")).thenReturn(Optional.of(room));
		when(scheduleRepository.findBySectionId(10L)).thenReturn(List.of());
		when(scheduleRepository.findRoomOverlaps(eq(1L), eq("Mon"), eq(5L), eq(1), eq(4), eq(LocalTime.of(7, 0)), eq(LocalTime.of(8, 30)), any()))
				.thenReturn(List.of());
		when(scheduleRepository.findSectionOverlaps(eq(1L), eq("Mon"), eq(10L), eq(1), eq(4), eq(LocalTime.of(7, 0)), eq(LocalTime.of(8, 30)), any()))
				.thenReturn(List.of(Schedule.builder().scheduleId(100L).build()));
		when(scheduleRepository.findLecturerOverlaps(eq(1L), eq("Mon"), eq(77L), eq(1), eq(4), eq(LocalTime.of(7, 0)), eq(LocalTime.of(8, 30)), any()))
				.thenReturn(List.of(Schedule.builder().scheduleId(101L).build()));

		MockMultipartFile file = new MockMultipartFile(
				"file",
				"timetable_import.xlsx",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				createValidWorkbookWithOneDataRow()
		);

		TimetableImportResult result = service.importSchedulesFromExcel(file);

		assertEquals(1, result.totalRows());
		assertEquals(0, result.successRows());
		assertEquals(1, result.failedRows());
		assertEquals(1, result.errors().size());
		assertEquals(2, result.errors().get(0).errors().size());
		assertEquals("Section conflict: section 'CN205.01' already has a class", result.errors().get(0).errors().get(0));
		assertEquals("Lecturer conflict: lecturer already has a class at this time", result.errors().get(0).errors().get(1));
		assertEquals(2, result.errors().get(0).rowNumber());
		assertEquals("2025-2026-HK2", result.errors().get(0).semesterCode());
		assertEquals("CN205.01", result.errors().get(0).sectionCode());
		assertNotNull(result.errors().get(0).errors());
	}

	private byte[] createValidWorkbookWithOneDataRow() throws IOException {
		String[] headers = {
				"semesterCode", "sectionCode", "roomCode", "lecturerCode", "dayOfWeek",
				"fromWeekNo", "toWeekNo", "slotStart", "slotEnd", "startTime",
				"endTime", "sessionType", "practiceGroupNo", "note"
		};

		try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Sheet sheet = workbook.createSheet("Timetable_Import");
			Row headerRow = sheet.createRow(0);
			for (int i = 0; i < headers.length; i++) {
				headerRow.createCell(i).setCellValue(headers[i]);
			}

			Row dataRow = sheet.createRow(1);
			dataRow.createCell(0).setCellValue("2025-2026-HK2");
			dataRow.createCell(1).setCellValue("CN205.01");
			dataRow.createCell(2).setCellValue("A101");
			dataRow.createCell(3).setCellValue("GV001");
			dataRow.createCell(4).setCellValue("MON");
			dataRow.createCell(5).setCellValue(1);
			dataRow.createCell(6).setCellValue(4);
			dataRow.createCell(7).setCellValue(1);
			dataRow.createCell(8).setCellValue(2);
			dataRow.createCell(9).setCellValue("07:00");
			dataRow.createCell(10).setCellValue("08:30");
			dataRow.createCell(11).setCellValue("THEORY");
			dataRow.createCell(12).setCellValue(0);
			dataRow.createCell(13).setCellValue("test");

			workbook.write(out);
			return out.toByteArray();
		}
	}
}

