package com.ptit.studentportal.course;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.ptit.studentportal.admin.common.ImportErrorItem;
import com.ptit.studentportal.commom.exception.AppException;
import com.ptit.studentportal.commom.exception.StructuredApiException;
import com.ptit.studentportal.commom.response.PageResponse;
@Service
@Transactional(readOnly = true)
public class CourseAdminService {

	private static final Logger log = LoggerFactory.getLogger(CourseAdminService.class);

	private static final String ROW_NUMBER_FIELD = "__rowNumber";

	private static final List<String> COURSE_IMPORT_FIELDS = List.of(
			"courseCode", "courseName", "credits", "courseType", "description"
	);

	private static final List<String> COURSE_TYPE_VALUES = List.of(
			"bắt buộc chung",
			"bắt buộc chung nhóm ngành",
			"cơ sở ngành",
			"chuyên ngành",
			"thực tập",
			"luận văn tốt nghiệp"
	);

	private final CourseRepository courseRepository;
	private final ProgramCourseRepository programCourseRepository;

	public CourseAdminService(CourseRepository courseRepository,
							  ProgramCourseRepository programCourseRepository) {
		this.courseRepository = courseRepository;
		this.programCourseRepository = programCourseRepository;
	}

	public PageResponse<CourseResponse> listCourses(String courseType,
			Boolean isActive, String keyword, Pageable pageable) {
		Specification<Course> specification = buildSpecification(courseType, isActive, keyword);
		Page<Course> page = courseRepository.findAll(specification, pageable);
		return new PageResponse<>(
				page.getContent().stream().map(this::toResponse).toList(),
				page.getTotalElements(),
				page.getTotalPages(),
				page.getNumber(),
				page.getSize()
		);
	}

