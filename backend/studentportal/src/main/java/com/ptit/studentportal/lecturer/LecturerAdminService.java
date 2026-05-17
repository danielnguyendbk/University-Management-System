package com.ptit.studentportal.lecturer;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.ptit.studentportal.admin.common.ImportErrorItem;
import com.ptit.studentportal.commom.exception.AppException;
import com.ptit.studentportal.department.Department;
import com.ptit.studentportal.department.DepartmentRepository;
import com.ptit.studentportal.user.User;
import com.ptit.studentportal.user.UserRepository;
import com.ptit.studentportal.user.UserRole;
import com.ptit.studentportal.user.UserStatus;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
@Transactional(readOnly = true)
public class LecturerAdminService {

	private static final List<String> TEMPLATE_HEADERS = List.of(
			"lecturer_code",
			"full_name",
			"academic_title",
			"department_code",
			"phone"
	);

	private final LecturerRepository lecturerRepository;
	private final UserRepository userRepository;
	private final DepartmentRepository departmentRepository;
	private final PasswordEncoder passwordEncoder;
	private final TransactionTemplate transactionTemplate;

	@PersistenceContext
	private EntityManager entityManager;

	public LecturerAdminService(LecturerRepository lecturerRepository,
							   UserRepository userRepository,
						   DepartmentRepository departmentRepository,
						   PasswordEncoder passwordEncoder,
						   PlatformTransactionManager transactionManager) {
		this.lecturerRepository = lecturerRepository;
		this.userRepository = userRepository;
		this.departmentRepository = departmentRepository;
		this.passwordEncoder = passwordEncoder;
		this.transactionTemplate = new TransactionTemplate(transactionManager);
	}

	public org.springframework.data.domain.Page<com.ptit.studentportal.lecturer.Lecturer> listLecturers(Long departmentId, String academicTitle, String accountStatus, String search, org.springframework.data.domain.Pageable pageable) {
		org.springframework.data.jpa.domain.Specification<Lecturer> specification = (root, query, cb) -> {
			List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
			if (departmentId != null) {
				predicates.add(cb.equal(root.get("departmentId"), departmentId));
			}
			if (StringUtils.hasText(academicTitle)) {
				predicates.add(cb.like(cb.lower(root.get("academicTitle")), "%" + academicTitle.toLowerCase(Locale.ROOT) + "%"));
			}
			if (StringUtils.hasText(accountStatus)) {
				predicates.add(cb.equal(root.join("user").get("status"), UserStatus.fromValue(accountStatus)));
			}
			if (StringUtils.hasText(search)) {
				String like = "%" + search.toLowerCase(Locale.ROOT) + "%";
				predicates.add(cb.or(
						cb.like(cb.lower(root.get("lecturerCode")), like),
						cb.like(cb.lower(root.get("fullName")), like),
						cb.like(cb.lower(root.join("user").get("email")), like)
				));
			}
			return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
		};
		return lecturerRepository.findAll(specification, pageable);
	}

	public List<String> listAcademicTitles() {
		@SuppressWarnings("unchecked")
		List<String> titles = entityManager.createNativeQuery("""
			select distinct academic_title
			from lecturers
			where academic_title is not null and academic_title <> ''
			order by academic_title
			""").getResultList();
		return titles;
	}

	public LecturerAdminResponse mapResponse(Lecturer lecturer) {
		Department department = departmentRepository.findById(lecturer.getDepartmentId()).orElse(null);
		return new LecturerAdminResponse(
				lecturer.getLecturerId(),
				lecturer.getUser().getUserId(),
				lecturer.getLecturerCode(),
				lecturer.getFullName(),
				lecturer.getAcademicTitle(),
				department == null ? null : department.getDepartmentCode(),
				department == null ? null : department.getDepartmentName(),
				lecturer.getUser().getEmail(),
				lecturer.getUser().getStatus() == null ? null : lecturer.getUser().getStatus().name().toLowerCase(Locale.ROOT)
		);
	}

