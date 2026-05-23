-- ============================================================
-- SEED DATA -- Student Portal (MySQL)
-- Target schema: merge_migration
-- Password test for all users: 123456
-- Safe to rerun: INSERT IGNORE / ON DUPLICATE KEY UPDATE
-- ============================================================

USE merge_migration;

SET @pwd = '$2a$10$gKee76JuMKMlvyoEtD4qEuBDp6dYaudD4BB6HasUOKMqERvVZuzpm'; -- bcrypt '123456'

-- ============================================================
-- 1. DEPARTMENTS
-- ============================================================
INSERT INTO departments (department_code, department_name)
VALUES
  ('CNTT', 'Công nghệ thông tin'),
  ('KT',   'Kinh tế'),
  ('DT',   'Điện tử')
ON DUPLICATE KEY UPDATE
  department_name = VALUES(department_name),
  updated_at = NOW();

-- ============================================================
-- 2. PROGRAMS
-- ============================================================
INSERT INTO programs (department_id, program_code, program_name, total_credits, status)
SELECT d.department_id, 'KHMT', 'Khoa học máy tính', 150, 'active'
FROM departments d WHERE d.department_code = 'CNTT'
ON DUPLICATE KEY UPDATE
  department_id = VALUES(department_id),
  program_name = VALUES(program_name),
  total_credits = VALUES(total_credits),
  status = VALUES(status),
  updated_at = NOW();

INSERT INTO programs (department_id, program_code, program_name, total_credits, status)
SELECT d.department_id, 'CNPM', 'Công nghệ phần mềm', 150, 'active'
FROM departments d WHERE d.department_code = 'CNTT'
ON DUPLICATE KEY UPDATE
  department_id = VALUES(department_id),
  program_name = VALUES(program_name),
  total_credits = VALUES(total_credits),
  status = VALUES(status),
  updated_at = NOW();

INSERT INTO programs (department_id, program_code, program_name, total_credits, status)
SELECT d.department_id, 'MKT', 'Marketing', 130, 'active'
FROM departments d WHERE d.department_code = 'KT'
ON DUPLICATE KEY UPDATE
  department_id = VALUES(department_id),
  program_name = VALUES(program_name),
  total_credits = VALUES(total_credits),
  status = VALUES(status),
  updated_at = NOW();

INSERT INTO programs (department_id, program_code, program_name, total_credits, status)
SELECT d.department_id, 'KTOAN', 'Kế toán', 130, 'active'
FROM departments d WHERE d.department_code = 'KT'
ON DUPLICATE KEY UPDATE
  department_id = VALUES(department_id),
  program_name = VALUES(program_name),
  total_credits = VALUES(total_credits),
  status = VALUES(status),
  updated_at = NOW();

INSERT INTO programs (department_id, program_code, program_name, total_credits, status)
SELECT d.department_id, 'IOT', 'Internet of Things', 150, 'active'
FROM departments d WHERE d.department_code = 'DT'
ON DUPLICATE KEY UPDATE
  department_id = VALUES(department_id),
  program_name = VALUES(program_name),
  total_credits = VALUES(total_credits),
  status = VALUES(status),
  updated_at = NOW();

-- ============================================================
-- 3. STUDENT_CLASSES
-- department_id/program_id trong schema hiện tại là VARCHAR, không phải FK
-- ============================================================
SELECT * FROM student_classes;
INSERT INTO student_classes
(class_code, department_id, program_id, specialization_id, cohort_year, class_type, status)
VALUES
  -- N22
  ('D22KHMT01',  'CNTT', 'KHMT',  NULL, 2022, 'regular', 'active'),
  ('D22CNPM01',  'CNTT', 'CNPM',  NULL, 2022, 'regular', 'active'),
  ('D22MKT01',   'KT',   'MKT',   NULL, 2022, 'regular', 'active'),
  ('D22KTOAN01', 'KT',   'KTOAN', NULL, 2022, 'regular', 'active'),
  ('D22IOT01',   'DT',   'IOT',   NULL, 2022, 'regular', 'active'),

  -- N23
  ('D23KHMT01',  'CNTT', 'KHMT',  NULL, 2023, 'regular', 'active'),
  ('D23CNPM01',  'CNTT', 'CNPM',  NULL, 2023, 'regular', 'active'),
  ('D23MKT01',   'KT',   'MKT',   NULL, 2023, 'regular', 'active'),
  ('D23KTOAN01', 'KT',   'KTOAN', NULL, 2023, 'regular', 'active'),
  ('D23IOT01',   'DT',   'IOT',   NULL, 2023, 'regular', 'active'),

  -- N24
  ('D24KHMT01',  'CNTT', 'KHMT',  NULL, 2024, 'regular', 'active'),
  ('D24CNPM01',  'CNTT', 'CNPM',  NULL, 2024, 'regular', 'active'),
  ('D24MKT01',   'KT',   'MKT',   NULL, 2024, 'regular', 'active'),
  ('D24KTOAN01', 'KT',   'KTOAN', NULL, 2024, 'regular', 'active'),
  ('D24IOT01',   'DT',   'IOT',   NULL, 2024, 'regular', 'active'),

  -- N25
  ('D25KHMT01',  'CNTT', 'KHMT',  NULL, 2025, 'regular', 'active'),
  ('D25CNPM01',  'CNTT', 'CNPM',  NULL, 2025, 'regular', 'active'),
  ('D25MKT01',   'KT',   'MKT',   NULL, 2025, 'regular', 'active'),
  ('D25KTOAN01', 'KT',   'KTOAN', NULL, 2025, 'regular', 'active'),
  ('D25IOT01',   'DT',   'IOT',   NULL, 2025, 'regular', 'active')
