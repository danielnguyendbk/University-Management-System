-- ============================================================
-- SEED DATA -- Student Portal (MySQL)
-- Quy ước: username = student_code = lecturer_code
-- Tài khoản test (password: 123456):
--   admin01
--   GV001, GV002, GV003
--   D23KH001, D23KH002   (Khoa học máy tính - K2023)
--   D23PM001, D23PM002   (Công nghệ phần mềm - K2023)
--   D24MK001             (Marketing - K2024)
--   D24IO001             (Internet of Things - K2024)
--   D24KT001             (Kế toán - K2024)
-- Chạy lại nhiều lần vẫn an toàn (INSERT IGNORE / ON DUPLICATE KEY)
-- ============================================================

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
ON DUPLICATE KEY UPDATE program_name = VALUES(program_name), updated_at = NOW();

INSERT INTO programs (department_id, program_code, program_name, total_credits, status, created_at, updated_at)
SELECT d.department_id, 'CNPM', 'Công nghệ phần mềm', 150, 'active', NOW(), NOW()
FROM departments d WHERE d.department_code = 'CNTT'
ON DUPLICATE KEY UPDATE program_name = VALUES(program_name), updated_at = NOW();

INSERT INTO programs (department_id, program_code, program_name, total_credits, status, created_at, updated_at)
SELECT d.department_id, 'MKT', 'Marketing', 130, 'active', NOW(), NOW()
FROM departments d WHERE d.department_code = 'KT'
ON DUPLICATE KEY UPDATE program_name = VALUES(program_name), updated_at = NOW();

INSERT INTO programs (department_id, program_code, program_name, total_credits, status, created_at, updated_at)
SELECT d.department_id, 'KTOAN', 'Kế toán', 130, 'active', NOW(), NOW()
FROM departments d WHERE d.department_code = 'KT'
ON DUPLICATE KEY UPDATE program_name = VALUES(program_name), updated_at = NOW();

INSERT INTO programs (department_id, program_code, program_name, total_credits, status, created_at, updated_at)
SELECT d.department_id, 'IOT', 'Internet of Things', 150, 'active', NOW(), NOW()
FROM departments d WHERE d.department_code = 'DT'
ON DUPLICATE KEY UPDATE program_name = VALUES(program_name), updated_at = NOW();

-- ============================================================
-- 3. USERS
-- ============================================================
INSERT IGNORE INTO users (username, password_hash, email, force_password_change, role, status) VALUES
  -- Admin
  ('admin01',   @pwd, 'admin01@ptit.edu.vn',          FALSE, 'admin',    'active'),
  -- Giảng viên (username = lecturer_code)
  ('GV001',     @pwd, 'tcpeduvn+GV001@gmail.com',     FALSE, 'lecturer', 'active'),
  ('GV002',     @pwd, 'tcpeduvn+GV002@gmail.com',     FALSE, 'lecturer', 'active'),
  ('GV003',     @pwd, 'tcpeduvn+GV003@gmail.com',     FALSE, 'lecturer', 'active'),
  -- Sinh viên K2023 - KHMT (username = student_code)
  ('D23KH001',  @pwd, 'tcpeduvn+D23KH001@gmail.com',  FALSE, 'student',  'active'),
  ('D23KH002',  @pwd, 'tcpeduvn+D23KH002@gmail.com',  FALSE, 'student',  'active'),
  -- Sinh viên K2023 - CNPM
  ('D23PM001',  @pwd, 'tcpeduvn+D23PM001@gmail.com',  FALSE, 'student',  'active'),
  ('D23PM002',  @pwd, 'tcpeduvn+D23PM002@gmail.com',  FALSE, 'student',  'active'),
  -- Sinh viên K2024 - các ngành khác
  ('D24MK001',  @pwd, 'tcpeduvn+D24MK001@gmail.com',  FALSE, 'student',  'active'),
  ('D24IO001',  @pwd, 'tcpeduvn+D24IO001@gmail.com',  FALSE, 'student',  'active'),
  ('D24KT001',  @pwd, 'tcpeduvn+D24KT001@gmail.com',  FALSE, 'student',  'active');

