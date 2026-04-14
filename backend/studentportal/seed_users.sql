-- Seed test users for authentication testing
-- Password for all users: 123456
-- BCrypt hash: $2a$10$gKee76JuMKMlvyoEtD4qEuBDp6dYaudD4BB6HasUOKMqERvVZuzpm

-- Ensure a test department exists for lecturer profile
INSERT INTO departments (department_code, department_name, created_at, updated_at)
VALUES ('CNTT', 'Cong nghe thong tin', NOW(), NOW())
ON DUPLICATE KEY UPDATE department_name = VALUES(department_name), updated_at = NOW();

-- Drop existing test data first if you need to re-seed
DELETE FROM students WHERE student_code IN ('ST001');
DELETE FROM lecturers WHERE lecturer_code IN ('LC001');
DELETE FROM users WHERE username IN ('student01', 'lecturer01', 'admin01');

INSERT INTO users (username, password_hash, email, role, status, created_at, updated_at) VALUES
('student01', '$2a$10$gKee76JuMKMlvyoEtD4qEuBDp6dYaudD4BB6HasUOKMqERvVZuzpm', 'student01@ptit.edu.vn', 'STUDENT', 'ACTIVE', NOW(), NOW()),
('lecturer01', '$2a$10$gKee76JuMKMlvyoEtD4qEuBDp6dYaudD4BB6HasUOKMqERvVZuzpm', 'lecturer01@ptit.edu.vn', 'LECTURER', 'ACTIVE', NOW(), NOW()),
('admin01', '$2a$10$gKee76JuMKMlvyoEtD4qEuBDp6dYaudD4BB6HasUOKMqERvVZuzpm', 'admin01@ptit.edu.vn', 'ADMIN', 'ACTIVE', NOW(), NOW());

-- Insert corresponding student profile for student01
INSERT INTO students (user_id, program_id, student_code, full_name, gender, academic_status, created_at, updated_at)
SELECT user_id, 1, 'ST001', 'Nguyen Van Thai', 'MALE', 'STUDYING', NOW(), NOW() 
FROM users WHERE username = 'student01';

-- Insert corresponding lecturer profile for lecturer01
INSERT INTO lecturers (user_id, department_id, lecturer_code, full_name, work_email, phone, academic_degree, created_at, updated_at)
SELECT u.user_id, d.department_id, 'LC001', 'Tran Thi Chau', 'lecturer01@ptit.edu.vn', '0900000001', 'Thac si', NOW(), NOW()
FROM users u
JOIN departments d ON d.department_code = 'CNTT'
WHERE u.username = 'lecturer01';