ON DUPLICATE KEY UPDATE
  department_id = VALUES(department_id),
  program_id = VALUES(program_id),
  specialization_id = VALUES(specialization_id),
  cohort_year = VALUES(cohort_year),
  class_type = VALUES(class_type),
  status = VALUES(status),
  updated_at = NOW();

-- ============================================================
-- 4. USERS
-- ============================================================

  
  


-- ============================================================
-- 5. LECTURERS
-- ============================================================
INSERT INTO lecturers (user_id, department_id, lecturer_code, full_name, work_email, phone, academic_title)
SELECT u.user_id, d.department_id, m.code, m.full_name, m.work_email, m.phone, m.title
FROM (
  SELECT 'GV001' AS uname, 'GV001' AS code, 'Bùi Xuân Phú' AS full_name, 'gv001@ptit.edu.vn' AS work_email, '0911000001' AS phone, 'Tiến sĩ' AS title, 'CNTT' AS dept UNION ALL
  SELECT 'GV002', 'GV002', 'Nguyễn Minh Châu', 'gv002@ptit.edu.vn', '0911000002', 'Thạc sĩ', 'DT' UNION ALL
  SELECT 'GV003', 'GV003', 'Nguyễn Quốc Thái', 'gv003@ptit.edu.vn', '0911000003', 'Thạc sĩ', 'KT' UNION ALL
  SELECT 'GV004', 'GV004', 'Trần Văn Hùng', 'gv004@ptit.edu.vn', '0911000004', 'Thạc sĩ', 'CNTT' UNION ALL
  SELECT 'GV005', 'GV005', 'Lê Thị Mai Anh', 'gv005@ptit.edu.vn', '0911000005', 'Tiến sĩ', 'CNTT' UNION ALL
  SELECT 'GV006', 'GV006', 'Phạm Quốc Bảo', 'gv006@ptit.edu.vn', '0911000006', 'Thạc sĩ', 'CNTT' UNION ALL
  SELECT 'GV007', 'GV007', 'Nguyễn Thị Thu Hà', 'gv007@ptit.edu.vn', '0911000007', 'Thạc sĩ', 'KT' UNION ALL
  SELECT 'GV008', 'GV008', 'Hoàng Minh Đức', 'gv008@ptit.edu.vn', '0911000008', 'Tiến sĩ', 'KT' UNION ALL
  SELECT 'GV009', 'GV009', 'Đặng Thị Ngọc Lan', 'gv009@ptit.edu.vn', '0911000009', 'Thạc sĩ', 'KT' UNION ALL
  SELECT 'GV010', 'GV010', 'Vũ Anh Tuấn', 'gv010@ptit.edu.vn', '0911000010', 'Thạc sĩ', 'DT' UNION ALL
  SELECT 'GV011', 'GV011', 'Đỗ Thị Hương Giang', 'gv011@ptit.edu.vn', '0911000011', 'Tiến sĩ', 'DT' UNION ALL
  SELECT 'GV012', 'GV012', 'Phan Văn Long', 'gv012@ptit.edu.vn', '0911000012', 'Thạc sĩ', 'DT' UNION ALL
  SELECT 'GV013', 'GV013', 'Bùi Thị Thanh Trúc', 'gv013@ptit.edu.vn', '0911000013', 'Thạc sĩ', 'CNTT'
) m
JOIN users u ON u.username = m.uname
JOIN departments d ON d.department_code = m.dept
ON DUPLICATE KEY UPDATE
  department_id = VALUES(department_id),
  full_name = VALUES(full_name),
  work_email = VALUES(work_email),
  phone = VALUES(phone),
  academic_title = VALUES(academic_title),
  updated_at = NOW();
  

