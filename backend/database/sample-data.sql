-- Sample data for Student Portal (works with MySQL)
-- Safe to run multiple times (uses INSERT IGNORE / ON DUPLICATE KEY patterns)
-- Paste the whole file into MySQL Workbench and run against your portal database.

SET @pwd_hash = '$2a$10$gKee76JuMKMlvyoEtD4qEuBDp6dYaudD4BB6HasUOKMqERvVZuzpm'; -- bcrypt hash for '123456'

-- 0) Ensure required departments and programs exist (prevent FK errors)
INSERT IGNORE INTO departments (department_code, department_name, created_at, updated_at)
VALUES
  ('CNTT', 'Cong nghe thong tin', NOW(), NOW()),
  ('KHTN', 'Khoa hoc tu nhien', NOW(), NOW());

-- Programs linked to departments
INSERT IGNORE INTO programs (department_id, program_code, program_name, total_credits, status, created_at, updated_at)
SELECT d.department_id, 'CNTT-IT', 'Cong nghe thong tin - CNTT', 140, 'active', NOW(), NOW()
FROM departments d WHERE d.department_code = 'CNTT'
ON DUPLICATE KEY UPDATE program_name = VALUES(program_name), updated_at = NOW();

INSERT IGNORE INTO programs (department_id, program_code, program_name, total_credits, status, created_at, updated_at)
SELECT d.department_id, 'KHTN-MTH', 'Toan - KHTN', 120, 'active', NOW(), NOW()
FROM departments d WHERE d.department_code = 'KHTN'
ON DUPLICATE KEY UPDATE program_name = VALUES(program_name), updated_at = NOW();

-- 1) Users: 3 lecturers
INSERT IGNORE INTO users (username, password_hash, email, role, status)
VALUES
  ('lecturer01', @pwd_hash, 'lecturer01@ptit.edu.vn', 'lecturer', 'active'),
  ('lecturer02', @pwd_hash, 'lecturer02@ptit.edu.vn', 'lecturer', 'active'),
  ('lecturer03', @pwd_hash, 'lecturer03@ptit.edu.vn', 'lecturer', 'active');

-- 2) Lecturers: link to users (use department lookup)
-- Use ON DUPLICATE KEY UPDATE so reruns can re-bind existing lecturer_code/work_email to the intended user.
INSERT INTO lecturers (user_id, department_id, lecturer_code, full_name, work_email, phone, academic_title)
SELECT u.user_id, d.department_id, meta.code, meta.fullname, u.email, meta.phone, meta.title
FROM (
  SELECT 'LEC001' AS code, 'Nguyễn Văn A' AS fullname, '0912345678' AS phone, 'Tiến sĩ' AS title, 'lecturer01@ptit.edu.vn' AS email, 'CNTT' AS dept_code
  UNION ALL SELECT 'LEC002','Trần Thị B','0912345679','Thạc sĩ','lecturer02@ptit.edu.vn','CNTT'
  UNION ALL SELECT 'LEC003','Phạm Văn C','0912345680','Thạc sĩ','lecturer03@ptit.edu.vn','KHTN'
) meta
JOIN users u ON u.email = meta.email
JOIN departments d ON d.department_code = meta.dept_code
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  department_id = VALUES(department_id),
  full_name = VALUES(full_name),
  work_email = VALUES(work_email),
  phone = VALUES(phone),
  academic_title = VALUES(academic_title),
  updated_at = NOW();

-- 3) Users: 20 students
INSERT IGNORE INTO users (username, password_hash, email, role, status)
VALUES
  ('student01', @pwd_hash, 'tcpeduvn@gmail.com', 'student', 'active'),
  ('student02', @pwd_hash, 'student02@student.ptit.edu.vn', 'student', 'active'),
  ('student03', @pwd_hash, 'student03@student.ptit.edu.vn', 'student', 'active'),
  ('student04', @pwd_hash, 'student04@student.ptit.edu.vn', 'student', 'active'),
  ('student05', @pwd_hash, 'student05@student.ptit.edu.vn', 'student', 'active'),
  ('student06', @pwd_hash, 'student06@student.ptit.edu.vn', 'student', 'active'),
  ('student07', @pwd_hash, 'student07@student.ptit.edu.vn', 'student', 'active'),
  ('student08', @pwd_hash, 'student08@student.ptit.edu.vn', 'student', 'active'),
  ('student09', @pwd_hash, 'student09@student.ptit.edu.vn', 'student', 'active'),
  ('student10', @pwd_hash, 'student10@student.ptit.edu.vn', 'student', 'active'),
  ('student11', @pwd_hash, 'student11@student.ptit.edu.vn', 'student', 'active'),
  ('student12', @pwd_hash, 'student12@student.ptit.edu.vn', 'student', 'active'),
  ('student13', @pwd_hash, 'student13@student.ptit.edu.vn', 'student', 'active'),
  ('student14', @pwd_hash, 'student14@student.ptit.edu.vn', 'student', 'active'),
  ('student15', @pwd_hash, 'student15@student.ptit.edu.vn', 'student', 'active'),
  ('student16', @pwd_hash, 'student16@student.ptit.edu.vn', 'student', 'active'),
  ('student17', @pwd_hash, 'student17@student.ptit.edu.vn', 'student', 'active'),
  ('student18', @pwd_hash, 'student18@student.ptit.edu.vn', 'student', 'active'),
  ('student19', @pwd_hash, 'student19@student.ptit.edu.vn', 'student', 'active'),
  ('student20', @pwd_hash, 'student20@student.ptit.edu.vn', 'student', 'active');

