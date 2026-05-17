package com.ptit.studentportal.student;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
import com.ptit.studentportal.commom.response.PageResponse;
import com.ptit.studentportal.department.Department;
import com.ptit.studentportal.department.DepartmentRepository;
import com.ptit.studentportal.program.Program;
import com.ptit.studentportal.program.ProgramRepository;
import com.ptit.studentportal.user.User;
import com.ptit.studentportal.user.UserRepository;
import com.ptit.studentportal.user.UserRole;
import com.ptit.studentportal.user.UserStatus;

import jakarta.persistence.criteria.Join;

@Service
@Transactional(readOnly = true)
public class StudentAdminService {

	private static final List<String> TEMPLATE_HEADERS = List.of(
			"student_code",
			"full_name",
			"date_of_birth",
			"gender",
			"phone",
			"address",
			"program_code"
	);

	private final StudentRepository studentRepository;
	private final StudentStatusHistoryRepository studentStatusHistoryRepository;
	private final UserRepository userRepository;
	private final ProgramRepository programRepository;
	private final DepartmentRepository departmentRepository;
	private final TransactionTemplate transactionTemplate;
	private final PasswordEncoder passwordEncoder;

	public StudentAdminService(StudentRepository studentRepository,
							   StudentStatusHistoryRepository studentStatusHistoryRepository,
							   UserRepository userRepository,
						   ProgramRepository programRepository,
						   DepartmentRepository departmentRepository,
						   PasswordEncoder passwordEncoder,
						   PlatformTransactionManager transactionManager) {
		this.studentRepository = studentRepository;
		this.studentStatusHistoryRepository = studentStatusHistoryRepository;
		this.userRepository = userRepository;
		this.programRepository = programRepository;
		this.departmentRepository = departmentRepository;
		this.passwordEncoder = passwordEncoder;
		this.transactionTemplate = new TransactionTemplate(transactionManager);
	}

	public PageResponse<StudentAdminResponse> listStudents(Long departmentId, Long programId,
			String cohort, String academicStatus, String search, Pageable pageable) {
		Specification<Student> specification = buildSpecification(departmentId, programId, cohort, academicStatus, search);
		Page<Student> page = studentRepository.findAll(specification, pageable);
		return new PageResponse<>(
				page.getContent().stream().map(this::toResponse).toList(),
				page.getTotalElements(),
				page.getTotalPages(),
				page.getNumber(),
				page.getSize()
		);
	}

	public List<String> listAvailableCohorts(Long departmentId, Long programId, String academicStatus, String search) {
		Specification<Student> specification = buildSpecification(departmentId, programId, null, academicStatus, search);
		return studentRepository.findAll(specification).stream()
				.map(Student::getStudentCode)
				.map(this::extractCohortPrefix)
				.filter(StringUtils::hasText)
				.distinct()
				.sorted(Comparator.comparingInt(this::cohortSortKey))
				.toList();
	}