-- ============================================================
-- 6. STUDENTS
-- Lưu ý schema đang để gender ENUM('MALE','FEMALE','OTHER'), nên seed phải dùng HOA.
-- ============================================================


SELECT * FROM STUDENTS;

-- ============================================================
-- 7. COURSES
-- ============================================================
INSERT INTO courses (department_id, course_code, course_name, credits, course_type, is_active, description)
SELECT d.department_id, m.code, m.name, m.credits, m.course_type, TRUE, m.description
FROM (
  SELECT 'CSE101' AS code, 'Lập trình cơ bản' AS name, 3 AS credits, 'required' AS course_type, 'CNTT' AS dept, 'Nhập môn lập trình' AS description UNION ALL
  SELECT 'CSE102', 'Cấu trúc dữ liệu', 3, 'required', 'CNTT', 'Danh sách, stack, queue, tree, graph' UNION ALL
  SELECT 'CSE103', 'Cơ sở dữ liệu', 3, 'required', 'CNTT', 'Thiết kế CSDL và SQL' UNION ALL
  SELECT 'MTH101', 'Giải tích 1', 3, 'required', 'CNTT', 'Hàm số, đạo hàm, tích phân' UNION ALL
  SELECT 'MTH102', 'Đại số tuyến tính', 3, 'required', 'CNTT', 'Ma trận và không gian vector' UNION ALL
  SELECT 'ECO101', 'Kinh tế vi mô', 3, 'required', 'KT', 'Cung cầu và thị trường' UNION ALL
  SELECT 'ACC101', 'Nguyên lý kế toán', 3, 'required', 'KT', 'Kế toán cơ bản'
) m
JOIN departments d ON d.department_code = m.dept
ON DUPLICATE KEY UPDATE
  department_id = VALUES(department_id),
  course_name = VALUES(course_name),
  credits = VALUES(credits),
  course_type = VALUES(course_type),
  is_active = VALUES(is_active),
  description = VALUES(description),
  updated_at = NOW();

-- ============================================================
-- 8. COURSE_PREREQUISITES
-- ============================================================
INSERT IGNORE INTO course_prerequisites (course_id, prerequisite_course_id)
SELECT c.course_id, pre.course_id
FROM courses c
JOIN courses pre
WHERE (c.course_code = 'CSE102' AND pre.course_code = 'CSE101')
   OR (c.course_code = 'CSE103' AND pre.course_code = 'CSE102');

-- ============================================================
-- 9. PROGRAM_COURSES
-- ============================================================
INSERT IGNORE INTO program_courses (program_id, course_id, recommended_semester, is_required)
SELECT p.program_id, c.course_id, m.semester_no, TRUE
FROM (
  SELECT 'KHMT' AS prog, 'CSE101' AS course, 1 AS semester_no UNION ALL
  SELECT 'KHMT', 'CSE102', 2 UNION ALL
  SELECT 'KHMT', 'CSE103', 3 UNION ALL
  SELECT 'KHMT', 'MTH101', 1 UNION ALL
  SELECT 'KHMT', 'MTH102', 2 UNION ALL
  SELECT 'CNPM', 'CSE101', 1 UNION ALL
  SELECT 'CNPM', 'CSE102', 2 UNION ALL
  SELECT 'CNPM', 'CSE103', 3 UNION ALL
  SELECT 'CNPM', 'MTH101', 1 UNION ALL
  SELECT 'MKT', 'ECO101', 1 UNION ALL
  SELECT 'KTOAN', 'ECO101', 1 UNION ALL
  SELECT 'KTOAN', 'ACC101', 2
) m
JOIN programs p ON p.program_code = m.prog
JOIN courses c ON c.course_code = m.course;

