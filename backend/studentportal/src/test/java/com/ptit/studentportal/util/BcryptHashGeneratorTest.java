package com.ptit.studentportal.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
@Disabled("Debug helper for manual BCrypt hash generation")
public class BcryptHashGeneratorTest {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    public void generateBcryptHash() {
        String rawPassword = "123456";
        String hashedPassword = passwordEncoder.encode(rawPassword);
        
        System.out.println("\n========================================");
        System.out.println("Raw password: " + rawPassword);
        System.out.println("BCrypt hash: " + hashedPassword);
        System.out.println("========================================");
        System.out.println("\nCopy this hash for manual user SQL:");
        System.out.println(hashedPassword);
        System.out.println("\nSQL example:");
        System.out.println("INSERT INTO users (username, password_hash, email, force_password_change, role, status, created_at, updated_at)");
        System.out.println("VALUES ('testuser', '" + hashedPassword + "', 'test@test.com', false, 'student', 'active', NOW(), NOW());");
        System.out.println("========================================\n");
    }
}