-- ============================================================
-- 4. LECTURERS (lecturer_code = username)
-- ============================================================
INSERT INTO lecturers (user_id, department_id, lecturer_code, full_name, phone, academic_title, created_at, updated_at)
SELECT u.user_id, d.department_id, m.code, m.fullname, m.phone, m.title, NOW(), NOW()
FROM (
  SELECT 'GV001' AS uname, 'GV001' AS code, 'Bùi Xuân Phú'      AS fullname, '0911000001' AS phone, 'Tiến sĩ' AS title, 'CNTT' AS dept UNION ALL
  SELECT 'GV002',          'GV002',          'Nguyễn Minh Châu',              '0911000002',          'Thạc sĩ',          'DT'          UNION ALL
  SELECT 'GV003',          'GV003',          'Nguyễn Quốc Thái',                  '0911000003',          'Thạc sĩ',          'KT'
) m
JOIN users u        ON u.username        = m.uname
JOIN departments d  ON d.department_code = m.dept
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name), phone = VALUES(phone),
  academic_title = VALUES(academic_title), updated_at = NOW();

-- ============================================================
-- 5. STUDENTS (student_code = username)
-- ============================================================
INSERT INTO students (user_id, program_id, student_code, full_name, date_of_birth, gender, academic_status, created_at, updated_at)
SELECT u.user_id, p.program_id, m.code, m.fullname, m.dob, m.gender, m.astatus, NOW(), NOW()
FROM (
  SELECT 'D23KH001' AS uname, 'D23KH001' AS code, 'KHMT'  AS prog, 'Lê Minh Hùng'    AS fullname, '2003-05-10' AS dob, 'male'   AS gender, 'studying'  AS astatus UNION ALL
  SELECT 'D23KH002',          'D23KH002',          'KHMT',          'Ngô Thùy Duyên',              '2003-08-22',         'female',            'studying'            UNION ALL
  SELECT 'D23PM001',          'D23PM001',          'CNPM',          'Đặng Quốc Anh',               '2003-01-15',         'male',              'studying'            UNION ALL
  SELECT 'D23PM002',          'D23PM002',          'CNPM',          'Trần Hữu Nghĩa',              '2003-11-30',         'male',              'paused'              UNION ALL
  SELECT 'D24MK001',          'D24MK001',          'MKT',           'Vũ Thanh Hà',                 '2004-03-18',         'female',            'studying'            UNION ALL
  SELECT 'D24IO001',          'D24IO001',          'IOT',           'Phạm Văn Khoa',               '2004-07-25',         'male',              'studying'            UNION ALL
  SELECT 'D24KT001',          'D24KT001',          'KTOAN',         'Hoàng Thị Mai',               '2004-09-05',         'female',            'studying'
) m
JOIN users u    ON u.username    = m.uname
JOIN programs p ON p.program_code = m.prog
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name), academic_status = VALUES(academic_status), updated_at = NOW();

-- ============================================================
-- 6. COURSES
-- ============================================================
INSERT IGNORE INTO courses (department_id, course_code, course_name, credits, course_type, is_active)
SELECT d.department_id, m.code, m.name, m.credits, m.ctype, TRUE
FROM (
  SELECT 'CSE101' AS code, 'Lập trình cơ bản'     AS name, 3 AS credits, 'required' AS ctype, 'CNTT' AS dept UNION ALL
  SELECT 'CSE102',         'Cấu trúc dữ liệu',                3,          'required',          'CNTT'         UNION ALL
  SELECT 'CSE103',         'Cơ sở dữ liệu',                   3,          'required',          'CNTT'         UNION ALL
  SELECT 'MTH101',         'Giải tích 1',                      3,          'required',          'CNTT'         UNION ALL
  SELECT 'MTH102',         'Đại số tuyến tính',                3,          'required',          'CNTT'         UNION ALL
  SELECT 'ECO101',         'Kinh tế vi mô',                    3,          'required',          'KT'           UNION ALL
  SELECT 'ACC101',         'Nguyên lý kế toán',                3,          'required',          'KT'
) m
JOIN departments d ON d.department_code = m.dept;