-- ============================================================
-- 10. SEMESTERS
-- Schema hiện tại: semester_code, semester_year, price_per_credit
-- ============================================================
INSERT INTO semesters (
  semester_code, semester_year, price_per_credit,
  start_date, end_date, tuition_due_date,
  registration_open, registration_close
)
VALUES
  ('HK1-2022-2023', '2022-2023', NULL, '2022-09-01', '2023-01-15', '2022-09-30', '2022-08-01 00:00:00', '2022-08-31 23:59:59'),
  ('HK2-2022-2023', '2022-2023', NULL, '2023-02-01', '2023-06-15', '2023-02-28', '2023-01-10 00:00:00', '2023-01-31 23:59:59'),

  ('HK1-2023-2024', '2023-2024', NULL, '2023-09-01', '2024-01-15', '2023-09-30', '2023-08-01 00:00:00', '2023-08-31 23:59:59'),
  ('HK2-2023-2024', '2023-2024', NULL, '2024-02-01', '2024-06-15', '2024-02-28', '2024-01-10 00:00:00', '2024-01-31 23:59:59'),

  ('HK1-2024-2025', '2024-2025', NULL, '2024-09-01', '2025-01-15', '2024-09-30', '2024-08-01 00:00:00', '2024-08-31 23:59:59'),
  ('HK2-2024-2025', '2024-2025', NULL, '2025-02-01', '2025-06-15', '2025-02-28', '2025-01-10 00:00:00', '2025-01-31 23:59:59'),

  ('HK1-2025-2026', '2025-2026', NULL, '2025-09-01', '2026-01-15', '2025-09-30', '2025-08-01 00:00:00', '2025-08-31 23:59:59'),
  ('HK2-2025-2026', '2025-2026', NULL, '2026-02-01', '2026-06-15', '2026-02-28', '2026-01-10 00:00:00', '2026-01-31 23:59:59')
ON DUPLICATE KEY UPDATE
  semester_year = VALUES(semester_year),
  price_per_credit = VALUES(price_per_credit),
  start_date = VALUES(start_date),
  end_date = VALUES(end_date),
  tuition_due_date = VALUES(tuition_due_date),
  registration_open = VALUES(registration_open),
  registration_close = VALUES(registration_close),
  updated_at = NOW();
  
INSERT INTO tuition_rates (enrollment_year, price_per_credit)
VALUES
  (2022, 450000),
  (2023, 500000),
  (2024, 650000),
  (2025, 750000)
ON DUPLICATE KEY UPDATE
  price_per_credit = VALUES(price_per_credit),
  updated_at = NOW();

SET @sem_hk1_2024 = (
  SELECT semester_id
  FROM semesters
  WHERE semester_code = 'HK1-2024-2025'
  LIMIT 1
);

SET @sem_hk2_2024 = (
  SELECT semester_id
  FROM semesters
  WHERE semester_code = 'HK2-2024-2025'
  LIMIT 1
);

-- ============================================================
-- 11. BUILDINGS + ROOMS
-- ============================================================
INSERT INTO buildings (building_code, building_name)
VALUES
  ('A', 'Tòa A'),
  ('B', 'Tòa B'),
  ('C', 'Tòa C'),
  ('D', 'Tòa D')
ON DUPLICATE KEY UPDATE
  building_name = VALUES(building_name),
  updated_at = NOW();

INSERT INTO rooms (room_code, building_id, room_type, capacity)
SELECT m.room_code, b.building_id, m.room_type, m.capacity
FROM (
  SELECT 'A01' AS room_code, 'A' AS building_code, 'classroom' AS room_type, 60 AS capacity UNION ALL
  SELECT 'A02', 'A', 'classroom', 60 UNION ALL
  SELECT 'A03', 'A', 'classroom', 70 UNION ALL
  SELECT 'A04', 'A', 'exam_room', 90 UNION ALL

  SELECT 'B01', 'B', 'lab', 50 UNION ALL
  SELECT 'B02', 'B', 'lab', 45 UNION ALL
  SELECT 'B03', 'B', 'classroom', 60 UNION ALL
  SELECT 'B04', 'B', 'exam_room', 80 UNION ALL

  SELECT 'C01', 'C', 'classroom', 60 UNION ALL
  SELECT 'C02', 'C', 'classroom', 60 UNION ALL
  SELECT 'C03', 'C', 'lab', 45 UNION ALL
  SELECT 'C04', 'C', 'exam_room', 80 UNION ALL

  SELECT 'D01', 'D', 'hall', 150 UNION ALL
  SELECT 'D02', 'D', 'classroom', 70 UNION ALL
  SELECT 'D03', 'D', 'classroom', 70 UNION ALL
  SELECT 'D04', 'D', 'office', 30
) m
JOIN buildings b ON b.building_code = m.building_code
ON DUPLICATE KEY UPDATE
  building_id = VALUES(building_id),
  room_type = VALUES(room_type),
  capacity = VALUES(capacity),
  updated_at = NOW();