	public CourseResponse getCourse(Long courseId) {
		Course course = courseRepository.findById(courseId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy môn học với id: " + courseId));
		return toResponse(course);
	}

	@Transactional
	public CourseResponse createCourse(CourseCreateRequest request) {
		String courseCode = normalize(request.courseCode());
		if (courseRepository.existsByCourseCode(courseCode)) {
			throw duplicateCourseCode(courseCode);
		}

		Course course = Course.builder()
				.courseCode(courseCode)
				.courseName(request.courseName().trim())
				.credits(request.credits())
				.courseType(Course.CourseType.fromValue(request.courseType()))
				.description(request.description())
				.isActive(true)
				.build();
		course = courseRepository.save(course);
		return toResponse(course);
	}

	@Transactional
	public CourseResponse updateCourse(Long courseId, CourseUpdateRequest request) {
		Course course = courseRepository.findById(courseId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy môn học với id: " + courseId));

		course.setCourseName(request.courseName().trim());
		course.setCredits(request.credits());
		course.setCourseType(Course.CourseType.fromValue(request.courseType()));
		course.setDescription(request.description());
		course = courseRepository.save(course);
		return toResponse(course);
	}

	@Transactional
	public void deleteCourse(Long courseId) {
		Course course = courseRepository.findById(courseId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy môn học với id: " + courseId));
		try {
			programCourseRepository.deleteByCourseId(courseId);
			courseRepository.delete(course);
		} catch (DataIntegrityViolationException exception) {
			throw new AppException(HttpStatus.CONFLICT,
					"Không thể xóa môn học " + course.getCourseCode() + " vì đang có lớp học phần hoặc dữ liệu đăng ký liên quan");
		}
	}

	@Transactional
	public CourseImportResultResponse importFromExcel(MultipartFile file) {
		List<Map<String, String>> rows = readExcel(file);
		List<ImportErrorItem> errors = new ArrayList<>();
		Set<String> duplicateCodes = new LinkedHashSet<>();
		Set<String> fileCodes = new LinkedHashSet<>();
		List<Course> coursesToInsert = new ArrayList<>();

		for (int index = 0; index < rows.size(); index++) {
			Map<String, String> row = rows.get(index);
			int rowNumber = Integer.parseInt(row.getOrDefault(ROW_NUMBER_FIELD, Integer.toString(index + 2)));
			String courseCode = normalizeCode(row.get("courseCode"));
			String courseName = normalize(row.get("courseName"));
			String creditsText = normalize(row.get("credits"));
			String courseType = normalize(row.get("courseType"));
			String description = normalize(row.get("description"));

			if (!StringUtils.hasText(courseCode)) {
				errors.add(new ImportErrorItem(rowNumber, courseCode, "Mã môn học không được để trống"));
				continue;
			}
			if (!StringUtils.hasText(courseName)) {
				errors.add(new ImportErrorItem(rowNumber, courseCode, "Tên môn học không được để trống"));
				continue;
			}
			if (!fileCodes.add(courseCode)) {
				duplicateCodes.add(courseCode);
				continue;
			}
			if (!StringUtils.hasText(creditsText)) {
				errors.add(new ImportErrorItem(rowNumber, courseCode, "Số tín chỉ không được để trống"));
				continue;
			}

			int credits;
			try {
				credits = Integer.parseInt(creditsText);
				if (credits <= 0) {
					errors.add(new ImportErrorItem(rowNumber, courseCode, "Số tín chỉ phải lớn hơn 0"));
					continue;
				}
			} catch (NumberFormatException exception) {
				errors.add(new ImportErrorItem(rowNumber, courseCode, "Số tín chỉ không hợp lệ: " + creditsText));
				continue;
			}

			if (!StringUtils.hasText(courseType)) {
				errors.add(new ImportErrorItem(rowNumber, courseCode, "Loại môn học không được để trống"));
				continue;
			}

			Course.CourseType parsedType;
			try {
				parsedType = Course.CourseType.fromValue(courseType);
			} catch (IllegalArgumentException exception) {
				errors.add(new ImportErrorItem(rowNumber, courseCode, "Loại môn học không hợp lệ: " + courseType + ". Chỉ chấp nhận: " + String.join(", ", COURSE_TYPE_VALUES)));
				continue;
			}

			if (courseRepository.existsByCourseCode(courseCode)) {
				duplicateCodes.add(courseCode);
				continue;
			}

			Course course = Course.builder()
					.courseCode(courseCode)
					.courseName(courseName)
					.credits(credits)
					.courseType(parsedType)
					.description(description)
					.isActive(true)
					.build();
			coursesToInsert.add(course);
		}

		if (!duplicateCodes.isEmpty()) {
			throw duplicateCoursesFound(duplicateCodes);
		}
		if (!errors.isEmpty()) {
			throw validationError("File Excel có dữ liệu không hợp lệ. Không có môn nào được thêm.", errors);
		}

		try {
			courseRepository.saveAll(coursesToInsert);
			return new CourseImportResultResponse(rows.size(), coursesToInsert.size(), 0, List.of());
		} catch (DataIntegrityViolationException exception) {
			log.error("Error importing courses: {}", exception.getMessage());
			throw new AppException(HttpStatus.CONFLICT, "Không thể import môn học do dữ liệu bị trùng hoặc vi phạm ràng buộc");
		}
	}

	CourseResponse toResponse(Course course) {
		return new CourseResponse(
				course.getCourseId(),
				course.getCourseCode(),
				course.getCourseName(),
				course.getCredits(),
				course.getCourseType() == null ? null : course.getCourseType().toDbValue(),
				course.getIsActive(),
				course.getDescription(),
				course.getCreatedAt(),
				course.getUpdatedAt()
		);
	}

	CourseSimpleResponse toSimpleResponse(Course course) {
		return new CourseSimpleResponse(
				course.getCourseId(),
				course.getCourseCode(),
				course.getCourseName(),
				course.getCredits()
		);
	}

	private Specification<Course> buildSpecification(String courseType,
			Boolean isActive, String keyword) {
		return (root, query, cb) -> {
			List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
			if (StringUtils.hasText(courseType)) {
				try {
					Course.CourseType type = Course.CourseType.fromValue(courseType);
					predicates.add(cb.equal(root.get("courseType"), type));
				} catch (IllegalArgumentException ignored) {
				}
			}
			if (isActive != null) {
				predicates.add(cb.equal(root.get("isActive"), isActive));
			}
			if (StringUtils.hasText(keyword)) {
				String like = "%" + keyword.toLowerCase(Locale.ROOT) + "%";
				predicates.add(cb.or(
						cb.like(cb.lower(root.get("courseCode")), like),
						cb.like(cb.lower(root.get("courseName")), like)
				));
			}
			return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
		};
	}

	private List<Map<String, String>> readExcel(MultipartFile file) {
		try (InputStream inputStream = file.getInputStream();
			 Workbook workbook = new XSSFWorkbook(inputStream)) {
			List<Map<String, String>> rows = new ArrayList<>();
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
				Map<String, Integer> candidate = resolveCourseHeaderIndex(row);
				List<String> missingHeaders = COURSE_IMPORT_FIELDS.stream()
						.filter(field -> !"description".equals(field))
						.filter(field -> !candidate.containsKey(field))
						.toList();
				if (missingHeaders.isEmpty()) {
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
				Map<String, String> values = new HashMap<>();
				values.put(ROW_NUMBER_FIELD, Integer.toString(i + 1));
				boolean allBlank = true;
				for (String field : COURSE_IMPORT_FIELDS) {
					Integer colIndex = headerIndex.get(field);
					String cellValue = colIndex == null ? null : getCellValue(row.getCell(colIndex));
					values.put(field, cellValue);
					if (StringUtils.hasText(cellValue)) {
						allBlank = false;
					}
				}
				if (allBlank) {
					continue;
				}
				rows.add(values);
			}
			return rows;
		} catch (IOException exception) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Không đọc được file Excel: " + exception.getMessage());
		}
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

	private Map<String, Integer> resolveCourseHeaderIndex(Row row) {
		Map<String, Integer> headerIndex = new HashMap<>();
		for (Cell cell : row) {
			String field = resolveCourseImportField(getCellValue(cell));
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

	private String resolveCourseImportField(String header) {
		String normalized = normalizeHeader(header);
		if (!StringUtils.hasText(normalized)) {
			return null;
		}
		return switch (normalized) {
			case "ma mon", "ma mon hoc", "mã môn", "mã môn học", "coursecode", "course_code", "course code" -> "courseCode";
			case "ten mon", "ten mon hoc", "tên môn", "tên môn học", "course name", "course_name", "coursename" -> "courseName";
			case "so tin chi", "số tín chỉ", "credits", "tin chi", "tín chỉ" -> "credits";
			case "loai", "loại", "loai mon", "loại môn", "loai mon hoc", "loại môn học", "course type", "course_type", "coursetype" -> "courseType";
			case "mo ta", "mô tả", "description" -> "description";
			default -> null;
		};
	}

	private String normalizeHeader(String value) {
		return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
	}

	private String normalizeCode(String value) {
		return normalize(value);
	}

	private StructuredApiException duplicateCourseCode(String courseCode) {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("error", "DUPLICATE_COURSE_CODE");
		body.put("message", "Mã môn học '" + courseCode + "' đã tồn tại trong hệ thống.");
		return new StructuredApiException(HttpStatus.CONFLICT, body);
	}

	private StructuredApiException duplicateCoursesFound(Set<String> duplicates) {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("error", "DUPLICATE_FOUND");
		body.put("message", "Phát hiện trùng mã môn học. Không có môn nào được thêm.");
		body.put("duplicates", new ArrayList<>(duplicates));
		return new StructuredApiException(HttpStatus.CONFLICT, body);
	}

	private StructuredApiException validationError(String message, List<ImportErrorItem> errors) {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("error", "VALIDATION_ERROR");
		body.put("message", message);
		body.put("errors", errors);
		return new StructuredApiException(HttpStatus.BAD_REQUEST, body);
	}

	private String normalize(String value) {
		return value == null ? null : value.trim();
	}
}
