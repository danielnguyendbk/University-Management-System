package com.ptit.studentportal.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@universityportal.edu.vn}")
    private String fromEmail;

    @Value("${app.mail.mode:smtp}")
    private String mailMode;

    @Value("${app.frontend.baseUrl:http://localhost:5173}")
    private String frontendBaseUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Gửi email OTP đặt lại mật khẩu
     */
    public void sendPasswordResetOtpEmail(String toEmail, String otpCode) {
        
        String subject = "Ma OTP dat lai mat khau - He thong Quan ly Sinh vien";
        String body = "Xin chào,\n\n" +
                "Chung toi nhan duoc yeu cau dat lai mat khau cho tai khoan cua ban.\n\n" +
                "Ma OTP cua ban la: " + otpCode + "\n\n" +
                "Ma OTP co hieu luc trong 10 phut va chi su dung 1 lan.\n\n" +
                "Neu ban khong yeu cau dat lai mat khau, vui long bo qua email nay.\n\n" +
                "Tran trong,\n" +
                "He thong Quan ly Sinh vien";

            if (isLogMode()) {
                log.info("[MAIL-LOG] To: {}", toEmail);
                log.info("[MAIL-LOG] Subject: {}", subject);
            log.info("[MAIL-LOG] OTP code: {}", otpCode);
                return;
            }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }

    /**
     * Gửi email xác nhận thay đổi mật khẩu thành công
     */
    public void sendPasswordChangedConfirmationEmail(String toEmail, String userName) {
        String subject = "Mật khẩu của bạn đã được thay đổi";
        String body = "Xin chào " + userName + ",\n\n" +
                "Mật khẩu của bạn đã được thay đổi thành công.\n" +
                "Nếu bạn không thực hiện thao tác này, vui lòng liên hệ với bộ phận hỗ trợ ngay lập tức.\n\n" +
                "Trân trọng,\n" +
                "Hệ thống Quản lý Sinh viên";

        if (isLogMode()) {
            log.info("[MAIL-LOG] To: {}", toEmail);
            log.info("[MAIL-LOG] Subject: {}", subject);
            log.info("[MAIL-LOG] Confirmation message for {}: {}", userName, body);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }

    private boolean isLogMode() {
        return "log".equalsIgnoreCase(mailMode);
    }
}
