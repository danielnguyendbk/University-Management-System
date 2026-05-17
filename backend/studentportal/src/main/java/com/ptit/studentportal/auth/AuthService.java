package com.ptit.studentportal.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final StudentRepository studentRepository;
	private final LecturerRepository lecturerRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public AuthService(UserRepository userRepository,
					   StudentRepository studentRepository,
					   LecturerRepository lecturerRepository,
					   PasswordEncoder passwordEncoder,
					   JwtService jwtService) {
		this.userRepository = userRepository;
		this.studentRepository = studentRepository;
		this.lecturerRepository = lecturerRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
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

		return new LoginResponse(token, user.getUsername(), user.getRole(), fullName, user.isForcePasswordChange());
	}

	@Transactional
	public CurrentUserResponse changePassword(CustomUserDetails userDetails, ChangePasswordRequest request) {
		User user = userDetails.getUser();
		if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
		}

		user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
		user.setForcePasswordChange(false);
		userRepository.save(user);

		return getCurrentUser(new CustomUserDetails(user));
	}

	public CurrentUserResponse getCurrentUser(CustomUserDetails userDetails) {
		User user = userDetails.getUser();
		String fullName = resolveFullName(user);

		return new CurrentUserResponse(
				user.getUserId(),
				user.getUsername(),
				user.getEmail(),
				user.getRole(),
				user.getStatus(),
				fullName,
				user.isForcePasswordChange()
		);
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
}