-- ============================================================
-- 12. COURSE_SECTIONS
-- ============================================================
INSERT IGNORE INTO course_sections (
  course_id, semester_id, class_id, lecturer_id,
  section_code, max_capacity, status
)
SELECT
  c.course_id,
  @sem_hk1_2024,
  sc.class_id,
  lec.lecturer_id,
  m.section_code,
  30,
  'open'
FROM (
  SELECT 'CSE101' AS course_code, 'CSE101.K23.01' AS section_code, 'GV001' AS lecturer_code, 'KHMT' AS class_prog, 2023 AS cohort_year UNION ALL
  SELECT 'CSE102', 'CSE102.K23.01', 'GV004', 'KHMT', 2023 UNION ALL
  SELECT 'CSE103', 'CSE103.K23.01', 'GV005', 'KHMT', 2023 UNION ALL
  SELECT 'MTH101', 'MTH101.K23.01', 'GV006', 'KHMT', 2023 UNION ALL
  SELECT 'MTH102', 'MTH102.K23.01', 'GV001', 'KHMT', 2023 UNION ALL

  SELECT 'CSE101', 'CSE101.K23.02', 'GV004', 'CNPM', 2023 UNION ALL
  SELECT 'CSE102', 'CSE102.K23.02', 'GV005', 'CNPM', 2023 UNION ALL
  SELECT 'CSE103', 'CSE103.K23.02', 'GV006', 'CNPM', 2023 UNION ALL
  SELECT 'MTH101', 'MTH101.K23.02', 'GV001', 'CNPM', 2023 UNION ALL

  SELECT 'ECO101', 'ECO101.K23.01', 'GV007', 'MKT', 2023 UNION ALL
  SELECT 'ACC101', 'ACC101.K23.01', 'GV008', 'KTOAN', 2023 UNION ALL

  SELECT 'CSE101', 'CSE101.K24.01', 'GV009', 'KHMT', 2024 UNION ALL
  SELECT 'CSE102', 'CSE102.K24.01', 'GV010', 'CNPM', 2024 UNION ALL
  SELECT 'CSE103', 'CSE103.K24.01', 'GV011', 'CNPM', 2024 UNION ALL
  SELECT 'MTH101', 'MTH101.K24.01', 'GV012', 'KHMT', 2024 UNION ALL
  SELECT 'MTH102', 'MTH102.K24.01', 'GV013', 'KHMT', 2024 UNION ALL

  SELECT 'ECO101', 'ECO101.K24.01', 'GV007', 'MKT', 2024 UNION ALL
  SELECT 'ACC101', 'ACC101.K24.01', 'GV008', 'KTOAN', 2024 UNION ALL

  SELECT 'CSE101', 'CSE101.K25.01', 'GV004', 'KHMT', 2025 UNION ALL
  SELECT 'CSE102', 'CSE102.K25.01', 'GV005', 'CNPM', 2025 UNION ALL
  SELECT 'CSE103', 'CSE103.K25.01', 'GV006', 'CNPM', 2025 UNION ALL
  SELECT 'MTH101', 'MTH101.K25.01', 'GV001', 'KHMT', 2025 UNION ALL
  SELECT 'MTH102', 'MTH102.K25.01', 'GV002', 'KHMT', 2025 UNION ALL

  SELECT 'ECO101', 'ECO101.K25.01', 'GV009', 'MKT', 2025 UNION ALL
  SELECT 'ACC101', 'ACC101.K25.01', 'GV010', 'KTOAN', 2025 UNION ALL
  SELECT 'CSE101', 'CSE101.IOT.K25.01', 'GV011', 'IOT', 2025 UNION ALL
  SELECT 'CSE103', 'CSE103.IOT.K25.01', 'GV012', 'IOT', 2025
) m
JOIN courses c ON c.course_code = m.course_code
JOIN lecturers lec ON lec.lecturer_code = m.lecturer_code
LEFT JOIN student_classes sc
  ON sc.program_id = m.class_prog
 AND sc.cohort_year = m.cohort_year;

-- ============================================================
-- 13. SCHEDULES
-- Schema yêu cầu slot_start, slot_end, start_time, end_time
-- ============================================================
INSERT IGNORE INTO schedules (
  section_id, room_id, day_of_week,
  from_week_no, to_week_no,
  slot_start, slot_end, start_time, end_time,
  session_type, practice_group_no
)
SELECT
  cs.section_id,
  r.room_id,
  m.day_of_week,
  1 AS from_week_no,
  c.credits * 4 AS to_week_no,
  m.slot_start,
  m.slot_end,
  m.start_time,
  m.end_time,
  m.session_type,
  m.practice_group_no