	public StudentDetailResponse getStudent(Long studentId) {
		Student student = studentRepository.findById(studentId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Student not found with id: " + studentId));
		return toDetailResponse(student);
	}

	@Transactional
	public StudentDetailResponse updateStudent(Long studentId, StudentUpdateRequest request) {
		Student student = studentRepository.findById(studentId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Student not found with id: " + studentId));

		Program program = programRepository.findById(request.programId())
				.orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Program not found with id: " + request.programId()));

		student.setFullName(request.fullName());
		student.setDateOfBirth(request.dateOfBirth());
		student.setGender(Student.Gender.fromValue(request.gender()));
		student.setPhone(request.phone());
		student.setAddress(request.address());
		student.setProgramId(program.getProgramId());

		return toDetailResponse(studentRepository.save(student));
	}

	@Transactional
	public StudentDetailResponse updateStudentStatus(Long studentId, String academicStatusValue) {
		Student student = studentRepository.findById(studentId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Student not found with id: " + studentId));

		Student.AcademicStatus newStatus = Student.AcademicStatus.fromValue(academicStatusValue);
		if (newStatus == null) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Invalid academic status: " + academicStatusValue);
		}

		Student.AcademicStatus oldStatus = student.getAcademicStatus();
		student.setAcademicStatus(newStatus);
		studentRepository.save(student);

		User user = student.getUser();
		user.setStatus(isInactiveStatus(newStatus) ? UserStatus.INACTIVE : UserStatus.ACTIVE);
		userRepository.save(user);

		studentStatusHistoryRepository.save(StudentStatusHistory.builder()
				.studentId(student.getStudentId())
				.oldStatus(oldStatus == null ? null : oldStatus.name())
				.newStatus(newStatus.name())
				.changedByUserId(resolveCurrentUserId())
				.note("Status updated via admin module")
				.build());

		return toDetailResponse(student);
	}

	@Transactional
	public int batchUpdateStatus(List<Long> studentIds, String academicStatusValue) {
		int count = 0;
		for (Long studentId : studentIds) {
			updateStudentStatus(studentId, academicStatusValue);
			count++;
		}
		return count;
	}

	public void writeTemplate(OutputStream outputStream) throws IOException {
		try (Workbook workbook = new XSSFWorkbook()) {
			Sheet sheet = workbook.createSheet("students");
			Row header = sheet.createRow(0);
			for (int i = 0; i < TEMPLATE_HEADERS.size(); i++) {
				header.createCell(i).setCellValue(TEMPLATE_HEADERS.get(i));
			}
			Row sample = sheet.createRow(1);
			sample.createCell(0).setCellValue("SV2023001");
			sample.createCell(1).setCellValue("Nguyen Van A");
			sample.createCell(2).setCellValue("2005-01-01");
			sample.createCell(3).setCellValue("male");
			sample.createCell(4).setCellValue("0900000000");
			sample.createCell(5).setCellValue("Ha Noi");
			sample.createCell(6).setCellValue("CNTT");
			workbook.write(outputStream);
		}
	}

	@Transactional(propagation = Propagation.NOT_SUPPORTED)
	public StudentImportSummaryResponse importStudents(MultipartFile file) {
		List<Map<String, String>> rows = readRows(file);
		List<ImportErrorItem> errors = new ArrayList<>();
		Set<String> seenStudentCodes = new HashSet<>();
		List<Map<String, Object>> validated = new ArrayList<>();

		for (int index = 0; index < rows.size(); index++) {
			int rowNumber = index + 2;
			Map<String, String> row = rows.get(index);
			String studentCode = normalize(row.get("student_code"));
			String fullName = normalize(row.get("full_name"));
			String dateOfBirthText = normalize(row.get("date_of_birth"));
			String genderText = normalize(row.get("gender"));
			String phone = normalize(row.get("phone"));
			String address = normalize(row.get("address"));
			String programCode = normalize(row.get("program_code"));

			if (!StringUtils.hasText(studentCode)) {
				errors.add(new ImportErrorItem(rowNumber, "student_code", "Student code is required"));
				continue;
			}
			if (!StringUtils.hasText(fullName)) {
				errors.add(new ImportErrorItem(rowNumber, "full_name", "Full name is required"));
				continue;
			}
			if (!StringUtils.hasText(dateOfBirthText)) {
				errors.add(new ImportErrorItem(rowNumber, "date_of_birth", "Date of birth is required"));
				continue;
			}
			if (!StringUtils.hasText(programCode)) {
				errors.add(new ImportErrorItem(rowNumber, "program_code", "Program code is required"));
				continue;
			}
			String username = studentCode.trim();
			String managedEmail = buildManagedEmail(username);

			if (!seenStudentCodes.add(studentCode.toLowerCase(Locale.ROOT))) {
				errors.add(new ImportErrorItem(rowNumber, "student_code", "Duplicate student code in file"));
				continue;
			}
			if (studentRepository.existsByStudentCode(studentCode)) {
				errors.add(new ImportErrorItem(rowNumber, "student_code", "Student code already exists"));
				continue;
			}
			if (userRepository.existsByUsername(username)) {
				errors.add(new ImportErrorItem(rowNumber, "student_code", "Username already exists"));
				continue;
			}
			if (userRepository.existsByEmail(managedEmail)) {
				errors.add(new ImportErrorItem(rowNumber, "student_code", "Generated email already exists"));
				continue;
			}

			Optional<Program> maybeProgram = programRepository.findByProgramCode(programCode);
			if (maybeProgram.isEmpty()) {
				errors.add(new ImportErrorItem(rowNumber, "program_code", "Program code does not exist"));
				continue;
			}

			LocalDate dob;
			try {
				dob = LocalDate.parse(dateOfBirthText, DateTimeFormatter.ISO_LOCAL_DATE);
			} catch (DateTimeParseException exception) {
				errors.add(new ImportErrorItem(rowNumber, "date_of_birth", "Invalid date format, expected yyyy-MM-dd"));
				continue;
			}

			Map<String, Object> entry = new HashMap<>();
			entry.put("username", username);
			entry.put("managedEmail", managedEmail);
			entry.put("dob", dob);
			entry.put("fullName", fullName);
			entry.put("genderText", genderText);
			entry.put("phone", phone);
			entry.put("address", address);
			entry.put("program", maybeProgram.get());
			entry.put("studentCode", studentCode);
			validated.add(entry);
		}

		if (!errors.isEmpty()) {
			return new StudentImportSummaryResponse(0, errors.size(), errors);
		}

		int success = 0;
		for (Map<String, Object> entry : validated) {
			executeWithRetry(() -> transactionTemplate.execute(status -> {
				String username = (String) entry.get("username");
				String managedEmail = (String) entry.get("managedEmail");
				LocalDate dob = (LocalDate) entry.get("dob");
				String fullName = (String) entry.get("fullName");
				String genderText = (String) entry.get("genderText");
				String phone = (String) entry.get("phone");
				String address = (String) entry.get("address");
				Program program = (Program) entry.get("program");
				String studentCode = (String) entry.get("studentCode");

				User user = User.builder()
						.username(username)
						.email(managedEmail)
						.passwordHash(passwordEncoder.encode(generateTemporaryPassword(username)))
						.forcePasswordChange(true)
						.role(UserRole.STUDENT)
						.status(UserStatus.ACTIVE)
						.build();
				user = userRepository.save(user);

				Student student = Student.builder()
						.user(user)
						.programId(program.getProgramId())
						.studentCode(studentCode)
						.fullName(fullName)
						.dateOfBirth(dob)
						.gender(Student.Gender.fromValue(genderText))
						.phone(phone)
						.address(address)
						.academicStatus(Student.AcademicStatus.STUDYING)
						.build();
				studentRepository.save(student);
				return null;
			}));
			success++;
		}

		return new StudentImportSummaryResponse(success, 0, List.of());
	}

	private Specification<Student> buildSpecification(Long departmentId, Long programId,
			String cohort, String academicStatus, String search) {
		return (root, query, cb) -> {
			List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
			if (programId != null) {
				predicates.add(cb.equal(root.get("programId"), programId));
			}
			String normalizedCohort = normalizeCohortPrefix(cohort);
			if (StringUtils.hasText(normalizedCohort)) {
				predicates.add(cb.like(cb.lower(root.get("studentCode")), normalizedCohort.toLowerCase(Locale.ROOT) + "%"));
			}
			if (departmentId != null) {
				List<Long> programIds = programRepository.findByDepartmentId(departmentId).stream().map(Program::getProgramId).toList();
				if (programIds.isEmpty()) {
					predicates.add(cb.disjunction());
				} else {
					predicates.add(root.get("programId").in(programIds));
				}
			}
			if (StringUtils.hasText(academicStatus)) {
				predicates.add(cb.equal(root.get("academicStatus"), Student.AcademicStatus.fromValue(academicStatus)));
			}
			if (StringUtils.hasText(search)) {
				String like = "%" + search.toLowerCase(Locale.ROOT) + "%";
				Join<Student, User> userJoin = root.join("user");
				predicates.add(cb.or(
						cb.like(cb.lower(root.get("studentCode")), like),
						cb.like(cb.lower(root.get("fullName")), like),
						cb.like(cb.lower(userJoin.get("email")), like),
						cb.like(cb.lower(userJoin.get("username")), like)
				));
			}
			return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
		};
	}

	private String extractCohortPrefix(String studentCode) {
		if (!StringUtils.hasText(studentCode)) {
			return null;
		}
		String trimmed = studentCode.trim().toUpperCase(Locale.ROOT);
		return trimmed.length() >= 3 ? trimmed.substring(0, 3) : null;
	}

	private String normalizeCohortPrefix(String cohort) {
		if (!StringUtils.hasText(cohort)) {
			return null;
		}
		String trimmed = cohort.trim().toUpperCase(Locale.ROOT);
		if (trimmed.matches("^D\\d{2}$")) {
			return trimmed;
		}
		if (trimmed.matches("^\\d{4}$")) {
			return "D" + trimmed.substring(2);
		}
		return trimmed;
	}

	private int cohortSortKey(String cohortPrefix) {
		if (!StringUtils.hasText(cohortPrefix) || cohortPrefix.length() < 3) {
			return Integer.MAX_VALUE;
		}
		try {
			return 2000 + Integer.parseInt(cohortPrefix.substring(1, 3));
		} catch (NumberFormatException exception) {
			return Integer.MAX_VALUE;
		}
	}

	private StudentAdminResponse toResponse(Student student) {
		Program program = student.getProgramId() == null ? null : programRepository.findById(student.getProgramId()).orElse(null);
		Department department = program == null ? null : departmentRepository.findById(program.getDepartmentId()).orElse(null);
		return new StudentAdminResponse(
				student.getStudentId(),
				student.getUser().getUserId(),
				student.getStudentCode(),
				student.getFullName(),
				student.getUser().getEmail(),
				student.getPhone(),
				student.getAddress(),
				student.getAcademicStatus() == null ? null : student.getAcademicStatus().name().toLowerCase(Locale.ROOT),
				student.getUser().getStatus() == null ? null : student.getUser().getStatus().name().toLowerCase(Locale.ROOT),
				student.getProgramId(),
				program == null ? null : program.getProgramCode(),
				program == null ? null : program.getProgramName(),
				department == null ? null : department.getDepartmentId(),
				department == null ? null : department.getDepartmentCode(),
				department == null ? null : department.getDepartmentName()
		);
	}

	private StudentDetailResponse toDetailResponse(Student student) {
		Program program = student.getProgramId() == null ? null : programRepository.findById(student.getProgramId()).orElse(null);
		Department department = program == null ? null : departmentRepository.findById(program.getDepartmentId()).orElse(null);
		List<StudentStatusHistoryResponse> histories = studentStatusHistoryRepository.findByStudentIdOrderByChangedAtDesc(student.getStudentId()).stream()
				.map(item -> new StudentStatusHistoryResponse(item.getHistoryId(), item.getOldStatus(), item.getNewStatus(), item.getChangedByUserId(), item.getNote(), item.getChangedAt()))
				.toList();
		return new StudentDetailResponse(
				student.getStudentId(),
				student.getUser().getUserId(),
				student.getStudentCode(),
				student.getFullName(),
				student.getUser().getEmail(),
				student.getUser().getUsername(),
				student.getPhone(),
				student.getAddress(),
				student.getDateOfBirth(),
				student.getGender() == null ? null : student.getGender().name().toLowerCase(Locale.ROOT),
				student.getAcademicStatus() == null ? null : student.getAcademicStatus().name().toLowerCase(Locale.ROOT),
				student.getUser().getStatus() == null ? null : student.getUser().getStatus().name().toLowerCase(Locale.ROOT),
				student.getProgramId(),
				program == null ? null : program.getProgramCode(),
				program == null ? null : program.getProgramName(),
				department == null ? null : department.getDepartmentId(),
				department == null ? null : department.getDepartmentCode(),
				department == null ? null : department.getDepartmentName(),
				histories
		);
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
					// do not infer program_code from sheet name; require explicit column
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

	private boolean isInactiveStatus(Student.AcademicStatus status) {
		return status == Student.AcademicStatus.DROPPED_OUT || status == Student.AcademicStatus.GRADUATED;
	}

	private String generateTemporaryPassword(String username) {
		return username.toLowerCase(Locale.ROOT);
	}

	private String buildManagedEmail(String username) {
		return "tcpeduvn+" + username + "@gmail.com";
	}

	private Long resolveCurrentUserId() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !StringUtils.hasText(authentication.getName())) {
			return null;
		}
		return userRepository.findByUsername(authentication.getName()).map(User::getUserId).orElse(null);
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
					throw new AppException(HttpStatus.CONFLICT, "Database is busy while importing students. Please try again.");
				}
			}
		}
	}
}