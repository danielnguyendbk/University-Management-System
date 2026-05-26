package com.ptit.studentportal.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.security.CustomUserDetails;


import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;
	private final PasswordResetService passwordResetService;

	public AuthController(AuthService authService, PasswordResetService passwordResetService) {
		this.authService = authService;
		this.passwordResetService = passwordResetService;
	}

	@PostMapping("/login")
	public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
		LoginResponse response = authService.login(request);
		return ResponseEntity.ok(ApiResponse.success("Login successful", response));
	}

	@PostMapping("/change-password")
	public ResponseEntity<ApiResponse<CurrentUserResponse>> changePassword(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@Valid @RequestBody ChangePasswordRequest request) {
		CurrentUserResponse response = authService.changePassword(userDetails, request);
		return ResponseEntity.ok(ApiResponse.success("Mật khẩu đã được đổi thành công", response));
	}

	@GetMapping("/me")
	public ResponseEntity<ApiResponse<CurrentUserResponse>> me(@AuthenticationPrincipal CustomUserDetails userDetails) {
		CurrentUserResponse response = authService.getCurrentUser(userDetails);
		return ResponseEntity.ok(ApiResponse.success("Current user loaded", response));
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
		passwordResetService.requestPasswordReset(request.getEmail());
		return ResponseEntity.ok(ApiResponse.success("OTP đặt lại mật khẩu đã được gửi", 
			"Vui lòng kiểm tra hộp thư của bạn để lấy mã OTP"));
	}

	@PostMapping("/forgot-password/verify-otp")
	public ResponseEntity<ApiResponse<String>> verifyForgotPasswordOtp(@Valid @RequestBody VerifyOtpRequest request) {
		String resetToken = passwordResetService.verifyOtpAndIssueResetToken(request.getEmail(), request.getOtp());
		return ResponseEntity.ok(ApiResponse.success("Xác thực OTP thành công", resetToken));
	}

	@PostMapping("/reset-password")
	public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
		if (!request.passwordsMatch()) {
			return ResponseEntity.badRequest()
				.body(ApiResponse.error("Mật khẩu xác nhận không khớp"));
		}
		
		passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
		return ResponseEntity.ok(ApiResponse.success("Mật khẩu đã được đặt lại thành công", 
			"Bạn có thể đăng nhập bằng mật khẩu mới"));
	}

	
}
