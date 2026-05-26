# BÁO CÁO THỰC TẬP CƠ SỞ

## 1. Tổng Quan Hệ Thống

### 1.1. Giới thiệu chung
Hệ thống quản lý sinh viên được xây dựng theo mô hình tách biệt giữa backend và frontend, phục vụ ba nhóm người dùng chính gồm quản trị viên, giảng viên và sinh viên. Trên nền tảng đó, hệ thống triển khai bốn nhóm chức năng trọng tâm của đề tài:

1. Auth & khởi tạo dự án: đăng nhập bằng JWT, phân quyền theo vai trò và định tuyến theo role.
2. Quản lý điểm: giảng viên nhập điểm theo lớp học phần, sinh viên tra cứu điểm và GPA.
3. Hệ thống đơn từ: sinh viên gửi đơn nghỉ học hoặc phúc khảo, giảng viên duyệt hoặc từ chối.
4. Quản lý mật khẩu: quên mật khẩu qua OTP email và đổi mật khẩu khi đã đăng nhập.

Kiến trúc hệ thống được thiết kế theo hướng API-first. Backend chịu trách nhiệm xác thực, phân quyền, kiểm tra ràng buộc nghiệp vụ và xử lý dữ liệu; frontend chịu trách nhiệm hiển thị giao diện, điều phối luồng người dùng và gọi API thông qua các service riêng biệt.

### 1.2. Ma trận chức năng

| Nhóm chức năng | Vai trò sử dụng | Chức năng chính | Thành phần backend | Thành phần frontend |
|---|---|---|---|---|
| Auth & khởi tạo dự án | Tất cả vai trò | Đăng nhập, lấy thông tin người dùng hiện tại, định tuyến theo vai trò | AuthController, AuthService, SecurityConfig, JwtService, JwtAuthenticationFilter | LoginPage.jsx, authService.js, AuthContext.jsx, PortalRedirect.jsx |
| Quản lý điểm | Giảng viên, sinh viên | Nhập điểm, cập nhật điểm, xem kết quả học tập, tính GPA | GradeController, GradeService, StudentGradesController, StudentGradesService, GradeRepository, StudentGradesRepository | LecturerGradeEntry.jsx, Grades.jsx, Dashboard.jsx, gradeService.js |
| Hệ thống đơn từ | Sinh viên, giảng viên, quản trị viên | Gửi đơn, đính kèm file, duyệt đơn, từ chối đơn | StudentRequestController, RequestController, RequestService, StudentRequestRepository, RequestAttachmentStorageService | SubmitRequest.jsx, RequestApproval.jsx, requestService.js |
| Quản lý mật khẩu | Tất cả vai trò | Quên mật khẩu qua OTP, đặt lại mật khẩu, đổi mật khẩu | AuthController, PasswordResetService, PasswordResetToken, EmailService | ForgotPassword.jsx, ResetPassword.jsx, ChangePassword.jsx, authService.js |
| Hồ sơ người dùng | Sinh viên, giảng viên | Hiển thị hồ sơ sau khi đăng nhập | AuthService, CurrentUserResponse, StudentProfile, LecturerProfile | AuthContext.jsx, Root.jsx, Dashboard.jsx, PortalRedirect.jsx |
| Chương trình đào tạo | Sinh viên | Xem lộ trình học tập và tín chỉ tích lũy theo học kỳ | ProgramCurriculumController, ProgramCurriculumService, ProgramCurriculumRepository | Curriculum.jsx, programService.js |

### 1.3. Công nghệ sử dụng

#### Backend
- Java 21.
- Spring Boot 4.0.5.
- Spring Security để xác thực và phân quyền theo vai trò.
- Spring Data JPA để thao tác dữ liệu quan hệ.
- Spring Validation để kiểm tra dữ liệu đầu vào.
- Spring Web MVC để xây dựng REST API.
- JJWT 0.12.5 để tạo và xác thực token JWT.
- Spring Mail để gửi OTP và email thông báo.
- MySQL làm hệ quản trị cơ sở dữ liệu.

#### Frontend
- React 18.3.1.
- Vite 6.3.5 làm công cụ build.
- Tailwind CSS 4.1.12 cho giao diện.
- React Router để định tuyến.
- Lucide React cho bộ biểu tượng.
- xlsx để nhập và xuất tệp Excel.
- Các thư viện UI như Radix UI, shadcn-style primitives, Sonner, Recharts và một số tiện ích hỗ trợ giao diện.

#### Hạ tầng và công cụ
- Maven cho xây dựng backend.
- NPM cho frontend.
- CORS được cấu hình cho ứng dụng chạy trên localhost:5173.
- Tệp mẫu dữ liệu SQL được chuẩn bị để khởi tạo dữ liệu thử nghiệm.

