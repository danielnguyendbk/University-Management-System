package com.ptit.studentportal.auth;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@Disabled("Manual debug test depends on local seed credentials")
@SpringBootTest
class AuthServiceLoginDebugTest {

    @Autowired
    private AuthService authService;

    @Test
    void debugLogin() {
        try {
            LoginResponse response = authService.login(new LoginRequest("student01", "123456"));
            System.out.println("LOGIN OK: " + response);
        } catch (Exception ex) {
            System.out.println("LOGIN FAILED: " + ex.getClass().getName());
            System.out.println("MESSAGE: " + ex.getMessage());
            ex.printStackTrace(System.out);
            throw ex;
        }
    }
}