FROM (
  -- Ca sáng: 07:00 - 10:30
  SELECT 'CSE101.K23.01' AS section_code, 'A01' AS room_code, 'Mon' AS day_of_week, 1 AS slot_start, 4 AS slot_end, '07:00:00' AS start_time, '10:30:00' AS end_time, 'theory' AS session_type, 0 AS practice_group_no UNION ALL
  SELECT 'CSE102.K23.01', 'A02', 'Tue', 1, 4, '07:00:00', '10:30:00', 'theory', 0 UNION ALL
  SELECT 'CSE103.K23.01', 'B01', 'Wed', 1, 4, '07:00:00', '10:30:00', 'practice', 1 UNION ALL
  SELECT 'MTH101.K23.01', 'C01', 'Thu', 1, 4, '07:00:00', '10:30:00', 'theory', 0 UNION ALL
  SELECT 'MTH102.K23.01', 'C02', 'Fri', 1, 4, '07:00:00', '10:30:00', 'theory', 0 UNION ALL

  -- Ca chiều: 13:00 - 16:30
  SELECT 'CSE101.K23.02', 'A03', 'Mon', 6, 9, '13:00:00', '16:30:00', 'theory', 0 UNION ALL
  SELECT 'CSE102.K23.02', 'B02', 'Tue', 6, 9, '13:00:00', '16:30:00', 'theory', 0 UNION ALL
  SELECT 'CSE103.K23.02', 'B03', 'Wed', 6, 9, '13:00:00', '16:30:00', 'practice', 1 UNION ALL
  SELECT 'MTH101.K23.02', 'D02', 'Thu', 6, 9, '13:00:00', '16:30:00', 'theory', 0 UNION ALL

  -- Ca tối: 17:30 - 21:00
  SELECT 'ECO101.K23.01', 'D03', 'Mon', 11, 14, '17:30:00', '21:00:00', 'theory', 0 UNION ALL
  SELECT 'ACC101.K23.01', 'A04', 'Tue', 11, 14, '17:30:00', '21:00:00', 'theory', 0 UNION ALL

  -- K24
  SELECT 'CSE101.K24.01', 'A01', 'Wed', 1, 4, '07:00:00', '10:30:00', 'theory', 0 UNION ALL
  SELECT 'CSE102.K24.01', 'A02', 'Thu', 6, 9, '13:00:00', '16:30:00', 'theory', 0 UNION ALL
  SELECT 'CSE103.K24.01', 'B01', 'Fri', 11, 14, '17:30:00', '21:00:00', 'practice', 1 UNION ALL
  SELECT 'MTH101.K24.01', 'C01', 'Mon', 1, 4, '07:00:00', '10:30:00', 'theory', 0 UNION ALL
  SELECT 'MTH102.K24.01', 'C02', 'Tue', 6, 9, '13:00:00', '16:30:00', 'theory', 0 UNION ALL
  SELECT 'ECO101.K24.01', 'D02', 'Wed', 11, 14, '17:30:00', '21:00:00', 'theory', 0 UNION ALL
  SELECT 'ACC101.K24.01', 'D03', 'Thu', 1, 4, '07:00:00', '10:30:00', 'theory', 0 UNION ALL

  -- K25
  SELECT 'CSE101.K25.01', 'A03', 'Fri', 1, 4, '07:00:00', '10:30:00', 'theory', 0 UNION ALL
  SELECT 'CSE102.K25.01', 'B02', 'Mon', 6, 9, '13:00:00', '16:30:00', 'theory', 0 UNION ALL
  SELECT 'CSE103.K25.01', 'B03', 'Tue', 11, 14, '17:30:00', '21:00:00', 'practice', 1 UNION ALL
  SELECT 'MTH101.K25.01', 'C01', 'Wed', 1, 4, '07:00:00', '10:30:00', 'theory', 0 UNION ALL
  SELECT 'MTH102.K25.01', 'C02', 'Thu', 6, 9, '13:00:00', '16:30:00', 'theory', 0 UNION ALL
  SELECT 'ECO101.K25.01', 'D02', 'Fri', 11, 14, '17:30:00', '21:00:00', 'theory', 0 UNION ALL
  SELECT 'ACC101.K25.01', 'D03', 'Mon', 1, 4, '07:00:00', '10:30:00', 'theory', 0 UNION ALL
  SELECT 'CSE101.IOT.K25.01', 'B01', 'Tue', 6, 9, '13:00:00', '16:30:00', 'theory', 0 UNION ALL
  SELECT 'CSE103.IOT.K25.01', 'B02', 'Wed', 11, 14, '17:30:00', '21:00:00', 'practice', 1
) m
JOIN course_sections cs ON cs.section_code = m.section_code
JOIN courses c ON c.course_id = cs.course_id
JOIN rooms r ON r.room_code = m.room_code;