-- ============================================================
-- 7. COURSE PREREQUISITES
-- CSE102 yêu cầu CSE101 | CSE103 yêu cầu CSE102
-- ============================================================
INSERT IGNORE INTO course_prerequisites (course_id, prerequisite_course_id)
SELECT c.course_id, pre.course_id
FROM courses c, courses pre
WHERE (c.course_code = 'CSE102' AND pre.course_code = 'CSE101')
   OR (c.course_code = 'CSE103' AND pre.course_code = 'CSE102');

-- ============================================================
-- 8. PROGRAM_COURSES
-- ============================================================
INSERT IGNORE INTO program_courses (program_id, course_id, recommended_semester, is_required)
SELECT p.program_id, c.course_id, m.sem, TRUE
FROM (
  SELECT 'KHMT'  AS prog, 'CSE101' AS course, 1 AS sem UNION ALL
  SELECT 'KHMT',          'CSE102',            2        UNION ALL
  SELECT 'KHMT',          'CSE103',            3        UNION ALL
  SELECT 'KHMT',          'MTH101',            1        UNION ALL
  SELECT 'KHMT',          'MTH102',            2        UNION ALL
  SELECT 'CNPM',          'CSE101',            1        UNION ALL
  SELECT 'CNPM',          'CSE102',            2        UNION ALL
  SELECT 'CNPM',          'CSE103',            3        UNION ALL
  SELECT 'CNPM',          'MTH101',            1        UNION ALL
  SELECT 'MKT',           'ECO101',            1        UNION ALL
  SELECT 'KTOAN',         'ECO101',            1        UNION ALL
  SELECT 'KTOAN',         'ACC101',            2
) m
JOIN programs p ON p.program_code = m.prog
JOIN courses c  ON c.course_code  = m.course;

-- ============================================================
-- 9. SEMESTERS
-- ============================================================
INSERT INTO semesters (semester_name, academic_year, start_date, end_date, registration_open, registration_close)
SELECT 'HK1 2023-2024', '2023-2024', '2023-09-01', '2024-01-15', '2023-08-01', '2023-08-31'
WHERE NOT EXISTS (SELECT 1 FROM semesters WHERE semester_name = 'HK1 2023-2024');

INSERT INTO semesters (semester_name, academic_year, start_date, end_date, registration_open, registration_close)
SELECT 'HK2 2023-2024', '2023-2024', '2024-02-01', '2024-06-15', '2024-01-10', '2024-01-31'
WHERE NOT EXISTS (SELECT 1 FROM semesters WHERE semester_name = 'HK2 2023-2024');

INSERT INTO semesters (semester_name, academic_year, start_date, end_date, registration_open, registration_close)
SELECT 'HK1 2024-2025', '2024-2025', '2024-09-01', '2025-01-15', '2024-08-01', '2024-08-31'
WHERE NOT EXISTS (SELECT 1 FROM semesters WHERE semester_name = 'HK1 2024-2025');

-- ============================================================
-- 10. ROOMS
-- ============================================================
INSERT IGNORE INTO rooms (room_code, building, room_type, capacity) VALUES
  ('A101', 'Tòa A', 'classroom', 60),
  ('A102', 'Tòa A', 'classroom', 60),
  ('B101', 'Tòa B', 'lab',       50),
  ('B201', 'Tòa B', 'lab',       50),
  ('B301', 'Tòa B', 'exam_room', 60);

-- ============================================================
-- 11. COURSE SECTIONS (HK1 2024-2025)
-- ============================================================
SET @sem = (SELECT semester_id FROM semesters WHERE semester_name = 'HK1 2024-2025' LIMIT 1);