### 1.4. Các chức năng bổ trợ đã triển khai

Bên cạnh bốn nhóm chức năng trọng tâm của đề tài, mã nguồn của dự án còn có hai chức năng bổ trợ quan trọng là hiển thị hồ sơ người dùng và tra cứu chương trình đào tạo. Hai chức năng này đều đã được triển khai đầy đủ trong backend và frontend, vì vậy không phải là phần thiếu sót của dự án.

#### 1.4.1. Hồ sơ người dùng

| Thành phần | Mô tả |
|---|---|
| Mục tiêu | Hiển thị đúng họ tên, mã sinh viên hoặc mã giảng viên, email và vai trò ngay sau khi người dùng đăng nhập |
| API | /api/auth/me |
| Dữ liệu | CurrentUserResponse, StudentProfile, LecturerProfile |
| Giao diện | AuthContext.jsx, Root.jsx, Dashboard.jsx, PortalRedirect.jsx |

Chức năng này giúp portal tự nhận diện người dùng, hiển thị khối thông tin cá nhân trên giao diện và phục vụ cho các logic điều hướng theo vai trò.

#### 1.4.2. Chương trình đào tạo

| Thành phần | Mô tả |
|---|---|
| Mục tiêu | Cho sinh viên xem lộ trình học tập, tín chỉ yêu cầu, tín chỉ đã hoàn thành, đang học và chưa mở |
| API | /api/students/{studentId}/program/curriculum |
| Dữ liệu | ProgramCurriculumDTO, ProgramCurriculumSemesterDTO, ProgramCurriculumCourseDTO |
| Giao diện | Curriculum.jsx, programService.js |

Chức năng này là phần rất quan trọng trong cổng sinh viên vì giúp người học theo dõi tiến độ hoàn thành chương trình theo từng học kỳ, thay vì chỉ xem điểm rời rạc theo từng môn.

---

## 2. Module 1: Auth & Khởi Tạo Dự Án

### 2.1. Mục tiêu nghiệp vụ
Module xác thực đóng vai trò là lớp truy cập đầu tiên của toàn hệ thống. Mục tiêu của module là đảm bảo người dùng đăng nhập an toàn bằng tài khoản đã được tạo sẵn, nhận token JWT sau khi xác thực thành công, đồng thời được điều hướng đúng cổng theo vai trò ADMIN, LECTURER hoặc STUDENT. Ngoài ra, module còn cung cấp API lấy thông tin người dùng hiện tại và nền tảng để thực hiện quên mật khẩu, đặt lại mật khẩu và đổi mật khẩu.

### 2.2. Thiết kế dữ liệu

| Đối tượng / bảng | Vai trò | Thuộc tính chính | Quan hệ |
|---|---|---|---|
| users | Tài khoản đăng nhập trung tâm | user_id, username, password_hash, email, role, status | Liên kết 1-1 với students hoặc lecturers |
| students | Hồ sơ sinh viên | student_id, user_id, program_id, student_code, full_name, date_of_birth, gender, phone, academic_status | User 1-1, tham chiếu program_id |
| lecturers | Hồ sơ giảng viên | lecturer_id, user_id, department_id, lecturer_code, full_name, work_email, phone, academic_title | User 1-1, tham chiếu department_id |
| password_reset_tokens | Token quên mật khẩu | reset_id, user_id, token_hash, expires_at, used_at, created_at | Liên kết user_id, lưu OTP và token đặt lại mật khẩu |
| CurrentUserResponse | Dữ liệu trả về sau khi xác thực | userId, username, role, fullName, studentId, lecturerId, student, lecturer | Tổng hợp từ user và hồ sơ con |
| LoginResponse | Dữ liệu phản hồi đăng nhập | token, username, role, fullName, studentId, lecturerId | Trả về cho frontend để lưu token và điều hướng |

Thiết kế dữ liệu của module này theo hướng lấy bảng users làm lõi, còn thông tin sinh viên và giảng viên được tách riêng để giảm trùng lặp và hỗ trợ mở rộng hồ sơ người dùng trong tương lai. Cấu trúc token đặt lại mật khẩu được lưu riêng trong password_reset_tokens để kiểm soát thời hạn, trạng thái sử dụng và lịch sử yêu cầu.

### 2.3. API backend đã xây dựng

| Endpoint | Phương thức | Chức năng |
|---|---|---|
| /api/auth/login | POST | Xác thực username và password, sinh JWT và trả về thông tin vai trò |
| /api/auth/me | GET | Lấy thông tin người dùng hiện tại dựa trên JWT |
| /api/auth/forgot-password | POST | Gửi OTP đặt lại mật khẩu đến email đã đăng ký |
| /api/auth/forgot-password/verify-otp | POST | Xác thực OTP và cấp reset token |
| /api/auth/reset-password | POST | Đặt lại mật khẩu bằng reset token |
| /api/auth/change-password | POST | Đổi mật khẩu khi người dùng đã đăng nhập |

