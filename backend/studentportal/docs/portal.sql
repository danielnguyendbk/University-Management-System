-- DROP DATABASE IF EXISTS portal;

CREATE DATABASE IF NOT EXISTS portal
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE portal;

-- =====================================
-- 1. USERS
-- 1. USERS
-- =====================================
CREATE TABLE users (
    user_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
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
    gender           ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    phone            VARCHAR(20)  NULL,
    permanent_address VARCHAR(255) NULL,
    current_address   VARCHAR(255) NULL,
    enrollment_year  YEAR NULL,               -- đổi từ cohort VARCHAR -> rõ nghĩa hơn
    academic_status  ENUM('STUDYING', 'PAUSED', 'GRADUATED', 'DROP_OUT') NOT NULL DEFAULT 'STUDYING',
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
    work_email      VARCHAR(100) NOT NULL UNIQUE,   -- email trường cấp (khác users.email)
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

-- =====================================
-- 10. SEMESTERS
-- =====================================
CREATE TABLE semesters (
    semester_id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    semester_code      VARCHAR(50) NOT NULL,
    semester_year      VARCHAR(20) NOT NULL,
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
    slot_start   INT NOT NULL,      -- đổi từ period_start -> slot_start
    slot_end     INT NOT NULL,      -- đổi từ period_end   -> slot_end
    start_time   TIME NOT NULL,
    end_time     TIME NOT NULL,
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
ALTER TABLE schedules
ADD COLUMN session_type ENUM('THEORY', 'PRACTICE')
NOT NULL DEFAULT 'THEORY'
AFTER end_time;


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
    exam_method ENUM('WRITTEN', 'ORAL', 'PRACTICAL', 'ONLINE') NULL,
    exam_date           DATE NOT NULL,
    start_time          TIME NOT NULL,
    end_time            TIME NOT NULL,
    seat_range VARCHAR(100) NULL,
    student_count INT NULL,
    status ENUM('DRAFT', 'SCHEDULED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'SCHEDULED',
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
        ON UPDATE CASCADE ON DELETE SET NULL,
	CONSTRAINT fk_exams_semester
		FOREIGN KEY (semester_id) REFERENCES semesters(semester_id)
		ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;


CREATE TABLE student_classes (
    class_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    class_code VARCHAR(50) NOT NULL UNIQUE,

    department_id BIGINT UNSIGNED NOT NULL,
    program_id BIGINT UNSIGNED NOT NULL,
    specialization_code VARCHAR(50) NULL,

    cohort_year YEAR NOT NULL,

    class_type VARCHAR(80) NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_student_classes_department
        FOREIGN KEY (department_id) REFERENCES departments(department_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_student_classes_program
        FOREIGN KEY (program_id) REFERENCES programs(program_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE exam_invigilators (
    exam_id BIGINT UNSIGNED NOT NULL,
    lecturer_id BIGINT UNSIGNED NOT NULL,
    role ENUM('MAIN', 'ASSISTANT') NOT NULL DEFAULT 'ASSISTANT',
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
ALTER TABLE enrollments
ADD COLUMN dropped_at DATETIME NULL AFTER registered_at,
ADD COLUMN note VARCHAR(255) NULL AFTER dropped_at;

CREATE TABLE enrollment_logs (
    log_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL,
    section_id BIGINT UNSIGNED NOT NULL,
    action ENUM('REGISTER', 'DROP', 'ADMIN_REGISTER', 'ADMIN_DROP') NOT NULL,
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
    midterm_score    DECIMAL(4,2) NULL,
    final_score      DECIMAL(4,2) NULL,
    -- Generated: 10% chuyên cần + 30% giữa kỳ + 60% cuối kỳ
    total_score      DECIMAL(4,2) ,
    letter_grade     VARCHAR(5) NULL,
    result           ENUM('pass', 'fail', 'incomplete') NULL,
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
    final_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    status          ENUM('unpaid', 'partial', 'paid', 'overdue', 'waived') NOT NULL DEFAULT 'unpaid',
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
    




CREATE TABLE semester_weeks (
    semester_week_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    semester_id      BIGINT UNSIGNED NOT NULL,
    week_no          INT NOT NULL,
    start_date       DATE NOT NULL,
    end_date         DATE NOT NULL,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_semester_week UNIQUE (semester_id, week_no),
    CONSTRAINT chk_semester_weeks_date CHECK (end_date >= start_date),
    CONSTRAINT fk_semester_weeks_semester
        FOREIGN KEY (semester_id) REFERENCES semesters(semester_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;
ALTER TABLE semester_weeks
MODIFY created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
MODIFY updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

CREATE TABLE class_sessions (
    session_id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    schedule_id       BIGINT UNSIGNED NULL,
    section_id        BIGINT UNSIGNED NOT NULL,
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
ALTER TABLE time_slots
MODIFY created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
MODIFY updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

DROP TRIGGER IF EXISTS trg_course_prereq_no_self_insert;
DELIMITER $$

CREATE TRIGGER trg_course_prereq_no_self_insert
BEFORE INSERT ON course_prerequisites
FOR EACH ROW
BEGIN
    IF NEW.course_id = NEW.prerequisite_course_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A course cannot be its own prerequisite';
    END IF;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trg_course_prereq_no_self_update;
DELIMITER $$

CREATE TRIGGER trg_course_prereq_no_self_update
BEFORE UPDATE ON course_prerequisites
FOR EACH ROW
BEGIN
    IF NEW.course_id = NEW.prerequisite_course_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A course cannot be its own prerequisite';
    END IF;
END$$

DELIMITER ;


CREATE INDEX idx_class_sessions_week_date
    ON class_sessions (semester_week_id, session_date);

CREATE INDEX idx_class_sessions_section_date
    ON class_sessions (section_id, session_date);

CREATE INDEX idx_class_sessions_lecturer_date
    ON class_sessions (lecturer_id, session_date);

CREATE INDEX idx_class_sessions_room_date
    ON class_sessions (room_id, session_date);
    
    
    DROP TRIGGER IF EXISTS trg_schedules_no_overlap_insert;
DELIMITER $$

CREATE TRIGGER trg_schedules_no_overlap_insert
BEFORE INSERT ON schedules
FOR EACH ROW
BEGIN
    -- Phòng bị trùng lịch theo ngày trong tuần
    IF EXISTS (
        SELECT 1
        FROM schedules s
        WHERE s.room_id = NEW.room_id
          AND s.day_of_week = NEW.day_of_week
          AND NOT (NEW.slot_end < s.slot_start OR NEW.slot_start > s.slot_end)
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Room schedule overlap in schedules';
    END IF;

    -- Lớp học phần bị trùng lịch theo ngày trong tuần
    IF EXISTS (
        SELECT 1
        FROM schedules s
        WHERE s.section_id = NEW.section_id
          AND s.day_of_week = NEW.day_of_week
          AND NOT (NEW.slot_end < s.slot_start OR NEW.slot_start > s.slot_end)
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Section schedule overlap in schedules';
    END IF;
END$$

DELIMITER ;


DROP TRIGGER IF EXISTS trg_schedules_no_overlap_update;
DELIMITER $$

CREATE TRIGGER trg_schedules_no_overlap_update
BEFORE UPDATE ON schedules
FOR EACH ROW
BEGIN
    -- Phòng bị trùng lịch theo ngày trong tuần
    IF EXISTS (
        SELECT 1
        FROM schedules s
        WHERE s.schedule_id <> OLD.schedule_id
          AND s.room_id = NEW.room_id
          AND s.day_of_week = NEW.day_of_week
          AND NOT (NEW.slot_end < s.slot_start OR NEW.slot_start > s.slot_end)
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Room schedule overlap in schedules';
    END IF;

    -- Lớp học phần bị trùng lịch theo ngày trong tuần
    IF EXISTS (
        SELECT 1
        FROM schedules s
        WHERE s.schedule_id <> OLD.schedule_id
          AND s.section_id = NEW.section_id
          AND s.day_of_week = NEW.day_of_week
          AND NOT (NEW.slot_end < s.slot_start OR NEW.slot_start > s.slot_end)
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Section schedule overlap in schedules';
    END IF;
END$$

DELIMITER ;


DROP TRIGGER IF EXISTS trg_class_sessions_no_overlap_insert;
DELIMITER $$

CREATE TRIGGER trg_class_sessions_no_overlap_insert
BEFORE INSERT ON class_sessions
FOR EACH ROW
BEGIN
    -- Trùng phòng trong cùng ngày
    IF NEW.room_id IS NOT NULL AND EXISTS (
        SELECT 1
        FROM class_sessions cs
        WHERE cs.session_date = NEW.session_date
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
        WHERE cs.session_date = NEW.session_date
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
        WHERE cs.session_date = NEW.session_date
          AND cs.section_id = NEW.section_id
          AND NOT (NEW.slot_end < cs.slot_start OR NEW.slot_start > cs.slot_end)
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Section schedule overlap in class_sessions';
    END IF;
END$$

DELIMITER ;


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


select * from users;
-- 1) Department
INSERT INTO departments (department_id, department_code, department_name)
VALUES (1, 'CNTT', 'Công nghệ thông tin')
ON DUPLICATE KEY UPDATE
  department_name = VALUES(department_name);

-- 2) Program
INSERT INTO programs (program_id, department_id, program_code, program_name, total_credits, status)
VALUES (1, 1, 'CNTT-K2023', 'Công nghệ thông tin K2023', 150, 'active')
ON DUPLICATE KEY UPDATE
  department_id = VALUES(department_id),
  program_name = VALUES(program_name),
  total_credits = VALUES(total_credits),
  status = VALUES(status);

-- 4) Lecturer
INSERT INTO lecturers (lecturer_id, user_id, department_id, lecturer_code, full_name, work_email, phone, academic_title)
VALUES (1, 2, 1, 'GV001', 'Nguyễn Văn A', 'gv001@ptit.edu.vn', '0901000001', 'ThS.')
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  department_id = VALUES(department_id),
  full_name = VALUES(full_name),
  work_email = VALUES(work_email),
  phone = VALUES(phone),
  academic_title = VALUES(academic_title);

-- 5) Student
INSERT INTO students (
  student_id, user_id, program_id, student_code, full_name,
  date_of_birth, gender, phone, permanent_address, current_address,
  enrollment_year, academic_status
)
VALUES (
  1, 3, 1, 'B23DCCN001', 'Lê Văn B',
  '2005-01-15', 'male', '0902000001', 'Hà Nội', 'Hà Nội',
  2023, 'studying'
)
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  program_id = VALUES(program_id),
  full_name = VALUES(full_name),
  date_of_birth = VALUES(date_of_birth),
  gender = VALUES(gender),
  phone = VALUES(phone),
  permanent_address = VALUES(permanent_address),
  current_address = VALUES(current_address),
  enrollment_year = VALUES(enrollment_year),
  academic_status = VALUES(academic_status);

-- 6) Semester
INSERT INTO semesters (
  semester_id, semester_name, academic_year, start_date, end_date,
  registration_open, registration_close
)
VALUES (
  1, 'Học kỳ 1', '2026-2027', '2026-09-01', '2026-12-31',
  '2026-08-15 08:00:00', '2026-08-31 23:59:59'
)
ON DUPLICATE KEY UPDATE
  semester_name = VALUES(semester_name),
  academic_year = VALUES(academic_year),
  start_date = VALUES(start_date),
  end_date = VALUES(end_date),
  registration_open = VALUES(registration_open),
  registration_close = VALUES(registration_close);
  




-- 8) Rooms
INSERT INTO rooms (room_id, room_code, building, room_type, capacity)
VALUES
(1, 'A101', 'Nhà A', 'classroom', 60),
(2, 'A102', 'Nhà A', 'classroom', 60),
(3, 'B201', 'Nhà B', 'lab', 40)
ON DUPLICATE KEY UPDATE
  room_code = VALUES(room_code),
  building = VALUES(building),
  room_type = VALUES(room_type),
  capacity = VALUES(capacity);

-- 9) Course
INSERT INTO courses (
  course_id, department_id, course_code, course_name, credits,
  course_type, is_active, description
)
VALUES
(1, 1, 'INT1306', 'Lập trình Web', 3, 'required', TRUE, 'Môn học lập trình web')
ON DUPLICATE KEY UPDATE
  department_id = VALUES(department_id),
  course_code = VALUES(course_code),
  course_name = VALUES(course_name),
  credits = VALUES(credits),
  course_type = VALUES(course_type),
  is_active = VALUES(is_active),
  description = VALUES(description);

-- 10) Course section
INSERT INTO course_sections (
  section_id, course_id, semester_id, lecturer_id, section_code,
  max_capacity, status
)
VALUES
(1, 1, 1, 1, 'INT1306.01', 50, 'open')
ON DUPLICATE KEY UPDATE
  course_id = VALUES(course_id),
  semester_id = VALUES(semester_id),
  lecturer_id = VALUES(lecturer_id),
  section_code = VALUES(section_code),
  max_capacity = VALUES(max_capacity),
  status = VALUES(status);

-- 11) Enrollment: student sv001 hoc lop hoc phan 1
INSERT INTO enrollments (enrollment_id, student_id, section_id, enrollment_status, registered_at)
VALUES
(1, 1, 1, 'registered', NOW())
ON DUPLICATE KEY UPDATE
  student_id = VALUES(student_id),
  section_id = VALUES(section_id),
  enrollment_status = VALUES(enrollment_status);

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

-- =========================
-- Kiem tra nhanh
-- =========================
select * from users;
SELECT user_id, username, role, status FROM users WHERE user_id IN (1,2,3);
SELECT lecturer_id, lecturer_code, full_name FROM lecturers WHERE lecturer_id = 1;
SELECT student_id, student_code, full_name FROM students WHERE student_id = 1;
SELECT section_id, section_code, lecturer_id, semester_id FROM course_sections WHERE section_id = 1;
SELECT semester_week_id, week_no, start_date, end_date FROM semester_weeks WHERE semester_id = 1 ORDER BY week_no;
SELECT enrollment_id, student_id, section_id, enrollment_status FROM enrollments WHERE enrollment_id = 1;

-- Map user id theo username thực tế
SET @lecturer_user_id := (SELECT user_id FROM users WHERE username = 'lecturer01' LIMIT 1);
SET @student_user_id  := (SELECT user_id FROM users WHERE username = 'student01'  LIMIT 1);

-- Lecturer profile
INSERT INTO lecturers (lecturer_id, user_id, department_id, lecturer_code, full_name, work_email, phone, academic_title)
VALUES (1, @lecturer_user_id, 1, 'GV001', 'Nguyen Van A', 'gv001@ptit.edu.vn', '0901000001', 'ThS.')
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  department_id = VALUES(department_id);

-- Student profile
INSERT INTO students (
  student_id, user_id, program_id, student_code, full_name, date_of_birth, gender,
  phone, permanent_address, current_address, enrollment_year, academic_status
)
VALUES (1, @student_user_id, 1, 'B23DCCN001', 'Le Van B', '2005-01-15', 'male',
        '0902000001', 'Ha Noi', 'Ha Noi', 2023, 'studying')
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  program_id = VALUES(program_id);

-- Enrollment
INSERT INTO enrollments (enrollment_id, student_id, section_id, enrollment_status, registered_at)
VALUES (1, 1, 1, 'registered', NOW())
ON DUPLICATE KEY UPDATE
  enrollment_status = VALUES(enrollment_status);

-- Timetable sessions (đây là dữ liệu API cần)
INSERT INTO class_sessions (
  session_id, schedule_id, section_id, semester_week_id, session_date, room_id, lecturer_id,
  slot_start, slot_end, start_time, end_time, session_status, note
) VALUES
(1, NULL, 1, 1, '2026-09-02', 1, 1, 1, 3, '07:00:00', '09:40:00', 'scheduled', 'Week 1'),
(2, NULL, 1, 2, '2026-09-09', 1, 1, 1, 3, '07:00:00', '09:40:00', 'scheduled', 'Week 2'),
(3, NULL, 1, 3, '2026-09-16', 1, 1, 1, 3, '07:00:00', '09:40:00', 'scheduled', 'Week 3'),
(4, NULL, 1, 4, '2026-09-23', 1, 1, 1, 3, '07:00:00', '09:40:00', 'scheduled', 'Week 4')
ON DUPLICATE KEY UPDATE
  room_id = VALUES(room_id),
  lecturer_id = VALUES(lecturer_id),
  slot_start = VALUES(slot_start),
  slot_end = VALUES(slot_end),
  start_time = VALUES(start_time),
  end_time = VALUES(end_time),
  session_status = VALUES(session_status),
  note = VALUES(note);
  
  ALTER TABLE enrollments
ADD COLUMN practice_group_no TINYINT UNSIGNED NOT NULL DEFAULT 0
AFTER section_id;

ALTER TABLE class_sessions
ADD COLUMN practice_group_no TINYINT UNSIGNED NOT NULL DEFAULT 0
AFTER session_type;

ALTER TABLE schedules
ADD COLUMN practice_group_no TINYINT UNSIGNED NOT NULL DEFAULT 0
AFTER session_type;



CREATE TABLE academic_calendar_blocks (
    calendar_block_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    semester_id BIGINT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    block_type ENUM('HOLIDAY', 'BREAK', 'EXAM_WEEK', 'EVENT') NOT NULL DEFAULT 'HOLIDAY',
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

-- thêm trường tuần
ALTER TABLE schedules
ADD COLUMN from_week_no INT NULL AFTER day_of_week,
ADD COLUMN to_week_no INT NULL AFTER from_week_no,
ADD COLUMN status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE' AFTER practice_group_no,
ADD COLUMN note VARCHAR(255) NULL AFTER status;

-- update tuần
UPDATE semester_weeks
SET start_date = '2026-08-31', end_date = '2026-09-06'
WHERE semester_id = 1 AND week_no = 1;

UPDATE semester_weeks
SET start_date = '2026-09-07', end_date = '2026-09-13'
WHERE semester_id = 1 AND week_no = 2;

UPDATE semester_weeks
SET start_date = '2026-09-14', end_date = '2026-09-20'
WHERE semester_id = 1 AND week_no = 3;

UPDATE semester_weeks
SET start_date = '2026-09-21', end_date = '2026-09-27'
WHERE semester_id = 1 AND week_no = 4;

-- tòa
CREATE TABLE buildings (
    building_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    building_code VARCHAR(20) NOT NULL UNIQUE,
    building_name VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


ALTER TABLE rooms
ADD COLUMN building_id BIGINT UNSIGNED NULL AFTER room_code;

ALTER TABLE rooms
ADD CONSTRAINT fk_rooms_building
FOREIGN KEY (building_id) REFERENCES buildings(building_id)
ON UPDATE CASCADE ON DELETE SET NULL;

INSERT INTO buildings (building_id, building_code, building_name)
VALUES
(1, 'A', 'Tòa A'),
(2, 'B', 'Tòa B')
ON DUPLICATE KEY UPDATE
building_name = VALUES(building_name);


-- update
SET SQL_SAFE_UPDATES = 0;

INSERT INTO buildings (building_id, building_code, building_name)
VALUES
(1, 'A', 'Tòa A'),
(2, 'B', 'Tòa B')
ON DUPLICATE KEY UPDATE
building_name = VALUES(building_name);

UPDATE rooms 
SET building_id = 1 
WHERE building = 'Tòa A';

UPDATE rooms 
SET building_id = 2 
WHERE building = 'Tòa B';

SET SQL_SAFE_UPDATES = 1;


