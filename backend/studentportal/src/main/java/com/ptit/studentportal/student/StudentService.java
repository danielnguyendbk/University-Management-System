package com.ptit.studentportal.student;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ptit.studentportal.commom.exception.AppException;
import com.ptit.studentportal.course.ProgramCourseResponse;
import com.ptit.studentportal.course.ProgramCourseService;
import com.ptit.studentportal.program.Program;
import com.ptit.studentportal.program.ProgramRepository;
import com.ptit.studentportal.security.CustomUserDetails;
import com.ptit.studentportal.user.User;
import com.ptit.studentportal.user.UserRepository;
import com.ptit.studentportal.user.UserRole;

@Service
@Transactional(readOnly = true)
public class StudentService {

	private final StudentRepository studentRepository;
	private final UserRepository userRepository;
	private final ProgramRepository programRepository;
	private final ProgramCourseService programCourseService;

	public StudentService(StudentRepository studentRepository,
						  UserRepository userRepository,
						  ProgramRepository programRepository,
						  ProgramCourseService programCourseService) {
		this.studentRepository = studentRepository;
		this.userRepository = userRepository;
		this.programRepository = programRepository;
		this.programCourseService = programCourseService;
	}

	public List<StudentDTO> getAllStudents() {
		return studentRepository.findAll().stream()
				.map(this::toDTO)
				.toList();
	}

	public StudentDTO getStudentById(Long studentId) {
		Student student = studentRepository.findById(studentId)
				.orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));
		return toDTO(student);
	}

	public StudentDTO getStudentByCode(String studentCode) {
		Student student = studentRepository.findByStudentCode(studentCode)
				.orElseThrow(() -> new IllegalArgumentException("Student not found with code: " + studentCode));
		return toDTO(student);
	}

	public StudentCurriculumResponse getCurrentStudentCurriculum(CustomUserDetails userDetails) {
		if (userDetails == null || userDetails.getUser() == null) {
			throw new AppException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để xem chương trình đào tạo");
		}

		User user = userDetails.getUser();
		if (user.getRole() != UserRole.STUDENT) {
			throw new AppException(HttpStatus.FORBIDDEN, "Chỉ sinh viên mới được xem chương trình đào tạo cá nhân");
		}

		Student student = studentRepository.findByUser_UserId(user.getUserId())
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ sinh viên cho tài khoản hiện tại"));
		Program program = programRepository.findById(student.getProgramId())
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy ngành học của sinh viên"));
		List<ProgramCourseResponse> courses = programCourseService.getCoursesByProgram(program.getProgramId());
		Map<Long, BigDecimal> bestScoresByCourseId = studentRepository.findBestCourseScoresByStudentId(student.getStudentId()).stream()
				.collect(Collectors.toMap(
						StudentRepository.StudentCourseScoreProjection::getCourseId,
						StudentRepository.StudentCourseScoreProjection::getBestTotalScore
				));
		List<StudentCurriculumCourseResponse> curriculumCourses = courses.stream()
				.map(course -> {
					BigDecimal bestTotalScore = bestScoresByCourseId.get(course.courseId());
					boolean completed = bestTotalScore != null && bestTotalScore.compareTo(BigDecimal.valueOf(4)) >= 0;
					return new StudentCurriculumCourseResponse(
							course.programCourseId(),
							course.programId(),
							course.programName(),
							course.courseId(),
							course.courseCode(),
							course.courseName(),
							course.credits(),
							course.courseType(),
							course.recommendedSemester(),
							course.isRequired(),
							completed,
							bestTotalScore
					);
				})
				.toList();
		int assignedCredits = courses.stream().mapToInt(ProgramCourseResponse::credits).sum();
		int achievedCredits = curriculumCourses.stream()
				.filter(StudentCurriculumCourseResponse::completed)
				.mapToInt(StudentCurriculumCourseResponse::credits)
				.sum();

		return new StudentCurriculumResponse(
				student.getStudentId(),
				student.getStudentCode(),
				student.getFullName(),
				program.getProgramId(),
				program.getProgramCode(),
				program.getProgramName(),
				program.getTotalCredits(),
				assignedCredits,
				achievedCredits,
				curriculumCourses
		);
	}

	@Transactional
	public StudentDTO createStudent(StudentCreateRequest request) {
		if (studentRepository.existsByStudentCode(request.studentCode())) {
			throw new IllegalArgumentException("Student code already exists: " + request.studentCode());
		}

		User user = userRepository.findById(request.userId())
				.orElseThrow(() -> new IllegalArgumentException("User not found with id: " + request.userId()));

		if (user.getRole() != UserRole.STUDENT) {
			throw new IllegalArgumentException("User role must be STUDENT");
		}

		studentRepository.findByUser_UserId(request.userId())
				.ifPresent(existing -> {
					throw new IllegalArgumentException("Student already linked to user id: " + request.userId());
				});

		Student student = Student.builder()
				.user(user)
				.programId(request.programId())
				.studentCode(request.studentCode())
				.fullName(request.fullName())
				.dateOfBirth(request.dateOfBirth())
				.gender(request.gender())
				.phone(request.phone())
				.address(request.address())
				.enrollmentYear(request.enrollmentYear())
				.academicStatus(request.academicStatus())
				.build();

		Student saved = studentRepository.save(student);
		return toDTO(saved);
	}

	private StudentDTO toDTO(Student student) {
		return new StudentDTO(
				student.getStudentId(),
				student.getUser().getUserId(),
				student.getUser().getUsername(),
				student.getUser().getEmail(),
				student.getUser().getRole(),
				student.getUser().getStatus(),
				student.getProgramId(),
				student.getStudentCode(),
				student.getFullName(),
				student.getDateOfBirth(),
				student.getGender(),
				student.getPhone(),
				student.getAddress(),
				student.getEnrollmentYear(),
				student.getAcademicStatus()
		);
	}
}
