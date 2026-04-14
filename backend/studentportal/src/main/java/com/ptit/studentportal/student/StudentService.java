package com.ptit.studentportal.student;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ptit.studentportal.user.User;
import com.ptit.studentportal.user.UserRepository;
import com.ptit.studentportal.user.UserRole;

@Service
@Transactional(readOnly = true)
public class StudentService {

	private final StudentRepository studentRepository;
	private final UserRepository userRepository;

	public StudentService(StudentRepository studentRepository, UserRepository userRepository) {
		this.studentRepository = studentRepository;
		this.userRepository = userRepository;
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
				.permanentAddress(request.permanentAddress())
				.currentAddress(request.currentAddress())
				.cohort(request.cohort())
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
				student.getPermanentAddress(),
				student.getCurrentAddress(),
				student.getCohort(),
				student.getAcademicStatus()
		);
	}
}
