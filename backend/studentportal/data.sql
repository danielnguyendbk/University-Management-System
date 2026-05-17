DROP DATABASE IF EXISTS student_portal;

CREATE DATABASE IF NOT EXISTS student_portal
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE student_portal;

-- =====================================
-- 1. USERS
-- =====================================
CREATE TABLE users (
    user_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    force_password_change BOOLEAN NOT NULL DEFAULT FALSE,
    role          ENUM('student', 'lecturer', 'admin') NOT NULL,
    status        ENUM('active', 'inactive', 'locked') NOT NULL DEFAULT 'active',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================
-- 2. REFRESH_TOKENS
-- Blacklist JWT refresh tokens khi logout
-- =====================================
CREATE TABLE refresh_tokens (
    token_id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    revoked    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================
-- 3. DEPARTMENTS
-- =====================================
CREATE TABLE departments (
    department_id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    department_code VARCHAR(20)  NOT NULL UNIQUE,
    department_name VARCHAR(150) NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================
-- 4. PROGRAMS
-- departments (1) -- (N) programs
-- =====================================
CREATE TABLE programs (
    program_id    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT UNSIGNED NOT NULL,
    program_code  VARCHAR(20)  NOT NULL UNIQUE,
    program_name  VARCHAR(150) NOT NULL,
    total_credits INT NOT NULL,
    status        ENUM('active', 'inactive', 'archived') NOT NULL DEFAULT 'active',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_programs_total_credits CHECK (total_credits > 0),
    CONSTRAINT fk_programs_department
        FOREIGN KEY (department_id) REFERENCES departments(department_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================
-- 5. STUDENTS
-- users (1) -- (1) students
-- programs (1) -- (N) students
-- =====================================
CREATE TABLE students (
    student_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT UNSIGNED NOT NULL UNIQUE,
    program_id       BIGINT UNSIGNED NOT NULL,
    student_code     VARCHAR(20)  NOT NULL UNIQUE,
    full_name        VARCHAR(150) NOT NULL,
    date_of_birth    DATE NULL,
    gender           ENUM('male', 'female', 'other') NULL,
    phone            VARCHAR(20)  NULL,
    address VARCHAR(255) NULL,
    academic_status  ENUM('studying', 'paused', 'graduated', 'dropped_out') NOT NULL DEFAULT 'studying',
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_students_program
        FOREIGN KEY (program_id) REFERENCES programs(program_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================
-- 6. LECTURERS
-- users (1) -- (1) lecturers
-- departments (1) -- (N) lecturers
-- =====================================
CREATE TABLE lecturers (
    lecturer_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL UNIQUE,
    department_id   BIGINT UNSIGNED NOT NULL,
    lecturer_code   VARCHAR(20)  NOT NULL UNIQUE,
    full_name       VARCHAR(150) NOT NULL,
    phone           VARCHAR(20)  NULL,
    academic_title  VARCHAR(100) NULL,              -- đổi từ academic_degree -> title phù hợp hơn
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lecturers_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_lecturers_department
        FOREIGN KEY (department_id) REFERENCES departments(department_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================
-- 7. COURSES
-- departments (1) -- (N) courses
-- =====================================
CREATE TABLE courses (
    course_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT UNSIGNED NOT NULL,
    course_code   VARCHAR(20)  NOT NULL UNIQUE,
    course_name   VARCHAR(150) NOT NULL,
    credits       INT NOT NULL,
    course_type   ENUM('required', 'elective') NOT NULL DEFAULT 'required',
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    description   TEXT NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_courses_credits CHECK (credits > 0),
    CONSTRAINT fk_courses_department
        FOREIGN KEY (department_id) REFERENCES departments(department_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================
-- 8. PROGRAM_COURSES
-- programs (N) -- (M) courses
-- =====================================
CREATE TABLE program_courses (
    program_course_id    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    program_id           BIGINT UNSIGNED NOT NULL,
    course_id            BIGINT UNSIGNED NOT NULL,
    recommended_semester INT NULL,
    is_required          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_program_courses UNIQUE (program_id, course_id),
    CONSTRAINT chk_program_courses_semester CHECK (
        recommended_semester IS NULL OR recommended_semester > 0
    ),
    CONSTRAINT fk_program_courses_program
        FOREIGN KEY (program_id) REFERENCES programs(program_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_program_courses_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================
-- 9. COURSE_PREREQUISITES
-- courses (N) -- (M) courses (self-join)
-- =====================================
CREATE TABLE course_prerequisites (
    course_id            BIGINT UNSIGNED NOT NULL,
    prerequisite_course_id BIGINT UNSIGNED NOT NULL,
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (course_id, prerequisite_course_id),
    
    CONSTRAINT fk_course_prereq_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_course_prereq_prerequisite
        FOREIGN KEY (prerequisite_course_id) REFERENCES courses(course_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;
-- Thay thế CHECK bằng trigger
DELIMITER $$

CREATE TRIGGER trg_course_prereq_no_self_insert
BEFORE INSERT ON course_prerequisites
FOR EACH ROW
BEGIN
    IF NEW.course_id = NEW.prerequisite_course_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Một môn học không thể là tiên quyết của chính nó';
    END IF;
END$$

CREATE TRIGGER trg_course_prereq_no_self_update
BEFORE UPDATE ON course_prerequisites
FOR EACH ROW
BEGIN
    IF NEW.course_id = NEW.prerequisite_course_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Một môn học không thể là tiên quyết của chính nó';
    END IF;
END$$

DELIMITER ;


CREATE TABLE semesters (
    semester_id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    semester_name      VARCHAR(50) NOT NULL,
    academic_year      VARCHAR(20) NOT NULL,
    start_date         DATE NOT NULL,
    end_date           DATE NOT NULL,
    registration_open  DATETIME NULL,
    registration_close DATETIME NULL,
    created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_semesters_dates CHECK (end_date > start_date),
    CONSTRAINT chk_semesters_registration CHECK (
        registration_open IS NULL
        OR registration_close IS NULL
        OR registration_close > registration_open
    )
) ENGINE=InnoDB;

-- =====================================
-- 11. ROOMS
-- =====================================
CREATE TABLE rooms (
    room_id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    room_code VARCHAR(20) NOT NULL UNIQUE,
    building  VARCHAR(100) NULL,
    room_type ENUM('classroom', 'lab', 'exam_room', 'hall', 'office', 'other') NOT NULL DEFAULT 'classroom',
    capacity  INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_rooms_capacity CHECK (capacity > 0)
) ENGINE=InnoDB;

-- =====================================
-- 12. COURSE_SECTIONS
-- courses (1) -- (N) course_sections
-- semesters (1) -- (N) course_sections
-- lecturers (1) -- (N) course_sections
-- =====================================
CREATE TABLE course_sections (
    section_id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id    BIGINT UNSIGNED NOT NULL,
    semester_id  BIGINT UNSIGNED NOT NULL,
    lecturer_id  BIGINT UNSIGNED NOT NULL,
    section_code VARCHAR(20) NOT NULL,
    max_capacity INT NOT NULL DEFAULT 50,
    status       ENUM('draft', 'open', 'closed', 'cancelled') NOT NULL DEFAULT 'open',
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_section UNIQUE (semester_id, section_code),
    CONSTRAINT chk_course_sections_max_capacity CHECK (max_capacity > 0),
    CONSTRAINT fk_sections_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_sections_semester
        FOREIGN KEY (semester_id) REFERENCES semesters(semester_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_sections_lecturer
        FOREIGN KEY (lecturer_id) REFERENCES lecturers(lecturer_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================
-- 13. SCHEDULES
-- course_sections (1) -- (N) schedules
-- rooms (1) -- (N) schedules
-- 1 row = 1 weekly time slot
-- =====================================
CREATE TABLE schedules (
    schedule_id  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    section_id   BIGINT UNSIGNED NOT NULL,
    room_id      BIGINT UNSIGNED NOT NULL,
    day_of_week  ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun') NOT NULL,
    start_time   TIME NOT NULL,
    end_time     TIME NOT NULL,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_schedules_time CHECK (end_time > start_time),
    -- Chống trùng phòng cùng tiết
    CONSTRAINT uq_room_slot UNIQUE (room_id, day_of_week, start_time),
    -- Chống lớp bị xếp 2 lịch trùng tiết
    CONSTRAINT uq_section_slot UNIQUE (section_id, day_of_week, start_time),
    CONSTRAINT fk_schedules_section
        FOREIGN KEY (section_id) REFERENCES course_sections(section_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_schedules_room
        FOREIGN KEY (room_id) REFERENCES rooms(room_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================
-- 14. EXAMS
-- course_sections (1) -- (N) exams
-- rooms (1) -- (N) exams
-- lecturers (1) -- (N) exams (proctor)
-- =====================================
CREATE TABLE exams (
    exam_id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    section_id          BIGINT UNSIGNED NOT NULL,
    room_id             BIGINT UNSIGNED NOT NULL,
    proctor_lecturer_id BIGINT UNSIGNED NULL,
    exam_type           ENUM('midterm', 'final', 'makeup', 'other') NOT NULL,
    exam_date           DATE NOT NULL,
    start_time          TIME NOT NULL,
    end_time            TIME NOT NULL,
    note                VARCHAR(255) NULL,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_exams_time CHECK (end_time > start_time),
    -- Chống trùng phòng thi cùng ngày giờ
    CONSTRAINT uq_exam_room_slot UNIQUE (room_id, exam_date, start_time),
    CONSTRAINT fk_exams_section
        FOREIGN KEY (section_id) REFERENCES course_sections(section_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_exams_room
        FOREIGN KEY (room_id) REFERENCES rooms(room_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_exams_proctor
        FOREIGN KEY (proctor_lecturer_id) REFERENCES lecturers(lecturer_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================
-- 15. ENROLLMENTS
-- students (1) -- (N) enrollments
-- course_sections (1) -- (N) enrollments
-- =====================================
CREATE TABLE enrollments (
    enrollment_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id        BIGINT UNSIGNED NOT NULL,
    section_id        BIGINT UNSIGNED NOT NULL,
    enrollment_status ENUM('registered', 'dropped', 'cancelled', 'completed') NOT NULL DEFAULT 'registered',
    registered_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_enrollment UNIQUE (student_id, section_id),
    CONSTRAINT fk_enrollments_student
        FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_enrollments_section
        FOREIGN KEY (section_id) REFERENCES course_sections(section_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================
-- 16. GRADES
-- enrollments (1) -- (1) grades
-- total_score là generated column, tránh mất đồng bộ
-- Nếu trọng số linh hoạt theo môn thì bỏ GENERATED, tính ở service
-- =====================================
CREATE TABLE grades (
    grade_id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    enrollment_id    BIGINT UNSIGNED NOT NULL UNIQUE,
    attendance_score DECIMAL(4,2) NULL,
    midterm_score    DECIMAL(4,2) NULL,
    final_score      DECIMAL(4,2) NULL,
    -- Generated: 10% chuyên cần + 30% giữa kỳ + 60% cuối kỳ
    total_score      DECIMAL(4,2) GENERATED ALWAYS AS (
        ROUND(
            COALESCE(attendance_score, 0) * 0.10 +
            COALESCE(midterm_score,    0) * 0.30 +
            COALESCE(final_score,      0) * 0.60,
        2)
    ) STORED,
    
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_grades_attendance CHECK (attendance_score IS NULL OR (attendance_score BETWEEN 0 AND 10)),
    CONSTRAINT chk_grades_midterm    CHECK (midterm_score    IS NULL OR (midterm_score    BETWEEN 0 AND 10)),
    CONSTRAINT chk_grades_final      CHECK (final_score      IS NULL OR (final_score      BETWEEN 0 AND 10)),
    CONSTRAINT fk_grades_enrollment
        FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================
-- 17. GPA_HISTORY
-- Snapshot GPA mỗi học kỳ per student
-- semesters (1) -- (N) gpa_history
-- students  (1) -- (N) gpa_history
-- =====================================
CREATE TABLE gpa_history (
    gpa_history_id  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT UNSIGNED NOT NULL,
    semester_id     BIGINT UNSIGNED NOT NULL,
    semester_gpa    DECIMAL(4,2) NOT NULL,   -- GPA học kỳ đó
    cumulative_gpa  DECIMAL(4,2) NOT NULL,   -- GPA tích lũy đến học kỳ đó
    total_credits   INT NOT NULL DEFAULT 0,  -- tổng tín chỉ tích lũy
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_gpa_history UNIQUE (student_id, semester_id),
    CONSTRAINT chk_gpa_semester    CHECK (semester_gpa   BETWEEN 0 AND 4),
    CONSTRAINT chk_gpa_cumulative  CHECK (cumulative_gpa BETWEEN 0 AND 4),
    CONSTRAINT chk_gpa_credits     CHECK (total_credits >= 0),
    CONSTRAINT fk_gpa_history_student
        FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_gpa_history_semester
        FOREIGN KEY (semester_id) REFERENCES semesters(semester_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================
-- 18. REQUEST_TYPES
-- =====================================
CREATE TABLE request_types (
    request_type_id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    request_type_code VARCHAR(50)  NOT NULL UNIQUE,
    request_type_name VARCHAR(100) NOT NULL,
    description       VARCHAR(255) NULL,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO request_types (request_type_code, request_type_name, description) VALUES
('recheck_grade',  'Phúc khảo điểm',  'Yêu cầu xem xét lại điểm số'),
('leave_request',  'Xin nghỉ học',     'Yêu cầu xin nghỉ học'),
('transcript',     'In bảng điểm',     'Yêu cầu in bảng điểm chính thức');

-- =====================================
-- 19. STUDENT_REQUESTS
-- students (1) -- (N) student_requests
-- processed_by -> users (lecturer/admin)
-- =====================================
CREATE TABLE student_requests (
    request_id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT UNSIGNED NOT NULL,
    request_type_id BIGINT UNSIGNED NOT NULL,
    title           VARCHAR(150) NOT NULL,
    content         TEXT NOT NULL,
    status          ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    processed_by    BIGINT UNSIGNED NULL,
    processed_at    DATETIME NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_requests_student
        FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_requests_type
        FOREIGN KEY (request_type_id) REFERENCES request_types(request_type_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_requests_processed_by
        FOREIGN KEY (processed_by) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================
-- 20. REQUEST_ATTACHMENTS
-- student_requests (1) -- (N) request_attachments
-- =====================================
CREATE TABLE request_attachments (
    attachment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    request_id    BIGINT UNSIGNED NOT NULL,
    file_name     VARCHAR(255) NOT NULL,
    file_url      VARCHAR(255) NOT NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_request_attachments_request
        FOREIGN KEY (request_id) REFERENCES student_requests(request_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================
-- 21. NOTIFICATIONS
-- users (1) -- (N) notifications (created_by)
-- =====================================
CREATE TABLE notifications (
    notification_id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_by        BIGINT UNSIGNED NULL,
    title             VARCHAR(150) NOT NULL,
    content           TEXT NOT NULL,
    notification_type ENUM('general', 'tuition', 'academic', 'exam', 'system') NOT NULL DEFAULT 'general',
    is_important      BOOLEAN NOT NULL DEFAULT FALSE,
    published_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at        DATETIME NULL,
    status            ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
    target_type       ENUM('all', 'student', 'lecturer', 'section', 'program', 'custom') NOT NULL DEFAULT 'custom',
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================
-- 22. NOTIFICATION_RECIPIENTS
-- notifications (1) -- (N) notification_recipients
-- users (1) -- (N) notification_recipients
-- =====================================
CREATE TABLE notification_recipients (
    notification_recipient_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    notification_id           BIGINT UNSIGNED NOT NULL,
    user_id                   BIGINT UNSIGNED NOT NULL,
    is_read                   BOOLEAN NOT NULL DEFAULT FALSE,
    read_at                   DATETIME NULL,
    created_at                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_notification_recipient UNIQUE (notification_id, user_id),
    CONSTRAINT fk_notification_recipients_notification
        FOREIGN KEY (notification_id) REFERENCES notifications(notification_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_notification_recipients_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================
-- 23. TUITION_FEES
-- students (1) -- (N) tuition_fees
-- semesters (1) -- (N) tuition_fees
-- =====================================
CREATE TABLE tuition_fees (
    tuition_fee_id  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT UNSIGNED NOT NULL,
    semester_id     BIGINT UNSIGNED NOT NULL,
    total_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status          ENUM('unpaid', 'partial', 'paid', 'overdue', 'waived') NOT NULL DEFAULT 'unpaid',
    due_date        DATE NULL,
    note            VARCHAR(255) NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_tuition_fee UNIQUE (student_id, semester_id),
    CONSTRAINT chk_tuition_total    CHECK (total_amount    >= 0),
    CONSTRAINT chk_tuition_discount CHECK (discount_amount >= 0),
    CONSTRAINT fk_tuition_fees_student
        FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_tuition_fees_semester
        FOREIGN KEY (semester_id) REFERENCES semesters(semester_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================
-- 24. PAYMENTS
-- tuition_fees (1) -- (N) payments
-- =====================================
CREATE TABLE payments (
    payment_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tuition_fee_id   BIGINT UNSIGNED NOT NULL,
    payment_method   ENUM('qr', 'bank_transfer', 'cash') NOT NULL DEFAULT 'qr',
    amount           DECIMAL(12,2) NOT NULL,
    transaction_code VARCHAR(100) NULL UNIQUE,
    payment_status   ENUM('pending', 'success', 'failed') NOT NULL DEFAULT 'pending',
    paid_at          DATETIME NULL,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_payments_amount CHECK (amount > 0),
    CONSTRAINT fk_payments_tuition_fee
        FOREIGN KEY (tuition_fee_id) REFERENCES tuition_fees(tuition_fee_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================
-- 25. E_INVOICES
-- payments (1) -- (1) e_invoices
-- =====================================
CREATE TABLE e_invoices (
    invoice_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_id     BIGINT UNSIGNED NOT NULL UNIQUE,    -- 1:1 với payment
    invoice_number VARCHAR(50)  NOT NULL UNIQUE,
    invoice_date   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    amount         DECIMAL(12,2) NOT NULL,
    status         ENUM('issued', 'cancelled') NOT NULL DEFAULT 'issued',
    invoice_url    VARCHAR(255) NULL,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_e_invoices_payment
        FOREIGN KEY (payment_id) REFERENCES payments(payment_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================
-- 26. FEEDBACKS
-- students (1) -- (N) feedbacks
-- handled_by -> users (admin)
-- =====================================
CREATE TABLE feedbacks (
    feedback_id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id    BIGINT UNSIGNED NOT NULL,
    title         VARCHAR(150) NOT NULL,
    content       TEXT NOT NULL,
    status        ENUM('pending', 'reviewed', 'resolved', 'rejected') NOT NULL DEFAULT 'pending',
    reviewed_by   BIGINT UNSIGNED NULL,        -- đổi từ handled_by -> reviewed_by
    response_note TEXT NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at   DATETIME NULL,               -- đổi từ handled_at -> reviewed_at
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedbacks_student
        FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_feedbacks_reviewed_by
        FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================
-- INDEXES
-- =====================================
CREATE INDEX idx_refresh_tokens_user       ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_expires    ON refresh_tokens (expires_at);

CREATE INDEX idx_students_academic_status  ON students (academic_status);
CREATE INDEX idx_students_program          ON students (program_id);

CREATE INDEX idx_lecturers_department      ON lecturers (department_id);

CREATE INDEX idx_courses_is_active         ON courses (is_active);
CREATE INDEX idx_courses_department        ON courses (department_id);

CREATE INDEX idx_course_sections_status    ON course_sections (status);
CREATE INDEX idx_course_sections_semester  ON course_sections (semester_id, course_id);

CREATE INDEX idx_schedules_day_time        ON schedules (day_of_week, start_time, end_time);

CREATE INDEX idx_exams_exam_date           ON exams (exam_date);

CREATE INDEX idx_enrollments_status        ON enrollments (enrollment_status);
CREATE INDEX idx_enrollments_student       ON enrollments (student_id);

CREATE INDEX idx_gpa_history_student       ON gpa_history (student_id);

CREATE INDEX idx_student_requests_status   ON student_requests (status);
CREATE INDEX idx_student_requests_student  ON student_requests (student_id);

CREATE INDEX idx_notifications_status      ON notifications (status);
CREATE INDEX idx_notification_recipients_user ON notification_recipients (user_id);

CREATE INDEX idx_tuition_fees_status       ON tuition_fees (status);
CREATE INDEX idx_payments_status           ON payments (payment_status);

-- =====================================
-- VIEW: current capacity của lớp học phần
-- =====================================
CREATE OR REPLACE VIEW vw_section_capacity AS
SELECT
    cs.section_id,
    cs.section_code,
    cs.course_id,
    cs.semester_id,
    cs.lecturer_id,
    cs.max_capacity,
    COUNT(e.enrollment_id) AS current_capacity,
    (cs.max_capacity - COUNT(e.enrollment_id)) AS remaining_capacity
FROM course_sections cs
LEFT JOIN enrollments e
    ON cs.section_id = e.section_id
   AND e.enrollment_status IN ('registered', 'completed')
GROUP BY
    cs.section_id, cs.section_code, cs.course_id,
    cs.semester_id, cs.lecturer_id, cs.max_capacity;
    