### 2.4. Cách xử lý nghiệp vụ
Luồng đăng nhập được thực hiện qua AuthController và AuthService. Khi người dùng gửi username và password, hệ thống kiểm tra mật khẩu bằng PasswordEncoder, kiểm tra trạng thái tài khoản và phát sinh JWT thông qua JwtService. JWT được gắn vào header Authorization trong các request tiếp theo, còn JwtAuthenticationFilter chịu trách nhiệm đọc token, xác thực và đưa đối tượng người dùng vào SecurityContext.

SecurityConfig thiết lập cơ chế stateless, vô hiệu hóa CSRF, cho phép các API đăng nhập và quên mật khẩu truy cập công khai, đồng thời giới hạn các cụm API theo vai trò như /api/admin/**, /api/lecturer/** và /api/student/**. Cách cấu hình này tạo ra lớp bảo vệ nhất quán cho toàn hệ thống.

Đối với logic role-based redirect, frontend LoginPage.jsx đọc role trả về từ API đăng nhập và chuyển hướng sang /portal/admin, /portal/lecturer hoặc /portal/student. AuthContext.jsx thực hiện bootstrap phiên làm việc bằng cách gọi /api/auth/me khi ứng dụng khởi động lại, nhờ đó người dùng không cần đăng nhập lại nếu token còn hiệu lực.

### 2.5. Giao diện frontend
- LoginPage.jsx: giao diện đăng nhập chính, có khả năng tự chuyển hướng theo vai trò.
- authService.js: lớp gọi API cho đăng nhập, lấy thông tin người dùng, quên mật khẩu, xác thực OTP, đặt lại mật khẩu và đổi mật khẩu.
- PortalRedirect.jsx: điều hướng người dùng vào đúng portal sau khi đã có phiên đăng nhập.
- RolePortalRoute.jsx, RequireAuth.jsx, RequireRole.jsx: bảo vệ route theo trạng thái đăng nhập và vai trò.
- ForgotPassword.jsx, ResetPassword.jsx, ChangePassword.jsx: giao diện phục vụ các tình huống khôi phục mật khẩu và cập nhật bảo mật.

### 2.6. Mã nguồn liên quan

| File | Vai trò |
|---|---|
| backend/studentportal/src/main/java/com/ptit/studentportal/auth/AuthController.java | Công bố API đăng nhập, thông tin người dùng, quên mật khẩu và đổi mật khẩu |
| backend/studentportal/src/main/java/com/ptit/studentportal/auth/AuthService.java | Xử lý xác thực, sinh token và lấy hồ sơ người dùng |
| backend/studentportal/src/main/java/com/ptit/studentportal/security/SecurityConfig.java | Cấu hình bảo mật, CORS và phân quyền theo vai trò |
| backend/studentportal/src/main/java/com/ptit/studentportal/security/JwtService.java | Sinh và kiểm tra token JWT |
| backend/studentportal/src/main/java/com/ptit/studentportal/security/JwtAuthenticationFilter.java | Lọc request và nạp Authentication vào SecurityContext |
| frontend/src/app/pages/auth/LoginPage.jsx | Giao diện đăng nhập và điều hướng theo role |
| frontend/src/services/authService.js | Service gọi API auth ở frontend |
| frontend/src/context/AuthContext.jsx | Quản lý trạng thái đăng nhập phía client |
| frontend/src/app/components/PortalRedirect.jsx | Chuyển hướng vào portal phù hợp |

---

## 3. Module 2: Quản Lý Điểm

### 3.1. Mục tiêu nghiệp vụ
Module quản lý điểm cho phép giảng viên nhập, cập nhật và lưu điểm thành phần của sinh viên theo lớp học phần. Hệ thống tính điểm tổng kết trên server dựa trên trọng số của từng thành phần, bảo đảm dữ liệu đầu ra là nguồn sự thật duy nhất. Sinh viên có thể xem toàn bộ kết quả học tập, theo dõi điểm tổng kết theo học kỳ, xem GPA học kỳ, GPA tích lũy và tra cứu chi tiết từng môn.

### 3.2. Thiết kế dữ liệu

| Đối tượng / bảng | Vai trò | Thuộc tính chính | Quan hệ |
|---|---|---|---|
| grades | Lưu điểm thành phần và điểm tổng kết | grade_id, enrollment_id, attendance_score, exercise_score, practice_score, midterm_score, final_score, total_score | Liên kết 1-1 với enrollments |
| enrollments | Ghi nhận sinh viên trong lớp học phần | enrollment_id, student_id, section_id, enrollment_status | Nối students và course_sections |
| course_sections | Lớp học phần | section_id, course_id, semester_id, lecturer_id, section_code, max_capacity, status | Thuộc courses, semesters, lecturers |
| courses | Học phần | course_id, course_code, course_name, credits | Thuộc chương trình đào tạo |
| semesters | Học kỳ | semester_id, semester_name, academic_year, start_date, end_date | Dùng để nhóm điểm theo kỳ |
| GradeUpdateRequest | Dữ liệu cập nhật điểm | attendanceScore, exerciseScore, practiceScore, midtermScore, finalScore, weights | DTO cho ghi điểm |
| GradeDTO | Dữ liệu điểm trả về | điểm từng thành phần, điểm tổng, thông tin môn học và lớp học phần | DTO cho giảng viên |
| StudentGradesResponse | Tổng hợp kết quả học tập | cumulativeGpa, totalCredits, semesters | DTO cho sinh viên |
| StudentCourseGradeResponse | Môn học trong một kỳ | courseCode, credits, totalScore, letterGrade, points | DTO hiển thị học kỳ |

Thiết kế này đảm bảo điểm tổng kết không được lưu theo dữ liệu do client tự tính. Trường total_score vẫn được lưu trong bảng grades, nhưng giá trị này do GradeService tính lại trên server dựa trên các trọng số đã được kiểm tra hợp lệ.

### 3.3. API backend đã xây dựng

| Endpoint | Phương thức | Chức năng |
|---|---|---|
| /api/lecturers/{lecturerId}/sections | GET | Lấy danh sách lớp học phần do giảng viên phụ trách |
| /api/lecturers/{lecturerId}/sections/{sectionId}/grades | GET | Lấy danh sách điểm của một lớp học phần |
| /api/lecturers/{lecturerId}/grades/{enrollmentId} | GET | Lấy chi tiết một bản ghi điểm theo enrollment |
| /api/lecturers/{lecturerId}/grades/{enrollmentId} | PUT | Cập nhật một sinh viên và tính lại điểm tổng kết |
| /api/lecturers/{lecturerId}/grades/batch-update | POST | Cập nhật hàng loạt điểm cho nhiều sinh viên |
| /api/students/{studentId}/grades | GET | Lấy toàn bộ kết quả học tập của sinh viên |
| /api/students/{studentId}/grades/semester/{semesterId} | GET | Lấy điểm theo một học kỳ cụ thể |
| /api/students/{studentId}/gpa | GET | Lấy GPA và xếp loại học tập |
| /api/students/{studentId}/transcript | GET | Xuất dữ liệu bảng điểm tương tự transcript |

### 3.4. Cách xử lý nghiệp vụ
Luồng nhập điểm của giảng viên đi qua GradeController và GradeService. Khi giảng viên lưu điểm, hệ thống đọc dữ liệu đầu vào từ GradeUpdateRequest, kiểm tra trọng số phải bằng 100, kiểm tra từng điểm nằm trong khoảng 0 đến 10, sau đó tự tính totalScore bằng công thức trung bình có trọng số. Điều này giúp loại bỏ rủi ro client gửi lên totalScore đã bị can thiệp hoặc tính sai.

GradeRepository dùng các truy vấn native để ghép dữ liệu từ enrollments, students, course_sections, courses, semesters và grades. Nhờ đó, mỗi bản ghi điểm trả về đủ thông tin sinh viên, lớp học phần, học kỳ và môn học.

Phía sinh viên, StudentGradesService lấy toàn bộ các dòng điểm của một sinh viên rồi gom nhóm theo semesterId. Từ mỗi môn, hệ thống tính điểm chữ, điểm hệ 4, GPA học kỳ và GPA tích lũy. Thuật toán này có hai mức tổng hợp: mức môn học và mức học kỳ. Điểm tổng kết môn học được chuyển sang điểm chữ theo thang chuẩn A+, A, B+, B, C+, C, D+, D, F; sau đó nhân với số tín chỉ để tính GPA.

Frontend phần giảng viên sử dụng LecturerGradeEntry.jsx để nhập thủ công, nhập từ Excel, xuất Excel và lưu hàng loạt. Giao diện đã được bổ sung cơ chế kiểm tra dữ liệu đầu vào, hiển thị hàng lỗi khi import, đồng thời vô hiệu hóa thao tác lưu nếu dữ liệu chưa hợp lệ. Frontend phần sinh viên sử dụng Grades.jsx để xem bảng điểm theo từng học kỳ, đồng thời cho phép mở hộp thoại xem chi tiết từng môn. Dashboard.jsx hiển thị biểu đồ điểm theo học kỳ đang chọn, giúp sinh viên quan sát trực quan tiến trình học tập.

### 3.5. Giao diện frontend
- LecturerGradeEntry.jsx: giao diện nhập điểm, cập nhật trọng số, import/export Excel, tô nổi hàng lỗi và xem lại bản nháp.
- Grades.jsx: trang bảng điểm của sinh viên, hiển thị theo học kỳ và có nút xem chi tiết điểm thành phần.
- Dashboard.jsx: trang tổng quan sinh viên, hiển thị biểu đồ kết quả học tập theo học kỳ.
- gradeService.js: service gọi API cho cả giảng viên và sinh viên.

### 3.6. Mã nguồn liên quan

| File | Vai trò |
|---|---|
| backend/studentportal/src/main/java/com/ptit/studentportal/grade/GradeController.java | Công bố API cho giảng viên thao tác điểm |
| backend/studentportal/src/main/java/com/ptit/studentportal/grade/GradeService.java | Xử lý tính điểm, kiểm tra ràng buộc và cập nhật dữ liệu |
| backend/studentportal/src/main/java/com/ptit/studentportal/grade/Grade.java | Entity lưu điểm thành phần và điểm tổng kết |
| backend/studentportal/src/main/java/com/ptit/studentportal/grade/GradeRepository.java | Truy vấn dữ liệu lớp học phần và chi tiết điểm |
| backend/studentportal/src/main/java/com/ptit/studentportal/studentgrade/StudentGradesController.java | API cho sinh viên xem điểm, GPA và transcript |
| backend/studentportal/src/main/java/com/ptit/studentportal/studentgrade/StudentGradesService.java | Tổng hợp điểm theo học kỳ và tính GPA |
| backend/studentportal/src/main/java/com/ptit/studentportal/studentgrade/StudentGradesRepository.java | Truy vấn bảng điểm của sinh viên từ nhiều bảng liên kết |
| frontend/src/app/pages/lecturer/LecturerGradeEntry.jsx | Giao diện nhập và duyệt điểm của giảng viên |
| frontend/src/app/pages/student/Grades.jsx | Giao diện bảng điểm của sinh viên |
| frontend/src/app/pages/student/Dashboard.jsx | Giao diện biểu đồ điểm theo học kỳ |
| frontend/src/services/gradeService.js | Service gọi API điểm |

---

## 4. Module 3: Hệ Thống Đơn Từ (Vắng Học và Phúc Khảo)

### 4.1. Mục tiêu nghiệp vụ
Module đơn từ hỗ trợ sinh viên gửi đơn xin nghỉ học và đơn phúc khảo điểm. Đơn có thể kèm tệp đính kèm để bổ sung minh chứng. Giảng viên được phân quyền xem danh sách đơn chờ xử lý, xem chi tiết từng đơn, tải tệp đính kèm và ra quyết định duyệt hoặc từ chối. Quy trình này giúp số hóa khâu tiếp nhận và phản hồi đơn từ trong môi trường học tập.

### 4.2. Thiết kế dữ liệu

| Đối tượng / bảng | Vai trò | Thuộc tính chính | Quan hệ |
|---|---|---|---|
| student_requests | Lưu thông tin đơn từ | request_id, student_id, request_type_id, title, content, section_id, section_code, status, processed_by, processed_at, created_at, updated_at | Thuộc sinh viên, loại đơn và trạng thái xử lý |
| request_types | Danh mục loại đơn | request_type_id, request_type_code, request_type_name | Chuẩn hóa loại yêu cầu |
| request_attachments | Tệp đính kèm của đơn | attachment_id, request_id, file_name, file_url, created_at | 1-n với student_requests |
| RequestAttachmentStorageService | Dịch vụ lưu file | fileName, fileUrl | Lưu file vào thư mục uploads/request-attachments |
| StudentRequestDTO | Dữ liệu đơn trả về | thông tin sinh viên, loại đơn, trạng thái, nội dung, attachments | DTO cho cả sinh viên và giảng viên |
| StudentRequestCreateRequest | Dữ liệu tạo đơn | requestTypeCode, title, content, fromDate, sectionId, sectionCode, courseCode, courseName, attachmentFileName, attachmentFileUrl | DTO multipart cho frontend |
| RequestDecisionRequest | Dữ liệu duyệt đơn | note | DTO cho thao tác duyệt/từ chối |

Thiết kế dữ liệu tách biệt rõ phần nội dung đơn và phần tệp đính kèm. File được lưu vào thư mục vật lý trên máy chủ, còn metadata file_name và file_url được lưu trong cơ sở dữ liệu để dễ truy xuất và hiển thị lại.

### 4.3. API backend đã xây dựng

| Endpoint | Phương thức | Chức năng |
|---|---|---|
| /api/students/{studentId}/requests | GET | Lấy danh sách đơn của sinh viên |
| /api/students/{studentId}/requests | POST | Gửi đơn mới kèm tệp đính kèm |
| /api/lecturers/{lecturerId}/requests/pending | GET | Lấy danh sách đơn chờ duyệt của giảng viên |
| /api/lecturers/{lecturerId}/requests/{requestId} | GET | Xem chi tiết một đơn |
| /api/lecturers/{lecturerId}/requests/{requestId}/approve | POST | Duyệt đơn |
| /api/lecturers/{lecturerId}/requests/{requestId}/reject | POST | Từ chối đơn |

### 4.4. Cách xử lý nghiệp vụ
RequestService là trung tâm của module. Khi sinh viên gửi đơn, hệ thống kiểm tra sinh viên tồn tại, kiểm tra loại đơn và, với trường hợp xin nghỉ học, gọi validateLeaveRequest để bảo đảm sinh viên chỉ xin nghỉ ở lớp học phần thuộc học kỳ hiện tại. Điều kiện này được suy ra từ dữ liệu điểm của sinh viên, tránh việc tạo đơn cho lớp không hợp lệ.

Nội dung đơn được chuẩn hóa bằng buildContent, trong đó hệ thống ghép thêm ngày nghỉ, lớp học phần, mã lớp, mã môn và tên môn nếu có. Sau khi lưu student_requests, nếu có file đính kèm thì RequestAttachmentStorageService sẽ sinh tên file an toàn, lưu file vào thư mục uploads/request-attachments và tạo bản ghi request_attachments.

Đối với giảng viên, RequestController cung cấp danh sách pending theo lecturerId, lấy chi tiết đơn và xử lý duyệt/từ chối. Khi cập nhật trạng thái, hệ thống kiểm tra đơn chưa xử lý trước đó, sau đó ghi processed_by và processed_at. Cơ chế này đảm bảo đơn chỉ được xử lý một lần.

Frontend SubmitRequest.jsx cho phép sinh viên chọn loại đơn, chọn lớp học phần phù hợp từ dữ liệu điểm hiện có, nhập nội dung và tải file. Frontend RequestApproval.jsx hiển thị danh sách đơn chờ duyệt, mở modal xem chi tiết, liệt kê tệp đính kèm và thực hiện approve/reject ngay từ hộp thoại thao tác.

### 4.5. Giao diện frontend
- SubmitRequest.jsx: form gửi đơn cho sinh viên, có hỗ trợ đính kèm file và tự gợi ý lớp học phần hợp lệ.
- RequestApproval.jsx: màn hình duyệt đơn của giảng viên, hiển thị danh sách chờ xử lý và chi tiết đơn.
- requestService.js: service gọi API cho phần đơn từ.

### 4.6. Mã nguồn liên quan

| File | Vai trò |
|---|---|
| backend/studentportal/src/main/java/com/ptit/studentportal/request/StudentRequestController.java | API cho sinh viên gửi và xem đơn |
| backend/studentportal/src/main/java/com/ptit/studentportal/request/RequestController.java | API cho giảng viên duyệt và xem đơn |
| backend/studentportal/src/main/java/com/ptit/studentportal/request/RequestService.java | Xử lý nghiệp vụ gửi, duyệt, từ chối và gắn tệp đính kèm |
| backend/studentportal/src/main/java/com/ptit/studentportal/request/StudentRequest.java | Entity đơn từ |
| backend/studentportal/src/main/java/com/ptit/studentportal/request/RequestType.java | Entity loại đơn |
| backend/studentportal/src/main/java/com/ptit/studentportal/request/RequestAttachment.java | Entity tệp đính kèm |
| backend/studentportal/src/main/java/com/ptit/studentportal/request/RequestAttachmentStorageService.java | Lưu file đính kèm lên hệ thống tệp |
| backend/studentportal/src/main/java/com/ptit/studentportal/request/StudentRequestRepository.java | Truy vấn danh sách đơn và tệp đính kèm |
| frontend/src/app/pages/student/SubmitRequest.jsx | Giao diện sinh viên gửi đơn |
| frontend/src/app/components/RequestApproval.jsx | Giao diện giảng viên duyệt đơn |
| frontend/src/services/requestService.js | Service gọi API đơn từ |

---

## 5. Module 4: Quản Lý Mật Khẩu

### 5.1. Mục tiêu nghiệp vụ
Module quản lý mật khẩu phục vụ hai tình huống chính. Thứ nhất, người dùng quên mật khẩu sẽ nhận OTP qua email, xác thực OTP và đặt lại mật khẩu bằng token tạm thời. Thứ hai, người dùng đang đăng nhập có thể đổi mật khẩu trực tiếp. Mục tiêu của module là tăng khả năng tự phục hồi tài khoản và bảo đảm an toàn khi thay đổi thông tin xác thực.

### 5.2. Thiết kế dữ liệu

| Đối tượng / bảng | Vai trò | Thuộc tính chính | Quan hệ |
|---|---|---|---|
| password_reset_tokens | Lưu OTP và reset token | reset_id, user_id, token_hash, expires_at, used_at, created_at | Liên kết user_id, quản lý vòng đời token |
| users | Tài khoản nguồn để đổi mật khẩu | user_id, username, password_hash, email, role, status | Cập nhật password_hash khi đổi mật khẩu |
| ForgotPasswordRequest | Dữ liệu yêu cầu OTP | email | DTO gửi email |
| VerifyOtpRequest | Dữ liệu xác thực OTP | email, otp | DTO xác thực 6 số |
| ResetPasswordRequest | Dữ liệu đặt lại mật khẩu | token, newPassword, confirmPassword | DTO hoàn tất reset |
| ChangePasswordRequest | Dữ liệu đổi mật khẩu | currentPassword, newPassword, confirmPassword | DTO cho người đã đăng nhập |

Dữ liệu token được băm bằng SHA-256 trước khi lưu, thay vì lưu token gốc. Cách làm này giảm rủi ro lộ token nếu cơ sở dữ liệu bị truy cập trái phép. OTP có thời hạn ngắn, token đặt lại mật khẩu có thời hạn riêng và token đã sử dụng sẽ được đánh dấu để không thể dùng lại.

### 5.3. API backend đã xây dựng

| Endpoint | Phương thức | Chức năng |
|---|---|---|
| /api/auth/forgot-password | POST | Gửi OTP đặt lại mật khẩu tới email |
| /api/auth/forgot-password/verify-otp | POST | Xác thực OTP và cấp reset token |
| /api/auth/reset-password | POST | Đặt lại mật khẩu bằng reset token |
| /api/auth/change-password | POST | Đổi mật khẩu khi đã đăng nhập |

### 5.4. Cách xử lý nghiệp vụ
PasswordResetService triển khai chu trình quên mật khẩu theo ba bước. Bước đầu, requestPasswordReset kiểm tra email tồn tại, xóa token hết hạn, áp dụng thời gian chờ giữa hai lần yêu cầu OTP và tạo OTP 6 chữ số. OTP được băm và lưu dưới dạng token_hash để đối chiếu sau này. OTP được gửi qua email bằng EmailService.

Bước hai, verifyOtpAndIssueResetToken kiểm tra email, đối chiếu OTP đã băm và nếu hợp lệ thì sinh một reset token ngẫu nhiên, lưu token đã băm cùng thời gian hết hạn. Frontend sẽ nhận token gốc tạm thời này để chuyển sang màn hình đặt lại mật khẩu.

Bước ba, resetPassword kiểm tra token, xác nhận token còn hạn và chưa dùng, sau đó cập nhật password_hash của người dùng bằng PasswordEncoder. Sau khi đổi thành công, token được đánh dấu đã dùng và hệ thống gửi email xác nhận.

Đối với đổi mật khẩu khi đã đăng nhập, AuthService kiểm tra mật khẩu hiện tại, kiểm tra mật khẩu mới và mật khẩu xác nhận khớp nhau, sau đó cập nhật password_hash và gửi email xác nhận. Đây là quy trình ngắn gọn hơn so với quên mật khẩu vì người dùng đã được xác thực bằng JWT.

Frontend gồm ForgotPassword.jsx với hai bước nhập email và nhập OTP, ResetPassword.jsx để đặt mật khẩu mới từ reset token, và ChangePassword.jsx để đổi mật khẩu trong portal sau khi đăng nhập.

### 5.5. Giao diện frontend
- ForgotPassword.jsx: giao diện gửi OTP và xác thực OTP theo từng bước.
- ResetPassword.jsx: giao diện nhập mật khẩu mới bằng reset token.
- ChangePassword.jsx: giao diện đổi mật khẩu cho người dùng đã đăng nhập.
- authService.js: service gọi các API mật khẩu.

### 5.6. Mã nguồn liên quan

| File | Vai trò |
|---|---|
| backend/studentportal/src/main/java/com/ptit/studentportal/auth/PasswordResetService.java | Xử lý OTP, reset token và đặt lại mật khẩu |
| backend/studentportal/src/main/java/com/ptit/studentportal/auth/PasswordResetToken.java | Entity lưu token và thời hạn sử dụng |
| backend/studentportal/src/main/java/com/ptit/studentportal/auth/AuthController.java | Công bố các API quên và đổi mật khẩu |
| backend/studentportal/src/main/java/com/ptit/studentportal/auth/AuthService.java | Đổi mật khẩu khi người dùng đã đăng nhập |
| frontend/src/app/pages/auth/ForgotPassword.jsx | Màn hình quên mật khẩu |
| frontend/src/app/pages/auth/ResetPassword.jsx | Màn hình đặt lại mật khẩu |
| frontend/src/app/pages/shared/ChangePassword.jsx | Màn hình đổi mật khẩu |
| frontend/src/services/authService.js | Service gọi API mật khẩu |

---

## 6. Đánh Giá Kết Quả Và Hướng Phát Triển

### 6.1. Đánh giá kết quả đạt được
Hệ thống đã hoàn thành đầy đủ bốn nhóm chức năng trọng tâm theo yêu cầu bài thực tập cơ sở. Module xác thực đã thiết lập được đăng nhập JWT, phân quyền theo vai trò và điều hướng đúng cổng chức năng. Module quản lý điểm cho phép giảng viên cập nhật điểm theo lớp học phần, đồng thời sinh viên xem được bảng điểm theo học kỳ, GPA học kỳ và GPA tích lũy. Module đơn từ đã số hóa quy trình xin nghỉ học và phúc khảo, có hỗ trợ file đính kèm và luồng xử lý duyệt hoặc từ chối. Module quản lý mật khẩu đã bao phủ cả quên mật khẩu qua OTP và đổi mật khẩu cho tài khoản đang hoạt động.

Về mặt kỹ thuật, hệ thống bảo đảm phần tính toán nghiệp vụ quan trọng như tổng điểm, GPA và phân quyền đều được xử lý ở phía server. Frontend chỉ giữ vai trò nhập liệu, hiển thị và gọi API, nhờ đó giảm nguy cơ sai lệch dữ liệu giữa client và server.

### 6.2. Hạn chế hiện tại
- Một số màn hình vẫn còn thiên về nghiệp vụ cốt lõi, chưa có nhiều chức năng nâng cao như phân trang sâu, bộ lọc đa tiêu chí hoặc xuất báo cáo PDF.
- Phần thông báo và hoạt động gần đây ở một số giao diện còn mang tính minh họa, chưa liên thông hoàn toàn với dữ liệu nghiệp vụ phát sinh.
- Cơ chế audit log và lịch sử thao tác chưa được chuẩn hóa toàn hệ thống.
- Một số quy trình nghiệp vụ đặc thù như phúc khảo điểm vẫn có thể mở rộng thêm trạng thái trung gian hoặc luồng phản hồi hai chiều.

### 6.3. Hướng phát triển
- Bổ sung nhật ký thao tác cho các nghiệp vụ quan trọng như nhập điểm, duyệt đơn và đổi mật khẩu.
- Mở rộng chức năng đơn từ sang nhiều loại biểu mẫu hơn, ví dụ đơn xin bảo lưu, đơn xin học lại, đơn đăng ký xác nhận.
- Tăng cường phân tích và thống kê điểm theo biểu đồ nâng cao, theo ngành, theo lớp và theo khóa.
- Hoàn thiện cơ chế thông báo thời gian thực cho sinh viên và giảng viên.
- Chuẩn hóa xuất báo cáo dưới dạng PDF hoặc Excel cho toàn bộ module.
- Bổ sung kiểm thử tự động nhiều hơn cho các luồng biên và các trường hợp dữ liệu không hợp lệ.

---

## 7. Kết Luận

Đề tài đã xây dựng thành công một hệ thống quản lý sinh viên có cấu trúc rõ ràng, tách biệt giữa xác thực, quản lý điểm, xử lý đơn từ và quản lý mật khẩu. Các nghiệp vụ được triển khai theo hướng trung tâm hóa ở backend, đảm bảo tính nhất quán của dữ liệu và an toàn trong xử lý quyền truy cập. Phần frontend được tổ chức theo từng portal cho sinh viên, giảng viên và quản trị viên, góp phần làm rõ luồng sử dụng và nâng cao trải nghiệm người dùng.

Từ góc độ thực tập cơ sở, hệ thống đã thể hiện được đầy đủ các nội dung cốt lõi của một ứng dụng quản lý học vụ hiện đại: xác thực an toàn, phân quyền theo vai trò, chuẩn hóa dữ liệu, xử lý nghiệp vụ theo quy trình và giao diện người dùng trực quan. Đây là nền tảng phù hợp để tiếp tục phát triển các chức năng mở rộng trong giai đoạn tiếp theo.
