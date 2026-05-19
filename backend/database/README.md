# Database Setup & Seeding

## Tổng Quan
Dự án này sử dụng **MySQL 9.x** với character set `utf8mb4` để hỗ trợ tiếng Việt. 

## Cơ Cấu Thư Mục
```
backend/database/
├── portal.sql           # Schema DDL + constraints + triggers + indexes
├── seed_users.sql       # Dữ liệu test: 3 tài khoản (student01/lecturer01/admin01)
└── README.md            # File này
```

## Hướng Dẫn Chạy

### 1. Khởi Tạo Database Từ Đầu (Lần Đầu)

#### Option A: Dùng MySQL Workbench (GUI)
```
1. Mở MySQL Workbench
2. Kết nối tới MySQL server (localhost:3306)
3. File → Open SQL Script → chọn portal.sql
4. Nhấn Run (⚡) để tạo database + schema + trigger + index
5. Sau đó, mở seed_users.sql
6. Nhấn Run để chèn dữ liệu test
```

#### Option B: Dùng MySQL CLI
```bash
cd backend/database

# Tạo schema + DDL
mysql -u root -p < portal.sql

# Nhập seed data
mysql -u root -p student_portal < seed_users.sql
```

### 2. Xác Minh Dữ Liệu
```sql
-- Kiểm tra database đã tạo
SHOW DATABASES;
USE student_portal;

-- Liệt kê tất cả bảng
SHOW TABLES;

-- Kiểm tra 3 tài khoản test
SELECT user_id, username, role, status FROM users;

-- Kiểm tra hồ sơ sinh viên
SELECT s.student_id, s.full_name, u.username 
FROM students s 
JOIN users u ON s.user_id = u.user_id;

-- Kiểm tra hồ sơ giảng viên
SELECT l.lecturer_id, l.full_name, u.username 
FROM lecturers l 
JOIN users u ON l.user_id = u.user_id;
```

### 3. Chạy Backend
```bash
cd backend/studentportal

# Build + test
.\mvnw.cmd -DskipTests=true package

# Khởi động (sẽ validate schema + không modify nếu dùng ddl-auto=validate)
.\mvnw.cmd spring-boot:run

# Hoặc chạy JAR trực tiếp
java -jar target\studentportal-0.0.1-SNAPSHOT.jar
```

### 4. Smoke Test Auth

#### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student01","password":"123456"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "username": "student01",
    "role": "STUDENT",
    "fullName": "Nguyen Van Thai"
  }
}
```

#### Lấy Current User (cần token từ login)
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```

## Tài Khoản Test
| Username | Password | Role | Hồ Sơ |
|----------|----------|------|-------|
| student01 | 123456 | STUDENT | Nguyễn Văn Thái (ST001) |
| lecturer01 | 123456 | LECTURER | Trần Thị Châu (LC001) |
| admin01 | 123456 | ADMIN | - |

**Ghi chú**: Toàn bộ mật khẩu được mã hóa bằng BCrypt.

## Cấu Trúc Schema Chính

### Nhóm 1: Xác Thực & Tài Khoản
- `users` – Tài khoản đăng nhập (role: student, lecturer, admin)
- `refresh_tokens` – Blacklist JWT refresh token

### Nhóm 2: Tổ Chức
- `departments` – Khoa
- `programs` – Chương trình đào tạo

### Nhóm 3: Hồ Sơ
- `students` – Sinh viên
- `lecturers` – Giảng viên

### Nhóm 4: Học Phần & Lớp Học
- `courses` – Học phần
- `course_sections` – Lớp học phần
- `semesters` – Học kỳ
- `schedules` – Thời khoá biểu
- `exams` – Lịch thi
- `rooms` – Phòng học/thi

### Nhóm 5: Đăng Ký & Điểm
- `enrollments` – Đăng ký học
- `grades` – Điểm số (total_score = GENERATED COLUMN)
- `gpa_history` – Lịch sử GPA

### Nhóm 6: Học Phí
- `tuition_fees` – Học phí
- `payments` – Giao dịch thanh toán
- `e_invoices` – Hoá đơn điện tử

### Nhóm 7: Tương Tác
- `student_requests` – Yêu cầu hành chính
- `notifications` – Thông báo
- `feedbacks` – Phản hồi/Góp ý

## Triggers
- `trg_course_prereq_no_self_insert` – Ngăn môn học tự tham chiếu (INSERT)
- `trg_course_prereq_no_self_update` – Ngăn môn học tự tham chiếu (UPDATE)

## View
- `vw_section_capacity` – Sĩ số thực tế của lớp học phần

## Backend Configuration
- `spring.jpa.hibernate.ddl-auto=validate` – Chỉ kiểm tra schema, không tự động chỉnh sửa
- Database: `student_portal`
- Charset: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`

## Troubleshooting

### 1. Connection Refused
```
Error: java.sql.SQLException: communications link failure
```
**Giải pháp**: Kiểm tra MySQL server đang chạy
```bash
mysql -u root -p -e "SELECT 1;"
```

### 2. Schema Mismatch
```
Error: Mapped property "xyz" not found
```
**Giải pháp**: Chạy lại `portal.sql` để đảm bảo schema đúng với entity Java

### 3. Login Failed (401)
```
Error: Invalid username or password
```
**Giải pháp**: Chạy lại `seed_users.sql` để đảm bảo dữ liệu test tồn tại

## Hỗ Trợ Thêm
- Xem chi tiết mô tả cơ sở dữ liệu: `docs/02-Mô tả thiết kế cơ sở dữ liệu.txt`
- Backend code: `backend/studentportal/src/main/java/`
- Frontend: `frontend/src/`


Đã chỉnh sửa bảng 16,19
-Bảng 16: chỉnh lại để linh hoạt trọng số, thêm các thuộc tính điểm thành phần
-Bảng 19: thêm 2 thuộc thính section_id, section_code