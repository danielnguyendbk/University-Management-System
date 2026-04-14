package com.ptit.studentportal.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BcryptHashGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "123456";
        String hashedPassword = encoder.encode(rawPassword);
        
        System.out.println("Raw password: " + rawPassword);
        System.out.println("BCrypt hash: " + hashedPassword);
        System.out.println("\nUse this hash in seed_users.sql:");
        System.out.println("INSERT INTO users (username, password_hash, email, role, status, created_at, updated_at)");
        System.out.println("VALUES ('testuser', '" + hashedPassword + "', 'test@test.com', 'STUDENT', 'ACTIVE', NOW(), NOW());");
    }
}
