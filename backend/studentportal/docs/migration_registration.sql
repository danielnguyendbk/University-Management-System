-- =============================================================
-- Migration: Course Registration Module
-- Chạy từng block một. Safe to run multiple times (IF NOT EXISTS).
-- =============================================================

USE portal;

-- 1. Thêm registration_status vào semesters (nếu chưa có)
ALTER TABLE semesters
ADD COLUMN IF NOT EXISTS registration_status
    ENUM('CLOSED', 'OPEN', 'LOCKED') NOT NULL DEFAULT 'CLOSED'
    AFTER registration_close;

-- 2. Thêm dropped_at và note vào enrollments (nếu chưa có)
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS dropped_at DATETIME NULL AFTER registered_at,
ADD COLUMN IF NOT EXISTS note VARCHAR(255) NULL AFTER dropped_at;

-- 3. Tạo bảng enrollment_logs (nếu chưa có)
CREATE TABLE IF NOT EXISTS enrollment_logs (
    log_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL,
    section_id BIGINT UNSIGNED NOT NULL,
    action     ENUM('REGISTER', 'DROP', 'ADMIN_REGISTER', 'ADMIN_DROP') NOT NULL,
    note       VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_enrollment_logs_student
        FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_enrollment_logs_section
        FOREIGN KEY (section_id) REFERENCES course_sections(section_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 4. Index hỗ trợ query enrollment_logs
CREATE INDEX IF NOT EXISTS idx_enrollment_logs_student ON enrollment_logs (student_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_logs_section ON enrollment_logs (section_id);