-- 4) Students: link to users (use program lookup)
INSERT IGNORE INTO students (user_id, program_id, student_code, full_name, enrollment_year, academic_status)
SELECT u.user_id, p.program_id, code, fullname, 2022, 'studying'
FROM (
  SELECT 'student01' username, 'SV001' code, 'Lê Minh Hùng' fullname UNION ALL
  SELECT 'student02','SV002','Ngô Thùy Duyên' UNION ALL
  SELECT 'student03','SV003','Đặng Quốc Anh' UNION ALL
  SELECT 'student04','SV004','Trần Hữu Nghĩa' UNION ALL
  SELECT 'student05','SV005','Vũ Thanh Hà' UNION ALL
  SELECT 'student06','SV006','Phạm Hồng Phúc' UNION ALL
  SELECT 'student07','SV007','Hoàng Thị Liên' UNION ALL
  SELECT 'student08','SV008','Bùi Tiến Dũng' UNION ALL
  SELECT 'student09','SV009','Đinh Việt Anh' UNION ALL
  SELECT 'student10','SV010','Trịnh Minh Tâm' UNION ALL
  SELECT 'student11','SV011','Nguyễn Thu Thảo' UNION ALL
  SELECT 'student12','SV012','Vũ Kiến Hùng' UNION ALL
  SELECT 'student13','SV013','Nguyễn Hồng Nhung' UNION ALL
  SELECT 'student14','SV014','Tô Minh Dũng' UNION ALL
  SELECT 'student15','SV015','Lưu Thúy Quỳnh' UNION ALL
  SELECT 'student16','SV016','Đỗ Duy Hưng' UNION ALL
  SELECT 'student17','SV017','Triệu Thảo Ngọc' UNION ALL
  SELECT 'student18','SV018','Cường Văn Toàn' UNION ALL
  SELECT 'student19','SV019','Mạnh Tiến Duy' UNION ALL
  SELECT 'student20','SV020','Nhân Huyền Trang'
) meta
JOIN users u ON u.username = meta.username
JOIN programs p ON p.program_code = 'CNTT-IT'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), updated_at = NOW();

-- 5) Create sample courses (assign department via SELECT)
INSERT IGNORE INTO courses (department_id, course_code, course_name, credits)
SELECT d.department_id, code, name, credits
FROM (
  SELECT 'CSE101' code, 'Introduction to Programming' name, 3 credits UNION ALL
  SELECT 'CSE102','Data Structures',3 UNION ALL
  SELECT 'MTH101','Calculus I',3 UNION ALL
  SELECT 'PHY101','Physics I',3
) meta
JOIN departments d ON d.department_code = 'CNTT';

-- 6) Link courses to program via program_courses (this is crucial for curriculum view!)
INSERT IGNORE INTO program_courses (program_id, course_id, recommended_semester, is_required)
SELECT p.program_id, c.course_id, meta.semester, meta.required
FROM (
  SELECT 'CSE101' code, 1 semester, TRUE required UNION ALL
  SELECT 'CSE102', 2, TRUE UNION ALL
  SELECT 'MTH101', 1, TRUE UNION ALL
  SELECT 'PHY101', 2, TRUE
) meta
JOIN courses c ON c.course_code = meta.code
JOIN departments d ON d.department_id = c.department_id
JOIN programs p ON p.department_id = d.department_id AND p.program_code = 'CNTT-IT';

-- 7) Create a sample semester (include end_date to satisfy CHECK)
INSERT INTO semesters (semester_name, academic_year, start_date, end_date)
SELECT 'Spring 2025', '2025', '2025-02-01', '2025-06-30'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1
  FROM semesters
  WHERE semester_name = 'Spring 2025'
    AND academic_year = '2025'
);