INSERT INTO semesters (
  semester_code, semester_year, price_per_credit,
  start_date, end_date, tuition_due_date,
  registration_open, registration_close
)
VALUES
(
  'HK1-2025-2026',
  '2025-2026',
  NULL,
  '2025-09-01',
  '2026-01-15',
  '2025-09-30',
  '2025-08-01 00:00:00',
  '2025-08-31 23:59:59'
),
(
  'HK2-2025-2026',
  '2025-2026',
  NULL,
  '2026-02-01',
  '2026-06-15',
  '2026-02-28',
  '2026-01-10 00:00:00',
  '2026-01-31 23:59:59'
)
ON DUPLICATE KEY UPDATE
  semester_year = VALUES(semester_year),
  price_per_credit = VALUES(price_per_credit),
  start_date = VALUES(start_date),
  end_date = VALUES(end_date),
  tuition_due_date = VALUES(tuition_due_date),
  registration_open = VALUES(registration_open),
  registration_close = VALUES(registration_close),
  updated_at = NOW();

SET @sem_hk1_2025 = (
  SELECT semester_id
  FROM semesters
  WHERE semester_code = 'HK1-2025-2026'
  LIMIT 1
);

SET @sem_hk2_2025 = (
  SELECT semester_id
  FROM semesters
  WHERE semester_code = 'HK2-2025-2026'
  LIMIT 1
);

-- ============================================================
-- 14. SEMESTER_WEEKS
-- ============================================================
-- HK1-2025-2026: mỗi cohort có thể bắt đầu khác ngày




INSERT IGNORE INTO semester_weeks
(semester_id, cohort_year, week_no, start_date, end_date)
SELECT @sem_hk1_2025, c.cohort_year, w.week_no,
       DATE_ADD(c.start_date, INTERVAL (w.week_no - 1) * 7 DAY),
       DATE_ADD(c.start_date, INTERVAL (w.week_no - 1) * 7 + 6 DAY)
FROM (
  SELECT 2022 cohort_year, DATE('2025-08-18') start_date UNION ALL
  SELECT 2023, DATE('2025-08-25') UNION ALL
  SELECT 2024, DATE('2025-09-01') UNION ALL
  SELECT 2025, DATE('2025-09-05')
) c
JOIN (
  SELECT 1 week_no UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
  UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
  UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
) w;

INSERT IGNORE INTO semester_weeks
(semester_id, cohort_year, week_no, start_date, end_date)
SELECT @sem_hk2_2025, c.cohort_year, w.week_no,
       DATE_ADD(c.start_date, INTERVAL (w.week_no - 1) * 7 DAY),
       DATE_ADD(c.start_date, INTERVAL (w.week_no - 1) * 7 + 6 DAY)
FROM (
  SELECT 2022 cohort_year, DATE('2026-01-19') start_date UNION ALL
  SELECT 2023, DATE('2026-01-26') UNION ALL
  SELECT 2024, DATE('2026-02-02') UNION ALL
  SELECT 2025, DATE('2026-02-09')
) c
JOIN (
  SELECT 1 week_no UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
  UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
  UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
) w;


-- kiem tra 

-- ============================================================
-- 15. CLASS_SESSIONS
-- Tạo 3 buổi đầu làm dữ liệu demo, tránh seed quá dài.
-- ============================================================
INSERT IGNORE INTO class_sessions (
  schedule_id, section_id, practice_group_no,
  semester_week_id, session_date,
  room_id, lecturer_id,
  slot_start, slot_end, start_time, end_time,
  session_status, note
)
SELECT
  s.schedule_id,
  cs.section_id,
  s.practice_group_no,
  sw.semester_week_id,
  CASE s.day_of_week
    WHEN 'Mon' THEN DATE_ADD(sw.start_date, INTERVAL 0 DAY)
    WHEN 'Tue' THEN DATE_ADD(sw.start_date, INTERVAL 1 DAY)
    WHEN 'Wed' THEN DATE_ADD(sw.start_date, INTERVAL 2 DAY)
    WHEN 'Thu' THEN DATE_ADD(sw.start_date, INTERVAL 3 DAY)
    WHEN 'Fri' THEN DATE_ADD(sw.start_date, INTERVAL 4 DAY)
    WHEN 'Sat' THEN DATE_ADD(sw.start_date, INTERVAL 5 DAY)
    WHEN 'Sun' THEN DATE_ADD(sw.start_date, INTERVAL 6 DAY)
  END AS session_date,
  s.room_id,
  cs.lecturer_id,
  s.slot_start,
  s.slot_end,
  s.start_time,
  s.end_time,
  'scheduled',
  CONCAT('Auto generated week ', sw.week_no)
