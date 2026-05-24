
DROP DATABASE IF EXISTS merge_migration;
CREATE DATABASE IF NOT EXISTS merge_migration
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE merge_migration;



-- =====================================
-- 1. USERS
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


CREATE TABLE password_reset_tokens (
    reset_id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT UNSIGNED NOT NULL,
    token_hash    VARCHAR(255) NOT NULL UNIQUE,
    expires_at    DATETIME NOT NULL,
    used_at       DATETIME NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_password_reset_tokens_user
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
    enrollment_year  YEAR NULL,               -- đổi từ cohort VARCHAR -> rõ nghĩa hơn
    academic_status  ENUM('studying', 'paused', 'graduated', 'drop_out') NOT NULL DEFAULT 'studying',
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
    email           VARCHAR(100) NOT NULL UNIQUE,   -- email trường cấp (khác users.email)
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
    course_code   VARCHAR(20)  NOT NULL UNIQUE,
    course_name   VARCHAR(150) NOT NULL,
    credits       INT NOT NULL,
    course_type   ENUM(
        'bắt buộc chung',
        'bắt buộc chung nhóm ngành',
        'cơ sở ngành',
        'chuyên ngành',
        'thực tập',
        'luận văn tốt nghiệp'
    ) NOT NULL DEFAULT 'bắt buộc chung',
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    description   TEXT NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_courses_credits CHECK (credits > 0)
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
        recommended_semester IS NULL OR (recommended_semester > 0)
    ),
    CONSTRAINT fk_program_courses_program
        FOREIGN KEY (program_id) REFERENCES programs(program_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_program_courses_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE semesters (
    semester_id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    semester_code      VARCHAR(50) NOT NULL,
    semester_year      VARCHAR(20) NOT NULL,
    price_per_credit DECIMAL(12,2) NULL,
    start_date         DATE NOT NULL,
    end_date           DATE NOT NULL,
    tuition_due_date DATE NULL,
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


-- tòa
CREATE TABLE buildings (
    building_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    building_code VARCHAR(20) NOT NULL UNIQUE,
    building_name VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================
-- 11. ROOMS
-- =====================================
CREATE TABLE rooms (
    room_id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    room_code VARCHAR(20) NOT NULL UNIQUE,
    building_id BIGINT UNSIGNED NULL,
    room_type ENUM('classroom', 'lab', 'exam_room', 'hall', 'office', 'other') NOT NULL DEFAULT 'classroom',
    capacity  INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_rooms_capacity CHECK (capacity > 0),
    CONSTRAINT fk_rooms_building	
		FOREIGN KEY (building_id) REFERENCES buildings(building_id)
		ON UPDATE CASCADE ON DELETE SET NULL
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
    from_week_no INT NULL,
    to_week_no INT NULL,
    slot_start   INT NOT NULL,      -- đổi từ period_start -> slot_start
    slot_end     INT NOT NULL,      -- đổi từ period_end   -> slot_end
    start_time   TIME NOT NULL,
    end_time     TIME NOT NULL,
    session_type ENUM('theory', 'practice') NOT NULL DEFAULT 'theory',
    practice_group_no TINYINT UNSIGNED NOT NULL DEFAULT 0,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_schedules_slot CHECK (slot_end >= slot_start),
    CONSTRAINT chk_schedules_time CHECK (end_time > start_time),
    -- Chống trùng phòng cùng tiết
    CONSTRAINT uq_room_slot UNIQUE (room_id, day_of_week, slot_start),
    -- Chống lớp bị xếp 2 lịch trùng tiết
    CONSTRAINT uq_section_slot UNIQUE (section_id, day_of_week, slot_start),
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
    semester_id BIGINT UNSIGNED NULL,
    section_id          BIGINT UNSIGNED NOT NULL,
    room_id             BIGINT UNSIGNED NOT NULL,
    proctor_lecturer_id BIGINT UNSIGNED NULL,
    exam_type           ENUM('midterm', 'final', 'makeup', 'other') NOT NULL,
    exam_method ENUM('written', 'oral', 'practical', 'online') NULL,
    exam_date           DATE NOT NULL,
    start_time          TIME NOT NULL,
    end_time            TIME NOT NULL,
    seat_range VARCHAR(100) NULL,
    student_count INT NULL,
    status ENUM('draft', 'scheduled', 'cancel', 'completed') NOT NULL DEFAULT 'scheduled',
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

CREATE TABLE exam_invigilators (
    exam_id BIGINT UNSIGNED NOT NULL,
    lecturer_id BIGINT UNSIGNED NOT NULL,
    role ENUM('main', 'assistant') NOT NULL DEFAULT 'assistant',
    note VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (exam_id, lecturer_id),

    CONSTRAINT fk_exam_invigilators_exam
        FOREIGN KEY (exam_id) REFERENCES exams(exam_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_exam_invigilators_lecturer
        FOREIGN KEY (lecturer_id) REFERENCES lecturers(lecturer_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- =====================================
-- 15. ENROLLMENTS
-- students (1) -- (N) enrollments
-- course_sections (1) -- (N) enrollments
-- =====================================

CREATE TABLE enrollments (
    enrollment_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id        BIGINT UNSIGNED NOT NULL,
    section_id        BIGINT UNSIGNED NOT NULL,
    practice_group_no TINYINT UNSIGNED NOT NULL DEFAULT 0,
    enrollment_status ENUM('registered', 'dropped', 'cancelled', 'completed') NOT NULL DEFAULT 'registered',
    registered_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    dropped_at 		  DATETIME NULL,
    note 			  VARCHAR(255) NULL,
    CONSTRAINT uq_enrollment UNIQUE (student_id, section_id),
    CONSTRAINT fk_enrollments_student
        FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_enrollments_section
        FOREIGN KEY (section_id) REFERENCES course_sections(section_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;



CREATE TABLE enrollment_logs (
    log_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL,
    section_id BIGINT UNSIGNED NOT NULL,
    action ENUM('register', 'drop', 'admin_register', 'admin_drop') NOT NULL,
    note VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_enrollment_logs_student
        FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_enrollment_logs_section
        FOREIGN KEY (section_id) REFERENCES course_sections(section_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

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
    exercise_score   DECIMAL(4,2) NULL,
    practice_score  DECIMAL(4,2) NULL,
    midterm_score    DECIMAL(4,2) NULL,
    final_score      DECIMAL(4,2) NULL,
    total_score      DECIMAL(4,2) NULL,

    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_grades_attendance CHECK (attendance_score IS NULL OR (attendance_score BETWEEN 0 AND 10)),
    CONSTRAINT chk_grades_exercise      CHECK (exercise_score      IS NULL OR (exercise_score      BETWEEN 0 AND 10)),
    CONSTRAINT chk_grades_practice      CHECK (practice_score      IS NULL OR (practice_score      BETWEEN 0 AND 10)),
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
    section_id      BIGINT UNSIGNED NULL,
    section_code    VARCHAR(50) NULL,
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
	CONSTRAINT fk_requests_section
        FOREIGN KEY (section_id) REFERENCES course_sections(section_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
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
    invoice_code VARCHAR(50) NULL UNIQUE,
    student_id      BIGINT UNSIGNED NOT NULL,
    semester_id     BIGINT UNSIGNED NOT NULL,
    total_credits INT NOT NULL DEFAULT 0,
    total_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    final_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status          ENUM('unpaid', 'partical', 'paid', 'overdue', 'waived') NOT NULL DEFAULT 'unpaid',
    due_date        DATE NULL,
    note            VARCHAR(255) NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_tuition_fee UNIQUE (student_id, semester_id),
    CONSTRAINT chk_tuition_total    CHECK (total_amount    >= 0),
    CONSTRAINT chk_tuition_discount CHECK (discount_amount >= 0),
    CONSTRAINT chk_tuition_final    CHECK (final_amount    >= 0),
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
    order_code VARCHAR(80) NULL UNIQUE,
    payment_method   ENUM('qr','cash') NOT NULL DEFAULT 'qr',
    processed_by VARCHAR(100) NOT NULL DEFAULT 'system',
    amount           DECIMAL(12,2) NOT NULL,
    transaction_code VARCHAR(100) NULL UNIQUE,
    qr_image_url TEXT NULL,
    payment_status   ENUM('pending', 'success', 'failed') NOT NULL DEFAULT 'pending',
    note VARCHAR(255) NULL,
    paid_at          DATETIME NULL,
    raw_webhook_payload JSON NULL,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expired_at DATETIME NULL,
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
    




CREATE TABLE semester_weeks (
    semester_week_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    semester_id      BIGINT UNSIGNED NOT NULL,
    cohort_year YEAR NOT NULL ,
    week_no          INT NOT NULL,
    start_date       DATE NOT NULL,
    end_date         DATE NOT NULL,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_semester_weeks_date CHECK (end_date >= start_date),
    CONSTRAINT fk_semester_weeks_semester
        FOREIGN KEY (semester_id) REFERENCES semesters(semester_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT uq_semester_week UNIQUE (semester_id, cohort_year, week_no)
) ENGINE=InnoDB;



CREATE TABLE class_sessions (
    session_id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    schedule_id       BIGINT UNSIGNED NULL,
    section_id        BIGINT UNSIGNED NOT NULL,
    practice_group_no TINYINT UNSIGNED NOT NULL DEFAULT 0,
    semester_week_id  BIGINT UNSIGNED NOT NULL,
    session_date      DATE NOT NULL,
    room_id           BIGINT UNSIGNED NULL,
    lecturer_id       BIGINT UNSIGNED NULL,
    slot_start        INT NOT NULL,
    slot_end          INT NOT NULL,
    start_time        TIME NULL,
    end_time          TIME NULL,
    session_status    ENUM('scheduled', 'cancelled', 'makeup', 'rescheduled', 'completed') 
                      NOT NULL DEFAULT 'scheduled',
    note              VARCHAR(255) NULL,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_class_sessions_slot CHECK (slot_end >= slot_start),
    CONSTRAINT chk_class_sessions_time CHECK (
        start_time IS NULL OR end_time IS NULL OR end_time > start_time
    ),

    CONSTRAINT uq_class_sessions_section_exact
        UNIQUE (section_id, session_date, slot_start, slot_end),
    CONSTRAINT uq_class_sessions_room_exact
        UNIQUE (room_id, session_date, slot_start, slot_end),
    CONSTRAINT uq_class_sessions_lecturer_exact
        UNIQUE (lecturer_id, session_date, slot_start, slot_end),

    CONSTRAINT fk_class_sessions_schedule
        FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_class_sessions_section
        FOREIGN KEY (section_id) REFERENCES course_sections(section_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_class_sessions_week
        FOREIGN KEY (semester_week_id) REFERENCES semester_weeks(semester_week_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_class_sessions_room
        FOREIGN KEY (room_id) REFERENCES rooms(room_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_class_sessions_lecturer
        FOREIGN KEY (lecturer_id) REFERENCES lecturers(lecturer_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE time_slots (
    slot_no     INT PRIMARY KEY,
    slot_label  VARCHAR(20) NOT NULL,
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_time_slots_no CHECK (slot_no > 0),
    CONSTRAINT chk_time_slots_time CHECK (end_time > start_time),
    CONSTRAINT uq_time_slots_label UNIQUE (slot_label)
) ENGINE=InnoDB;



CREATE TABLE tuition_rates (
    tuition_rate_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    enrollment_year YEAR NOT NULL,
    price_per_credit DECIMAL(12,2) NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_tuition_rates_year UNIQUE (enrollment_year),
    CONSTRAINT chk_tuition_rates_price CHECK (price_per_credit >= 0)
) ENGINE=InnoDB;

INSERT INTO tuition_rates (enrollment_year, price_per_credit)
VALUES
(2022, 450000),
(2023, 500000),
(2024, 650000),
(2025, 750000);








CREATE INDEX idx_class_sessions_week_date
    ON class_sessions (semester_week_id, session_date);

CREATE INDEX idx_class_sessions_section_date
    ON class_sessions (section_id, session_date);

CREATE INDEX idx_class_sessions_lecturer_date
    ON class_sessions (lecturer_id, session_date);

CREATE INDEX idx_class_sessions_room_date
    ON class_sessions (room_id, session_date);
    
    




DROP TRIGGER IF EXISTS trg_class_sessions_no_overlap_update;
DELIMITER $$

CREATE TRIGGER trg_class_sessions_no_overlap_update
BEFORE UPDATE ON class_sessions
FOR EACH ROW
BEGIN
    -- Trùng phòng trong cùng ngày
    IF NEW.room_id IS NOT NULL AND EXISTS (
        SELECT 1
        FROM class_sessions cs
        WHERE cs.session_id <> OLD.session_id
          AND cs.session_date = NEW.session_date
          AND cs.room_id = NEW.room_id
          AND NOT (NEW.slot_end < cs.slot_start OR NEW.slot_start > cs.slot_end)
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Room schedule overlap in class_sessions';
    END IF;

    -- Trùng giảng viên trong cùng ngày
    IF NEW.lecturer_id IS NOT NULL AND EXISTS (
        SELECT 1
        FROM class_sessions cs
        WHERE cs.session_id <> OLD.session_id
          AND cs.session_date = NEW.session_date
          AND cs.lecturer_id = NEW.lecturer_id
          AND NOT (NEW.slot_end < cs.slot_start OR NEW.slot_start > cs.slot_end)
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lecturer schedule overlap in class_sessions';
    END IF;

    -- Trùng lớp học phần trong cùng ngày
    IF EXISTS (
        SELECT 1
        FROM class_sessions cs
        WHERE cs.session_id <> OLD.session_id
          AND cs.session_date = NEW.session_date
          AND cs.section_id = NEW.section_id
          AND NOT (NEW.slot_end < cs.slot_start OR NEW.slot_start > cs.slot_end)
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Section schedule overlap in class_sessions';
    END IF;
END$$

DELIMITER ;







-- 12) Optional time slots (neu service cua ban co dung)
INSERT INTO time_slots (slot_no, slot_label, start_time, end_time)
VALUES
(1, 'Tiết 1', '07:00:00', '07:50:00'),
(2, 'Tiết 2', '07:50:00', '08:40:00'),
(3, 'Tiết 3', '08:50:00', '09:40:00'),
(4, 'Tiết 4', '09:40:00', '10:30:00'),
(5, 'Tiết 5', '10:40:00', '11:30:00'),
(6, 'Tiết 6', '13:00:00', '13:50:00'),
(7, 'Tiết 7', '13:50:00', '14:40:00'),
(8, 'Tiết 8', '14:50:00', '15:40:00'),
(9, 'Tiết 9', '15:40:00', '16:30:00'),
(10, 'Tiết 10', '16:40:00', '17:30:00'),
(11, 'Tiết 11', '18:00:00', '18:50:00'),
(12, 'Tiết 12', '18:50:00', '19:40:00')
ON DUPLICATE KEY UPDATE
  slot_label = VALUES(slot_label),
  start_time = VALUES(start_time),
  end_time = VALUES(end_time);


CREATE TABLE academic_calendar_blocks (
    calendar_block_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    semester_id BIGINT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    block_type ENUM('holiday', 'break', 'exam_week', '') NOT NULL DEFAULT 'holiday',
    title VARCHAR(150) NOT NULL,
    is_teaching_allowed BOOLEAN NOT NULL DEFAULT FALSE,
    note VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_calendar_blocks_date CHECK (end_date >= start_date),
    CONSTRAINT fk_calendar_blocks_semester
        FOREIGN KEY (semester_id) REFERENCES semesters(semester_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_calendar_blocks_range
ON academic_calendar_blocks (semester_id, start_date, end_date);








SET @pwd = '$2a$10$gKee76JuMKMlvyoEtD4qEuBDp6dYaudD4BB6HasUOKMqERvVZuzpm'; -- bcrypt '123456'

-- ============================================================
-- 1. DEPARTMENTS
-- ============================================================
INSERT IGNORE INTO departments (department_code, department_name, created_at, updated_at) VALUES
  ('CNTT', 'Công nghệ thông tin', NOW(), NOW()),
  ('KT',   'Kinh tế',             NOW(), NOW()),
  ('DT',   'Điện tử',             NOW(), NOW());


-- ============================================================
-- 2. PROGRAMS
-- Viết tắt ngành dùng trong mã sinh viên:
--   KHMT -> KH  | CNPM -> PM  | MKT -> MK  | KTOAN -> KT  | IOT -> IO
-- ============================================================
INSERT INTO programs (department_id, program_code, program_name, total_credits, status, created_at, updated_at)
SELECT d.department_id, 'KHMT', 'Khoa học máy tính', 150, 'active', NOW(), NOW()
FROM departments d WHERE d.department_code = 'CNTT'
ON DUPLICATE KEY UPDATE
    program_name = VALUES(program_name),
    total_credits = VALUES(total_credits),
    status = VALUES(status),
    updated_at = NOW();

INSERT INTO programs (department_id, program_code, program_name, total_credits, status, created_at, updated_at)
SELECT d.department_id, 'CNPM', 'Công nghệ phần mềm', 150, 'active', NOW(), NOW()
FROM departments d WHERE d.department_code = 'CNTT'
ON DUPLICATE KEY UPDATE
    program_name = VALUES(program_name),
    total_credits = VALUES(total_credits),
    status = VALUES(status),
    updated_at = NOW();

INSERT INTO programs (department_id, program_code, program_name, total_credits, status, created_at, updated_at)
SELECT d.department_id, 'MKT', 'Marketing', 130, 'active', NOW(), NOW()
FROM departments d WHERE d.department_code = 'KT'
ON DUPLICATE KEY UPDATE
    program_name = VALUES(program_name),
    total_credits = VALUES(total_credits),
    status = VALUES(status),
    updated_at = NOW();

INSERT INTO programs (department_id, program_code, program_name, total_credits, status, created_at, updated_at)
SELECT d.department_id, 'KTOAN', 'Kế toán', 130, 'active', NOW(), NOW()
FROM departments d WHERE d.department_code = 'KT'
ON DUPLICATE KEY UPDATE
    program_name = VALUES(program_name),
    total_credits = VALUES(total_credits),
    status = VALUES(status),
    updated_at = NOW();

INSERT INTO programs (department_id, program_code, program_name, total_credits, status, created_at, updated_at)
SELECT d.department_id, 'IOT', 'Internet of Things', 150, 'active', NOW(), NOW()
FROM departments d WHERE d.department_code = 'DT'
ON DUPLICATE KEY UPDATE
    program_name = VALUES(program_name),
    total_credits = VALUES(total_credits),
    status = VALUES(status),
    updated_at = NOW();


-- ============================================================
-- 3. USERS
-- ============================================================
INSERT IGNORE INTO users
(username, password_hash, email, force_password_change, role, status)
VALUES
  ('admin01',  @pwd, 'admin01@ptit.edu.vn', FALSE, 'admin',    'active');