-- Resolve IDs once to avoid scalar subquery errors when old duplicated data exists.
SET @semester_id = (
  SELECT semester_id
  FROM semesters
  WHERE semester_name = 'Spring 2025'
    AND academic_year = '2025'
  ORDER BY semester_id DESC
  LIMIT 1
);

SET @lec001_id = (
  SELECT lecturer_id
  FROM lecturers
  WHERE lecturer_code = 'LEC001'
  LIMIT 1
);

SET @lec002_id = (
  SELECT lecturer_id
  FROM lecturers
  WHERE lecturer_code = 'LEC002'
  LIMIT 1
);

SET @lec003_id = (
  SELECT lecturer_id
  FROM lecturers
  WHERE lecturer_code = 'LEC003'
  LIMIT 1
);

SET @cse101_id = (
  SELECT course_id
  FROM courses
  WHERE course_code = 'CSE101'
  LIMIT 1
);

SET @cse102_id = (
  SELECT course_id
  FROM courses
  WHERE course_code = 'CSE102'
  LIMIT 1
);

SET @mth101_id = (
  SELECT course_id
  FROM courses
  WHERE course_code = 'MTH101'
  LIMIT 1
);

SET @phy101_id = (
  SELECT course_id
  FROM courses
  WHERE course_code = 'PHY101'
  LIMIT 1
);

-- 8) Create course sections assigned to lecturers (admin-assigned)
-- Use columns: course_id, semester_id, lecturer_id, section_code, max_capacity, status
INSERT IGNORE INTO course_sections (course_id, semester_id, lecturer_id, section_code, max_capacity, status)
VALUES
  (@cse101_id, @semester_id, @lec001_id, 'SE101.1', 30, 'open'),
  (@cse101_id, @semester_id, @lec001_id, 'SE101.2', 30, 'open'),
  (@cse102_id, @semester_id, @lec002_id, 'SE102.1', 30, 'open'),
  (@mth101_id, @semester_id, @lec002_id, 'SE103.1', 30, 'open'),
  (@phy101_id, @semester_id, @lec003_id, 'SE104.1', 30, 'open');

-- 9) Enroll students into sections
-- Section SE101.1 -> students SV001..SV010
INSERT IGNORE INTO enrollments (section_id, student_id, enrollment_status)
SELECT s.section_id, st.student_id, 'registered'
FROM course_sections s
JOIN students st ON st.student_code IN ('SV001','SV002','SV003','SV004','SV005','SV006','SV007','SV008','SV009','SV010')
WHERE s.section_code = 'SE101.1';

-- Section SE101.2 -> students SV011..SV015
INSERT IGNORE INTO enrollments (section_id, student_id, enrollment_status)
SELECT s.section_id, st.student_id, 'registered'
FROM course_sections s
JOIN students st ON st.student_code IN ('SV011','SV012','SV013','SV014','SV015')
WHERE s.section_code = 'SE101.2';

-- Section SE102.1 -> students SV001..SV008
INSERT IGNORE INTO enrollments (section_id, student_id, enrollment_status)
SELECT s.section_id, st.student_id, 'registered'
FROM course_sections s
JOIN students st ON st.student_code IN ('SV001','SV002','SV003','SV004','SV005','SV006','SV007','SV008')
WHERE s.section_code = 'SE102.1';

-- Section SE103.1 -> students SV009..SV016
INSERT IGNORE INTO enrollments (section_id, student_id, enrollment_status)
SELECT s.section_id, st.student_id, 'registered'
FROM course_sections s
JOIN students st ON st.student_code IN ('SV009','SV010','SV011','SV012','SV013','SV014','SV015','SV016')
WHERE s.section_code = 'SE103.1';

-- Section SE104.1 -> students SV017..SV020
INSERT IGNORE INTO enrollments (section_id, student_id, enrollment_status)
SELECT s.section_id, st.student_id, 'registered'
FROM course_sections s
JOIN students st ON st.student_code IN ('SV017','SV018','SV019','SV020')
WHERE s.section_code = 'SE104.1';

-- 10) Initialize grades rows (NULL scores) for all enrollments that don't have a grade yet
INSERT INTO grades (enrollment_id, attendance_score, exercise_score, practice_score, midterm_score, final_score, total_score, created_at, updated_at)
SELECT e.enrollment_id, NULL, NULL, NULL, NULL, NULL, NULL, NOW(), NOW()
FROM enrollments e
LEFT JOIN grades g ON g.enrollment_id = e.enrollment_id
WHERE g.enrollment_id IS NULL;

-- Done. You can now login as 'lecturer01' (password: 123456) and view the sections assigned to that lecturer.
-- To run the file from CLI:
-- mysql -u root -p your_database < backend/database/sample-data.sql