	public LecturerAdminDetailResponse getLecturer(Long lecturerId) {
		Lecturer lecturer = lecturerRepository.findById(lecturerId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Lecturer not found with id: " + lecturerId));
		return toDetailResponse(lecturer);
	}

	@Transactional
	public LecturerAdminDetailResponse createLecturer(LecturerCreateAdminRequest request) {
		validateUniqueLecturer(request.lecturerCode());
		Department department = departmentRepository.findById(request.departmentId())
				.orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Department not found with id: " + request.departmentId()));
		String username = request.lecturerCode().trim();
		String email = buildManagedEmail(username);
		String temporaryPassword = generateTemporaryPassword(username);
		User user = userRepository.save(User.builder()
				.username(username)
				.email(email)
				.passwordHash(passwordEncoder.encode(temporaryPassword))
				.forcePasswordChange(true)
				.role(UserRole.LECTURER)
				.status(UserStatus.ACTIVE)
				.build());

		Lecturer lecturer = lecturerRepository.save(Lecturer.builder()
				.user(user)
				.departmentId(department.getDepartmentId())
				.lecturerCode(request.lecturerCode())
				.fullName(request.fullName())
				.phone(request.phone())
				.academicTitle(request.academicTitle())
				.build());
		return toDetailResponse(lecturer);
	}

	@Transactional
	public LecturerAdminDetailResponse updateLecturer(Long lecturerId, LecturerUpdateRequest request) {
		Lecturer lecturer = lecturerRepository.findById(lecturerId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Lecturer not found with id: " + lecturerId));
		Department department = departmentRepository.findById(request.departmentId())
				.orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Department not found with id: " + request.departmentId()));
		lecturer.setFullName(request.fullName());
		lecturer.setAcademicTitle(request.academicTitle());
		lecturer.setDepartmentId(department.getDepartmentId());
		lecturer.setPhone(request.phone());
		return toDetailResponse(lecturerRepository.save(lecturer));
	}

	@Transactional
	public LecturerAdminDetailResponse updateAccountStatus(Long lecturerId, String status) {
		Lecturer lecturer = lecturerRepository.findById(lecturerId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Lecturer not found with id: " + lecturerId));
		UserStatus userStatus = UserStatus.fromValue(status);
		if (userStatus == null) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Invalid status: " + status);
		}
		lecturer.getUser().setStatus(userStatus);
		userRepository.save(lecturer.getUser());
		return toDetailResponse(lecturer);
	}

	@Transactional
	public String resetPassword(Long lecturerId, String newPassword) {
		Lecturer lecturer = lecturerRepository.findById(lecturerId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Lecturer not found with id: " + lecturerId));
		String password = StringUtils.hasText(newPassword) ? newPassword : generateTemporaryPassword(lecturer.getLecturerCode());
		lecturer.getUser().setPasswordHash(passwordEncoder.encode(password));
		lecturer.getUser().setForcePasswordChange(true);
		userRepository.save(lecturer.getUser());
		return password;
	}

	public void writeTemplate(OutputStream outputStream) throws IOException {
		try (Workbook workbook = new XSSFWorkbook()) {
			Sheet sheet = workbook.createSheet("lecturers");
			Row header = sheet.createRow(0);
			for (int i = 0; i < TEMPLATE_HEADERS.size(); i++) {
				header.createCell(i).setCellValue(TEMPLATE_HEADERS.get(i));
			}
			Row sample = sheet.createRow(1);
			sample.createCell(0).setCellValue("GV001");
			sample.createCell(1).setCellValue("Tran Thi B");
			sample.createCell(2).setCellValue("TS");
			sample.createCell(3).setCellValue("CNTT");
			sample.createCell(4).setCellValue("0911111111");
			workbook.write(outputStream);
		}
	}

	@Transactional(propagation = Propagation.NOT_SUPPORTED)
	public LecturerImportSummaryResponse importLecturers(MultipartFile file) {
		List<Map<String, String>> rows = readRows(file);
		List<ImportErrorItem> errors = new ArrayList<>();
		Set<String> seenCodes = new HashSet<>();
		List<Map<String, Object>> validated = new ArrayList<>();

		for (int index = 0; index < rows.size(); index++) {
			int rowNumber = index + 2;
			Map<String, String> row = rows.get(index);
			String lecturerCode = normalize(row.get("lecturer_code"));
			String fullName = normalize(row.get("full_name"));
			String academicTitle = normalize(row.get("academic_title"));
			String departmentCode = normalize(row.get("department_code"));
			String phone = normalize(row.get("phone"));

			if (!StringUtils.hasText(lecturerCode) || !StringUtils.hasText(fullName) || !StringUtils.hasText(departmentCode)) {
				errors.add(new ImportErrorItem(rowNumber, "required", "Missing required lecturer fields"));
				continue;
			}
			String username = lecturerCode.trim();
			String managedEmail = buildManagedEmail(username);
			if (!seenCodes.add(lecturerCode.toLowerCase(Locale.ROOT))) {
				errors.add(new ImportErrorItem(rowNumber, "lecturer_code", "Duplicate lecturer code in file"));
				continue;
			}
			if (lecturerRepository.existsByLecturerCode(lecturerCode)) {
				errors.add(new ImportErrorItem(rowNumber, "lecturer_code", "Lecturer code already exists"));
				continue;
			}
			if (userRepository.existsByUsername(username)) {
				errors.add(new ImportErrorItem(rowNumber, "lecturer_code", "Username already exists"));
				continue;
			}
			if (userRepository.existsByEmail(managedEmail)) {
				errors.add(new ImportErrorItem(rowNumber, "lecturer_code", "Generated email already exists"));
				continue;
			}
			Department department = departmentRepository.findByDepartmentCode(departmentCode)
					.orElse(null);
			if (department == null) {
				errors.add(new ImportErrorItem(rowNumber, "department_code", "Department code does not exist"));
				continue;
			}

			Map<String, Object> entry = new HashMap<>();
			entry.put("username", username);
			entry.put("managedEmail", managedEmail);
			entry.put("fullName", fullName);
			entry.put("academicTitle", academicTitle);
			entry.put("phone", phone);
			entry.put("department", department);
			entry.put("lecturerCode", lecturerCode);
			validated.add(entry);
		}

		if (!errors.isEmpty()) {
			return new LecturerImportSummaryResponse(0, errors.size(), errors);
		}

		int success = 0;
		for (Map<String, Object> entry : validated) {
			executeWithRetry(() -> transactionTemplate.execute(status -> {
				String username = (String) entry.get("username");
				String managedEmail = (String) entry.get("managedEmail");
				String fullName = (String) entry.get("fullName");
				String academicTitle = (String) entry.get("academicTitle");
				String phone = (String) entry.get("phone");
				Department department = (Department) entry.get("department");
				String lecturerCode = (String) entry.get("lecturerCode");

				User user = userRepository.save(User.builder()
						.username(username)
						.email(managedEmail)
						.passwordHash(passwordEncoder.encode(generateTemporaryPassword(username)))
						.forcePasswordChange(true)
						.role(UserRole.LECTURER)
						.status(UserStatus.ACTIVE)
						.build());
				lecturerRepository.save(Lecturer.builder()
						.user(user)
						.departmentId(department.getDepartmentId())
						.lecturerCode(lecturerCode)
						.fullName(fullName)
						.phone(phone)
						.academicTitle(academicTitle)
						.build());
				return null;
			}));
			success++;
		}

		return new LecturerImportSummaryResponse(success, 0, List.of());
	}

	public List<LecturerSectionResponse> loadSections(Long lecturerId) {
		List<?> rows = entityManager.createNativeQuery("""
			select cs.section_id, cs.section_code, c.course_code, c.course_name, s.semester_name, s.academic_year, cs.status
			from course_sections cs
			join courses c on cs.course_id = c.course_id
			join semesters s on cs.semester_id = s.semester_id
			where cs.lecturer_id = :lecturerId
			order by s.start_date desc, cs.section_code asc
			""")
				.setParameter("lecturerId", lecturerId)
				.getResultList();
		return rows.stream()
				.map(rowObject -> {
					Object[] row = (Object[]) rowObject;
					return new LecturerSectionResponse(
							((Number) row[0]).longValue(),
							(String) row[1],
							(String) row[2],
							(String) row[3],
							(String) row[4],
							(String) row[5],
							(String) row[6]
						);
				})
				.toList();
	}

	private LecturerAdminDetailResponse toDetailResponse(Lecturer lecturer) {
		Department department = departmentRepository.findById(lecturer.getDepartmentId()).orElse(null);
		return new LecturerAdminDetailResponse(
				lecturer.getLecturerId(),
				lecturer.getUser().getUserId(),
				lecturer.getLecturerCode(),
				lecturer.getFullName(),
				lecturer.getAcademicTitle(),
				department == null ? null : department.getDepartmentCode(),
				department == null ? null : department.getDepartmentName(),
				lecturer.getUser().getEmail(),
				lecturer.getPhone(),
				lecturer.getUser().getStatus() == null ? null : lecturer.getUser().getStatus().name().toLowerCase(Locale.ROOT),
				loadSections(lecturer.getLecturerId())
		);
	}

	private void validateUniqueLecturer(String lecturerCode) {
		if (lecturerRepository.existsByLecturerCode(lecturerCode)) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Lecturer code already exists: " + lecturerCode);
		}
		if (userRepository.existsByUsername(lecturerCode)) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Username already exists: " + lecturerCode);
		}
		String managedEmail = buildManagedEmail(lecturerCode);
		if (userRepository.existsByEmail(managedEmail)) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Generated email already exists for: " + lecturerCode);
		}
	}

