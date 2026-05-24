package com.ptit.studentportal.course;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.ptit.studentportal.commom.exception.AppException;
import com.ptit.studentportal.program.Program;
import com.ptit.studentportal.program.ProgramRepository;

@Service
@Transactional(readOnly = true)
public class ProgramCourseService {

	private final ProgramCourseRepository programCourseRepository;
	private final CourseRepository courseRepository;
	private final ProgramRepository programRepository;
	private final CourseAdminService courseAdminService;

	public ProgramCourseService(ProgramCourseRepository programCourseRepository,
								 CourseRepository courseRepository,
								 ProgramRepository programRepository,
								 CourseAdminService courseAdminService) {
		this.programCourseRepository = programCourseRepository;
		this.courseRepository = courseRepository;
		this.programRepository = programRepository;
		this.courseAdminService = courseAdminService;
	}

	public List<ProgramCourseResponse> getCoursesByProgram(Long programId) {
		Program program = programRepository.findById(programId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy ngành với id: " + programId));
		return programCourseRepository.findByProgramIdOrderByRecommendedSemesterAsc(programId)
				.stream().map(pc -> mapToResponse(pc, program)).toList();
	}

	public List<CourseSimpleResponse> getAvailableCoursesForProgram(Long programId) {
		programRepository.findById(programId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy ngành với id: " + programId));
		List<Long> assignedIds = programCourseRepository.findCourseIdsByProgramId(programId);
		return courseRepository.findByIsActiveTrue().stream()
				.filter(c -> !assignedIds.contains(c.getCourseId()))
				.map(courseAdminService::toSimpleResponse).toList();
	}

	@Transactional
	public ProgramCourseResponse assignCourse(Long programId, ProgramCourseAssignRequest request) {
		Program program = programRepository.findById(programId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy ngành với id: " + programId));
		Course course = courseRepository.findById(request.courseId())
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy môn học với id: " + request.courseId()));
		if (programCourseRepository.existsByProgramIdAndCourseId(programId, request.courseId())) {
			throw new AppException(HttpStatus.CONFLICT, "Môn " + course.getCourseCode() + " đã gán vào ngành " + program.getProgramName());
		}
		ProgramCourse pc = ProgramCourse.builder()
				.programId(programId).courseId(request.courseId())
				.recommendedSemester(request.recommendedSemester()).isRequired(request.isRequired()).build();
		pc = programCourseRepository.save(pc);
		return mapToResponse(pc, program);
	}

	@Transactional
	public ProgramCourseImportResponse importCourses(Long programId, MultipartFile file) {
		programRepository.findById(programId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy ngành với id: " + programId));

		List<ProgramCourseImportRow> rows = readProgramCourseExcel(file);
		List<ProgramCourseImportError> errors = new ArrayList<>();
		Set<Long> assignedCourseIds = new HashSet<>(programCourseRepository.findCourseIdsByProgramId(programId));
		Set<Long> plannedCourseIds = new HashSet<>(assignedCourseIds);
		List<ProgramCourse> coursesToInsert = new ArrayList<>();
		int skipped = 0;

		for (ProgramCourseImportRow row : rows) {
			String courseCode = normalize(row.courseCode());
			Integer semester = parseSemester(row.semester(), row.rowNumber(), courseCode, errors);
			Integer fileCredits = parseCredits(row.credits(), row.rowNumber(), courseCode, errors);
			if (!StringUtils.hasText(courseCode) || semester == null) {
				if (!StringUtils.hasText(courseCode)) {
					errors.add(new ProgramCourseImportError(row.rowNumber(), courseCode, "Mã môn không được để trống"));
				}
				continue;
			}
			if (fileCredits == null) {
				continue;
			}

			Course course = courseRepository.findByCourseCode(courseCode).orElse(null);
			if (course == null) {
				errors.add(new ProgramCourseImportError(row.rowNumber(), courseCode, "Mã môn không tồn tại trong hệ thống"));
				continue;
			}
			if (!fileCredits.equals(course.getCredits())) {
				errors.add(new ProgramCourseImportError(
						row.rowNumber(),
						courseCode,
						"Số tín chỉ trong file là " + fileCredits + " nhưng hệ thống đang lưu " + course.getCredits() + " tín chỉ"
				));
				continue;
			}
			if (plannedCourseIds.contains(course.getCourseId())) {
				skipped++;
				continue;
			}

			ProgramCourse programCourse = ProgramCourse.builder()
					.programId(programId)
					.courseId(course.getCourseId())
					.recommendedSemester(semester)
					.isRequired(true)
					.build();
			coursesToInsert.add(programCourse);
			plannedCourseIds.add(course.getCourseId());
		}

		if (!errors.isEmpty()) {
			return new ProgramCourseImportResponse(0, skipped, errors);
		}

		programCourseRepository.saveAll(coursesToInsert);
		return new ProgramCourseImportResponse(coursesToInsert.size(), skipped, errors);
	}

	@Transactional
	public ProgramCourseResponse updateProgramCourse(Long programCourseId, ProgramCourseAssignRequest request) {
		ProgramCourse pc = programCourseRepository.findById(programCourseId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi với id: " + programCourseId));
		pc.setRecommendedSemester(request.recommendedSemester());
		pc.setIsRequired(request.isRequired());
		pc = programCourseRepository.save(pc);
		Program program = programRepository.findById(pc.getProgramId()).orElse(null);
		return mapToResponse(pc, program);
	}

	@Transactional
	public void removeCourseFromProgram(Long programId, Long courseId) {
		ProgramCourse pc = programCourseRepository.findByProgramIdAndCourseId(programId, courseId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy môn học trong chương trình đào tạo"));
		programCourseRepository.delete(pc);
	}

	private List<ProgramCourseImportRow> readProgramCourseExcel(MultipartFile file) {
		try (InputStream inputStream = file.getInputStream();
			 Workbook workbook = new XSSFWorkbook(inputStream)) {
			List<ProgramCourseImportRow> rows = new ArrayList<>();
			Sheet sheet = workbook.getSheetAt(0);
			if (sheet == null) {
				return rows;
			}
			Map<String, Integer> headerIndex = null;
			int headerRowIndex = -1;
			for (int i = 0; i <= sheet.getLastRowNum(); i++) {
				Row row = sheet.getRow(i);
				if (row == null) {
					continue;
				}
				if (isEndRow(row)) {
					break;
				}
				Map<String, Integer> candidate = resolveProgramCourseHeaderIndex(row);
				if (candidate.containsKey("semester") && candidate.containsKey("courseCode") && candidate.containsKey("credits")) {
					headerIndex = candidate;
					headerRowIndex = i;
					break;
				}
			}
			if (headerIndex == null) {
				throw new AppException(HttpStatus.BAD_REQUEST, "Không tìm thấy dòng tiêu đề hợp lệ trong file Excel");
			}
			for (int i = headerRowIndex + 1; i <= sheet.getLastRowNum(); i++) {
				Row row = sheet.getRow(i);
				if (row == null) {
					continue;
				}
				if (isEndRow(row)) {
					break;
				}
				String semester = getCellValue(row.getCell(headerIndex.get("semester")));
				String courseCode = getCellValue(row.getCell(headerIndex.get("courseCode")));
				String credits = getCellValue(row.getCell(headerIndex.get("credits")));
				if (!StringUtils.hasText(semester) && !StringUtils.hasText(courseCode) && !StringUtils.hasText(credits)) {
					continue;
				}
				rows.add(new ProgramCourseImportRow(i + 1, semester, courseCode, credits));
			}
			return rows;
		} catch (IOException exception) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Không đọc được file Excel: " + exception.getMessage());
		}
	}

	private Integer parseSemester(String value, int rowNumber, String courseCode, List<ProgramCourseImportError> errors) {
		String normalized = normalize(value);
		if (!StringUtils.hasText(normalized)) {
			errors.add(new ProgramCourseImportError(rowNumber, courseCode, "Học kỳ không được để trống"));
			return null;
		}
		try {
			int semester = Integer.parseInt(normalized);
			if (semester < 1 || semester > 10) {
				errors.add(new ProgramCourseImportError(rowNumber, courseCode, "Học kỳ phải là số nguyên từ 1 đến 10"));
				return null;
			}
			return semester;
		} catch (NumberFormatException exception) {
			errors.add(new ProgramCourseImportError(rowNumber, courseCode, "Học kỳ phải là số nguyên từ 1 đến 10"));
			return null;
		}
	}

	private Integer parseCredits(String value, int rowNumber, String courseCode, List<ProgramCourseImportError> errors) {
		String normalized = normalize(value);
		if (!StringUtils.hasText(normalized)) {
			errors.add(new ProgramCourseImportError(rowNumber, courseCode, "Số tín chỉ không được để trống"));
			return null;
		}
		try {
			int credits = Integer.parseInt(normalized);
			if (credits <= 0) {
				errors.add(new ProgramCourseImportError(rowNumber, courseCode, "Số tín chỉ phải lớn hơn 0"));
				return null;
			}
			return credits;
		} catch (NumberFormatException exception) {
			errors.add(new ProgramCourseImportError(rowNumber, courseCode, "Số tín chỉ không hợp lệ: " + normalized));
			return null;
		}
	}

	private String resolveProgramCourseImportField(String header) {
		String normalized = header == null ? null : header.trim().toLowerCase(Locale.ROOT);
		if (!StringUtils.hasText(normalized)) {
			return null;
		}
		return switch (normalized) {
			case "hoc ky", "học kỳ", "semester", "recommended semester", "recommended_semester" -> "semester";
			case "ma mon", "mã môn", "ma mon hoc", "mã môn học", "course code", "course_code", "coursecode" -> "courseCode";
			case "so tin chi", "số tín chỉ", "tin chi", "tín chỉ", "credits", "credit" -> "credits";
			default -> null;
		};
	}

	private Map<String, Integer> resolveProgramCourseHeaderIndex(Row row) {
		Map<String, Integer> headerIndex = new HashMap<>();
		for (Cell cell : row) {
			String field = resolveProgramCourseImportField(getCellValue(cell));
			if (field != null) {
				headerIndex.put(field, cell.getColumnIndex());
			}
		}
		return headerIndex;
	}

	private boolean isEndRow(Row row) {
		for (Cell cell : row) {
			String value = normalize(getCellValue(cell));
			if ("END".equalsIgnoreCase(value)) {
				return true;
			}
		}
		return false;
	}

	private String getCellValue(Cell cell) {
		if (cell == null) {
			return null;
		}
		return switch (cell.getCellType()) {
			case STRING -> cell.getStringCellValue();
			case NUMERIC -> {
				if (org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
					yield cell.getLocalDateTimeCellValue().toLocalDate().toString();
				}
				double value = cell.getNumericCellValue();
				if (value == Math.rint(value)) {
					yield Long.toString((long) value);
				}
				yield Double.toString(value);
			}
			case BOOLEAN -> Boolean.toString(cell.getBooleanCellValue());
			case FORMULA -> cell.getCellFormula();
			case BLANK, _NONE, ERROR -> null;
			default -> cell.toString();
		};
	}

	private String normalize(String value) {
		return value == null ? null : value.trim();
	}

	private ProgramCourseResponse mapToResponse(ProgramCourse pc, Program program) {
		Course course = courseRepository.findById(pc.getCourseId()).orElse(null);
		return new ProgramCourseResponse(
				pc.getProgramCourseId(), pc.getProgramId(),
				program == null ? null : program.getProgramName(),
				pc.getCourseId(),
				course == null ? null : course.getCourseCode(),
				course == null ? null : course.getCourseName(),
				course == null ? 0 : course.getCredits(),
				course == null || course.getCourseType() == null ? null : course.getCourseType().toDbValue(),
				pc.getRecommendedSemester(), pc.getIsRequired());
	}

	private record ProgramCourseImportRow(int rowNumber, String semester, String courseCode, String credits) {
	}
}