FROM schedules s
JOIN course_sections cs ON cs.section_id = s.section_id
JOIN student_classes sc ON sc.class_id = cs.class_id
JOIN semester_weeks sw
  ON sw.semester_id = cs.semester_id
 AND sw.cohort_year = sc.cohort_year
WHERE sw.week_no BETWEEN s.from_week_no AND s.to_week_no;




INSERT IGNORE INTO enrollments (
  student_id, section_id, practice_group_no, enrollment_status
)
SELECT
  st.student_id,
  cs.section_id,
  0,
  'registered'
FROM students st
JOIN course_sections cs
  ON cs.class_id = st.class_id
WHERE cs.status = 'open';


SELECT COUNT(*) FROM enrollments;

-- ============================================================
-- 17. GRADES
-- Bảng grades hiện có thêm exercise_score, practice_score, total_score.
-- Khởi tạo trống để giảng viên nhập sau.
-- ============================================================
INSERT IGNORE INTO grades (
  enrollment_id,
  attendance_score, exercise_score, practice_score,
  midterm_score, final_score, total_score,
  letter_grade, result
)
SELECT
  e.enrollment_id,
  NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, NULL
FROM enrollments e;

-- ============================================================
-- 18. REQUEST_TYPES đã có insert trong schema, nhưng seed lại để chắc chắn.
-- ============================================================
INSERT INTO request_types (request_type_code, request_type_name, description)
VALUES
  ('recheck_grade', 'Phúc khảo điểm', 'Yêu cầu xem xét lại điểm số'),
  ('leave_request', 'Xin nghỉ học', 'Yêu cầu xin nghỉ học'),
  ('transcript', 'In bảng điểm', 'Yêu cầu in bảng điểm chính thức')
ON DUPLICATE KEY UPDATE
  request_type_name = VALUES(request_type_name),
  description = VALUES(description),
  updated_at = NOW();

-- ============================================================
-- 19. NOTIFICATIONS demo
-- Lưu ý schema đang bị typo ENUM status = 'drafft', không phải 'draft'.
-- Seed dùng 'published' để an toàn.
-- ============================================================
INSERT IGNORE INTO notifications (
  created_by, title, content, notification_type,
  is_important, status, target_type
)
SELECT
  u.user_id,
  'Thông báo mở học kỳ',
  'Học kỳ HK1 2024-2025 đã được mở trên hệ thống.',
  'academic',
  TRUE,
  'published',
  'all'
FROM users u
WHERE u.username = 'admin01';

INSERT IGNORE INTO notification_recipients (notification_id, user_id, is_read)
SELECT n.notification_id, u.user_id, FALSE
FROM notifications n
JOIN users u ON u.role = 'student'
WHERE n.title = 'Thông báo mở học kỳ';

-- ============================================================
-- 20. TUITION_RATES
-- ============================================================
INSERT INTO tuition_rates (enrollment_year, price_per_credit)
VALUES
  (2022, 450000),
  (2023, 500000),
  (2024, 650000),
  (2025, 750000)
ON DUPLICATE KEY UPDATE
  price_per_credit = VALUES(price_per_credit),
  updated_at = NOW();

-- ============================================================
-- 21. TUITION_FEES demo
-- status schema đang typo 'partical', seed chỉ dùng 'unpaid'.
-- ============================================================

-- ============================================================
-- 22. ACADEMIC_CALENDAR_BLOCKS
-- Schema block_type enum hiện là ('holiday','break','exam_week',''), nên seed tránh 'event'.
-- ============================================================


-- ============================================================
-- 23. QUICK CHECKS
-- ============================================================
SELECT 'users' AS table_name, COUNT(*) AS total FROM users
UNION ALL SELECT 'students', COUNT(*) FROM students
UNION ALL SELECT 'lecturers', COUNT(*) FROM lecturers
UNION ALL SELECT 'courses', COUNT(*) FROM courses
UNION ALL SELECT 'course_sections', COUNT(*) FROM course_sections
UNION ALL SELECT 'schedules', COUNT(*) FROM schedules
UNION ALL SELECT 'class_sessions', COUNT(*) FROM class_sessions
UNION ALL SELECT 'enrollments', COUNT(*) FROM enrollments
UNION ALL SELECT 'grades', COUNT(*) FROM grades;
