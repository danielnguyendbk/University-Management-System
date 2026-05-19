package com.ptit.studentportal.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ptit.studentportal.commom.exception.AppException;
import com.ptit.studentportal.lecturer.Lecturer;
import com.ptit.studentportal.lecturer.LecturerRepository;
import com.ptit.studentportal.security.CustomUserDetails;
import com.ptit.studentportal.security.JwtService;
import com.ptit.studentportal.student.Student;
import com.ptit.studentportal.student.StudentRepository;
import com.ptit.studentportal.user.User;
import com.ptit.studentportal.user.UserRepository;
import com.ptit.studentportal.user.UserRole;
import com.ptit.studentportal.user.UserStatus;
import com.ptit.studentportal.util.EmailService;
import com.ptit.studentportal.auth.StudentProfile;
import com.ptit.studentportal.auth.LecturerProfile;
import org.springframework.mail.MailException;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final StudentRepository studentRepository;
	private final LecturerRepository lecturerRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final EmailService emailService;

	public AuthService(UserRepository userRepository,
					   StudentRepository studentRepository,
					   LecturerRepository lecturerRepository,
					   PasswordEncoder passwordEncoder,
					   JwtService jwtService,
					   EmailService emailService) {
		this.userRepository = userRepository;
		this.studentRepository = studentRepository;
		this.lecturerRepository = lecturerRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		this.emailService = emailService;
	}

	public LoginResponse login(LoginRequest request) {
		User user = userRepository.findByUsername(request.username())
				.orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));

		if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
			throw new AppException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
		}

		if (user.getStatus() != UserStatus.ACTIVE) {
			throw new AppException(HttpStatus.FORBIDDEN, "Account is not active");
		}

		String token = jwtService.generateToken(new CustomUserDetails(user));
		String fullName = resolveFullName(user);
		Long studentId = resolveStudentId(user);
		Long lecturerId = resolveLecturerId(user);

		return new LoginResponse(token, user.getUsername(), user.getRole(), fullName, studentId, lecturerId);
	}

	public CurrentUserResponse getCurrentUser(CustomUserDetails userDetails) {
		User user = userDetails.getUser();
		String fullName = resolveFullName(user);

		// build student profile if present
		var studentOpt = studentRepository.findByUser_UserId(user.getUserId());
		StudentProfile studentProfile = studentOpt.map(s -> new StudentProfile(
			s.getStudentId(),
			s.getStudentCode(),
			s.getFullName(),
			s.getDateOfBirth(),
			s.getGender() != null ? s.getGender().name() : null,
			s.getPhone(),
			s.getPermanentAddress(),
			s.getCurrentAddress(),
			s.getEnrollmentYear(),
			s.getAcademicStatus() != null ? s.getAcademicStatus().name() : null
		)).orElse(null);

		var lecturerOpt = lecturerRepository.findByUser_UserId(user.getUserId());
		LecturerProfile lecturerProfile = lecturerOpt.map(l -> new LecturerProfile(
			l.getLecturerId(),
			l.getLecturerCode(),
			l.getFullName(),
			l.getWorkEmail(),
			l.getPhone(),
			l.getAcademicTitle(),
			l.getDepartmentId()
		)).orElse(null);

		return new CurrentUserResponse(
			user.getUserId(),
			user.getUsername(),
			user.getEmail(),
			user.getRole(),
			user.getStatus(),
			fullName,
			resolveStudentId(user),
			resolveLecturerId(user),
			studentProfile,
			lecturerProfile
		);
	}

	public void changePassword(CustomUserDetails userDetails, ChangePasswordRequest request) {
		User user = userDetails.getUser();

		if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không chính xác");
		}

		if (!request.passwordsMatch()) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Mật khẩu xác nhận không khớp");
		}

		user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
		userRepository.save(user);

		try {
			emailService.sendPasswordChangedConfirmationEmail(user.getEmail(), resolveFullName(user));
		} catch (MailException ex) {
			// log and continue - password changed successfully
		}
	}

	private String resolveFullName(User user) {
		if (user.getRole() == UserRole.STUDENT) {
			return studentRepository.findByUser_UserId(user.getUserId())
					.map(Student::getFullName)
					.orElse(user.getUsername());
		}

		if (user.getRole() == UserRole.LECTURER) {
			return lecturerRepository.findByUser_UserId(user.getUserId())
					.map(Lecturer::getFullName)
					.orElse(user.getUsername());
		}

		return user.getUsername();
	}

	private Long resolveStudentId(User user) {
		if (user.getRole() != UserRole.STUDENT) {
			return null;
		}

		return studentRepository.findByUser_UserId(user.getUserId())
				.map(Student::getStudentId)
				.orElse(null);
	}

	private Long resolveLecturerId(User user) {
		if (user.getRole() != UserRole.LECTURER) {
			return null;
		}

		return lecturerRepository.findByUser_UserId(user.getUserId())
				.map(Lecturer::getLecturerId)
				.orElse(null);
	}
}
