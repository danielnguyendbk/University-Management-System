package com.ptit.studentportal.util;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
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
        System.out.println("\nCopy and use this hash in seed_users.sql:");
        System.out.println(hashedPassword);
        System.out.println("\nSQL example:");
        System.out.println("INSERT INTO users (username, password_hash, email, role, status, created_at, updated_at)");
        System.out.println("VALUES ('testuser', '" + hashedPassword + "', 'test@test.com', 'STUDENT', 'ACTIVE', NOW(), NOW());");
        System.out.println("========================================\n");
    }
}
