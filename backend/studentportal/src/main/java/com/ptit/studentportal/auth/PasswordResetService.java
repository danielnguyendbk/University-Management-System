package com.ptit.studentportal.auth;

import com.ptit.studentportal.commom.exception.AppException;
import com.ptit.studentportal.user.User;
import com.ptit.studentportal.user.UserRepository;
import com.ptit.studentportal.util.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class PasswordResetService {

    private static final Duration OTP_RESEND_COOLDOWN = Duration.ofSeconds(60);
    private static final Duration OTP_EXPIRY = Duration.ofMinutes(10);
    private static final Duration RESET_TOKEN_EXPIRY = Duration.ofMinutes(15);

    private enum TokenPurpose {
        OTP,
        RESET
    }

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public PasswordResetService(
            PasswordResetTokenRepository passwordResetTokenRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    /**
     * Tạo OTP và gửi email
     */
    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, 
                    "Không tìm thấy người dùng với email: " + email));

        LocalDateTime now = LocalDateTime.now();
        passwordResetTokenRepository.deleteExpiredTokens(now);

        var recentOtpTokens = passwordResetTokenRepository.findOtpTokensByUserIdOrderByCreatedAtDesc(user.getUserId());
        if (!recentOtpTokens.isEmpty()) {
            PasswordResetToken latestOtp = recentOtpTokens.get(0);
            LocalDateTime nextAllowedRequestAt = latestOtp.getCreatedAt().plus(OTP_RESEND_COOLDOWN);
            if (now.isBefore(nextAllowedRequestAt)) {
                long waitSeconds = Duration.between(now, nextAllowedRequestAt).getSeconds();
                throw new AppException(HttpStatus.TOO_MANY_REQUESTS,
                        "Vui lòng chờ " + waitSeconds + " giây trước khi yêu cầu OTP mới");
            }
        }

        // Invalidate old tokens
        var oldTokens = passwordResetTokenRepository.findUnusedTokensByUserId(user.getUserId());
        oldTokens.forEach(token -> {
            token.setUsedAt(now);
            passwordResetTokenRepository.save(token);
        });

        // Generate OTP
        String otpCode = generateOtpCode();
        String tokenHash = buildScopedHash(TokenPurpose.OTP, otpCode);
        LocalDateTime expiresAt = now.plus(OTP_EXPIRY);

        PasswordResetToken resetToken = new PasswordResetToken(
                user.getUserId(),
                tokenHash,
                expiresAt
        );
        passwordResetTokenRepository.save(resetToken);

        // Send email
        try {
            emailService.sendPasswordResetOtpEmail(user.getEmail(), otpCode);
        } catch (MailException ex) {
            throw new AppException(HttpStatus.BAD_GATEWAY,
                    "Không gửi được OTP đặt lại mật khẩu. Hãy kiểm tra Sender Identity của SendGrid hoặc app.mail.from.");
        }
    }

    /**
     * Xác thực OTP và trả về reset token để đổi mật khẩu
     */
    @Transactional
    public String verifyOtpAndIssueResetToken(String email, String otpCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST,
                        "Email hoặc OTP không hợp lệ"));

        String otpHash = buildScopedHash(TokenPurpose.OTP, otpCode);
        PasswordResetToken otpToken = passwordResetTokenRepository.findByTokenHash(otpHash)
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST,
                        "Email hoặc OTP không hợp lệ"));

        if (!otpToken.getUserId().equals(user.getUserId()) || !otpToken.isValid()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "OTP đã hết hạn hoặc không hợp lệ");
        }

        otpToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(otpToken);

        String resetTokenPlain = generateSecureToken();
        PasswordResetToken resetToken = new PasswordResetToken(
                user.getUserId(),
                buildScopedHash(TokenPurpose.RESET, resetTokenPlain),
            LocalDateTime.now().plus(RESET_TOKEN_EXPIRY)
        );
        passwordResetTokenRepository.save(resetToken);

        return resetTokenPlain;
    }

    /**
     * Xác thực token và reset password
     */
    @Transactional
    public void resetPassword(String plainToken, String newPassword) {
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mật khẩu mới không được để trống");
        }

        String tokenHash = buildScopedHash(TokenPurpose.RESET, plainToken);
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, 
                    "Token không hợp lệ hoặc đã hết hạn"));

        // Check if token is valid
        if (!resetToken.isValid()) {
            throw new AppException(HttpStatus.BAD_REQUEST, 
                "Token đã hết hạn hoặc đã được sử dụng");
        }

        // Update password
        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, 
                    "Không tìm thấy người dùng"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);

        // Send confirmation email
        try {
            emailService.sendPasswordChangedConfirmationEmail(user.getEmail(), user.getUsername());
        } catch (MailException ex) {
            throw new AppException(HttpStatus.BAD_GATEWAY,
                    "Mật khẩu đã được đổi nhưng không gửi được email xác nhận. Hãy kiểm tra Sender Identity của SendGrid hoặc app.mail.from.");
        }
    }

    /**
     * Tạo token ngẫu nhiên URL-safe
     */
    private String generateSecureToken() {
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /**
     * Tạo OTP 6 chữ số
     */
    private String generateOtpCode() {
        int otp = new SecureRandom().nextInt(1_000_000);
        return String.format("%06d", otp);
    }

    private String buildScopedHash(TokenPurpose purpose, String plainToken) {
        return purpose.name() + ":" + hashToken(plainToken);
    }

    /**
     * Hash token sử dụng SHA-256
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
}