INSERT IGNORE INTO course_sections (course_id, semester_id, lecturer_id, section_code, max_capacity, status)
SELECT c.course_id, @sem, lec.lecturer_id, m.sec_code, 30, 'open'
FROM (
  SELECT 'CSE101' AS course, 'CSE101.1' AS sec_code, 'GV001' AS lec_code UNION ALL
  SELECT 'CSE102',           'CSE102.1',              'GV001'             UNION ALL
  SELECT 'CSE103',           'CSE103.1',              'GV002'             UNION ALL
  SELECT 'MTH101',           'MTH101.1',              'GV002'             UNION ALL
  SELECT 'MTH102',           'MTH102.1',              'GV002'             UNION ALL
  SELECT 'ECO101',           'ECO101.1',              'GV003'             UNION ALL
  SELECT 'ACC101',           'ACC101.1',              'GV003'
) m
JOIN courses    c   ON c.course_code    = m.course
JOIN lecturers  lec ON lec.lecturer_code = m.lec_code;

-- ============================================================
-- 12. SCHEDULES
-- ============================================================
INSERT IGNORE INTO schedules (section_id, room_id, day_of_week, start_time, end_time)
SELECT cs.section_id, r.room_id, m.dow, m.st, m.et
FROM (
  SELECT 'CSE101.1' AS sec, 'A101' AS room, 'Mon' AS dow, '07:30:00' AS st, '09:00:00' AS et UNION ALL
  SELECT 'CSE102.1',        'A102',          'Tue',         '07:30:00',         '09:00:00'     UNION ALL
  SELECT 'CSE103.1',        'B201',          'Wed',         '07:30:00',         '09:00:00'     UNION ALL
  SELECT 'MTH101.1',        'A101',          'Thu',         '07:30:00',         '09:00:00'     UNION ALL
  SELECT 'MTH102.1',        'A102',          'Fri',         '07:30:00',         '09:00:00'     UNION ALL
  SELECT 'ECO101.1',        'A101',          'Mon',         '09:15:00',         '10:45:00'     UNION ALL
  SELECT 'ACC101.1',        'A102',          'Tue',         '09:15:00',         '10:45:00'
) m
JOIN course_sections cs ON cs.section_code = m.sec
JOIN rooms r            ON r.room_code     = m.room;

-- ============================================================
-- 13. ENROLLMENTS
-- ============================================================
-- D23KH001, D23KH002, D23PM001 -> CSE101.1, MTH101.1
INSERT IGNORE INTO enrollments (section_id, student_id, enrollment_status)
SELECT cs.section_id, st.student_id, 'registered'
FROM course_sections cs
JOIN students st ON st.student_code IN ('D23KH001','D23KH002','D23PM001')
WHERE cs.section_code = 'CSE101.1';

INSERT IGNORE INTO enrollments (section_id, student_id, enrollment_status)
SELECT cs.section_id, st.student_id, 'registered'
FROM course_sections cs
JOIN students st ON st.student_code IN ('D23KH001','D23KH002','D23PM001')
WHERE cs.section_code = 'MTH101.1';

-- D23PM001, D23PM002 -> CSE102.1
INSERT IGNORE INTO enrollments (section_id, student_id, enrollment_status)
SELECT cs.section_id, st.student_id, 'registered'
FROM course_sections cs
JOIN students st ON st.student_code IN ('D23PM001','D23PM002')
WHERE cs.section_code = 'CSE102.1';

-- D24MK001, D24KT001 -> ECO101.1
INSERT IGNORE INTO enrollments (section_id, student_id, enrollment_status)
SELECT cs.section_id, st.student_id, 'registered'
FROM course_sections cs
JOIN students st ON st.student_code IN ('D24MK001','D24KT001')
WHERE cs.section_code = 'ECO101.1';

-- D24KT001 -> ACC101.1
INSERT IGNORE INTO enrollments (section_id, student_id, enrollment_status)
SELECT cs.section_id, st.student_id, 'registered'
FROM course_sections cs
JOIN students st ON st.student_code = 'D24KT001'
WHERE cs.section_code = 'ACC101.1';

-- ============================================================
-- 14. GRADES (khởi tạo trống, giảng viên nhập sau)
-- ============================================================
INSERT IGNORE INTO grades (enrollment_id, attendance_score, midterm_score, final_score, created_at, updated_at)
SELECT e.enrollment_id, NULL, NULL, NULL, NOW(), NOW()
FROM enrollments e
WHERE NOT EXISTS (SELECT 1 FROM grades g WHERE g.enrollment_id = e.enrollment_id);