	private List<Map<String, String>> readRows(MultipartFile file) {
		String filename = Optional.ofNullable(file.getOriginalFilename()).orElse("").toLowerCase(Locale.ROOT);
		try {
			if (filename.endsWith(".csv")) {
				return readCsv(file.getInputStream());
			}
			return readExcel(file.getInputStream());
		} catch (IOException exception) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Unable to read upload file: " + exception.getMessage());
		}
	}

	private List<Map<String, String>> readCsv(InputStream inputStream) throws IOException {
		try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
			 CSVParser parser = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build().parse(reader)) {
			List<Map<String, String>> rows = new ArrayList<>();
			for (CSVRecord record : parser) {
				if (isEndMarkerRow(record)) {
					break;
				}
				Map<String, String> row = new HashMap<>();
				for (String header : TEMPLATE_HEADERS) {
					row.put(header, record.isMapped(header) ? record.get(header) : null);
				}
				if (!isBlankImportRow(row)) {
					rows.add(row);
				}
			}
			return rows;
		}
	}

	private List<Map<String, String>> readExcel(InputStream inputStream) throws IOException {
		try (Workbook workbook = new XSSFWorkbook(inputStream)) {
			List<Map<String, String>> rows = new ArrayList<>();
			int sheets = workbook.getNumberOfSheets();
			for (int s = 0; s < sheets; s++) {
				Sheet sheet = workbook.getSheetAt(s);
				Row headerRow = sheet.getRow(0);
				if (headerRow == null) {
					continue;
				}
				Map<String, Integer> headerIndex = new HashMap<>();
				for (Cell cell : headerRow) {
					headerIndex.put(cell.getStringCellValue().trim().toLowerCase(Locale.ROOT), cell.getColumnIndex());
				}
				for (int i = 1; i <= sheet.getLastRowNum(); i++) {
					Row row = sheet.getRow(i);
					if (row == null) {
						continue;
					}
					if (isEndMarkerRow(row)) {
						break;
					}
					Map<String, String> values = new HashMap<>();
					for (String header : TEMPLATE_HEADERS) {
						Integer columnIndex = headerIndex.get(header);
						values.put(header, columnIndex == null ? null : getCellValue(row.getCell(columnIndex)));
					}
					if (isBlankImportRow(values)) {
						continue;
					}
					// do not infer department_code from sheet name; require explicit column
					// leave values as-is
					rows.add(values);
				}
			}
			return rows;
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

	private String generateTemporaryPassword(String lecturerCode) {
		return lecturerCode.toLowerCase(Locale.ROOT);
	}

	private String buildManagedEmail(String username) {
		return "tcpeduvn+" + username + "@gmail.com";
	}

	private String normalize(String value) {
		return value == null ? null : value.trim();
	}

	private boolean isBlankImportRow(Map<String, String> row) {
		for (String header : TEMPLATE_HEADERS) {
			if (StringUtils.hasText(normalize(row.get(header)))) {
				return false;
			}
		}
		return true;
	}

	private boolean isEndMarkerRow(CSVRecord record) {
		for (int i = 0; i < record.size(); i++) {
			String value = normalize(record.get(i));
			if ("END".equalsIgnoreCase(value)) {
				return true;
			}
		}
		return false;
	}

	private boolean isEndMarkerRow(Row row) {
		for (Cell cell : row) {
			String value = normalize(getCellValue(cell));
			if ("END".equalsIgnoreCase(value)) {
				return true;
			}
		}
		return false;
	}

	private void executeWithRetry(Runnable action) {
		int attempts = 0;
		while (true) {
			try {
				action.run();
				return;
			} catch (org.springframework.dao.PessimisticLockingFailureException exception) {
				attempts++;
				if (attempts >= 3) {
					throw new AppException(HttpStatus.CONFLICT, "Database is busy while importing lecturers. Please try again.");
				}
			}
		}
	}
}