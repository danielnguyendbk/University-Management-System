# University Management System / Student Portal

## 1. Giới thiệu dự án

**University Management System / Student Portal** là hệ thống quản lý đào tạo và cổng thông tin sinh viên. Dự án gồm backend Spring Boot và frontend React, hỗ trợ các nghiệp vụ chính như:

- Đăng nhập, phân quyền theo vai trò `ADMIN`, `STUDENT`, `LECTURER`.
- Quản lý sinh viên, giảng viên, môn học, chương trình đào tạo.
- Quản lý lớp học phần, đăng ký học phần.
- Quản lý thời khóa biểu, lịch học, phòng học, tuần học, lịch nghỉ.
- Thanh toán học phí trực tiếp trên website.
- Quản lý điểm, hóa đơn điện tử, lịch thi.
- Gửi/thao tác thông báo và xử lý yêu cầu sinh viên.

## 2. Công nghệ sử dụng

### Backend

- Java 21
- Spring Boot 4.0.5
- Spring MVC, Spring Security, Spring Data JPA, Validation
- Maven / Maven Wrapper
- MySQL Connector/J
- JWT, Lombok, Apache POI, OpenPDF, SendGrid SMTP

### Frontend

- React 18.3.1
- Vite 6.3.5
- npm
- React Router, Axios, Tailwind CSS, Radix UI, MUI, Lucide React, Recharts, XLSX

### Database

- MySQL
- File SQL chính trong project: `backend/studentportal/docs/merge_migration.sql`
- Database mặc định theo cấu hình hiện tại: `merge_migration`

## 3. Yêu cầu môi trường

- Java JDK 21.
- Node.js 20+ và npm. Project dùng Vite 6; một số dependency frontend yêu cầu Node >= 20.
- MySQL Server 8.x hoặc phiên bản tương thích.
- IDE gợi ý: IntelliJ IDEA / Eclipse / VS Code.
- Công cụ quản trị database gợi ý: MySQL Workbench, DBeaver hoặc phpMyAdmin.

## 4. Hướng dẫn cấu hình database

File cấu hình backend cần kiểm tra:

```text
backend/studentportal/src/main/resources/application.properties
```

Các cấu hình quan trọng:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/merge_migration?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&allowPublicKeyRetrieval=true
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
server.port=8080
```

Project đang dùng `spring.jpa.hibernate.ddl-auto=validate`, vì vậy cần import schema/database trước khi chạy backend.

Cách import database bằng file SQL có sẵn:

```bash
cd backend/studentportal
mysql -u your_mysql_username -p < docs/merge_migration.sql
```

File `merge_migration.sql` đã có lệnh tạo database `merge_migration`, tạo bảng và seed một phần dữ liệu. Nếu bạn dùng database khác, hãy sửa lại `spring.datasource.url` cho khớp.

## 5. Dữ liệu mẫu cho đồ án

Link dữ liệu mẫu:

https://drive.google.com/drive/folders/1H3fMJuBx3ydawJ2IWKHGlrLDSjdMKHFk

Thư mục Google Drive này chứa dữ liệu mẫu phục vụ demo/kiểm thử đồ án.

Cách dùng dữ liệu mẫu:

1. Tải các file dữ liệu mẫu từ Google Drive về máy.
2. Import file excel sinh viên, giảng viên.
3. Import file Danh mục tổng hợp trước khi import các file chương trình đào tạo các ngành
4. Chạy cái file .sql trong thư mục Daniel để lấy dữ liệu nền
5. Import file timetable_hk2_from_sql.xlsx để nhập thời khóa biểu các học phần
6. Import file exam_hk2_final.xlsx để có lịch thi các môn học

Gợi ý theo loại file:

- File `.sql`: dùng để import database, schema hoặc seed data.
- File Excel `.xlsx` / `.xls`: dùng cho các chức năng import dữ liệu trong hệ thống như sinh viên, giảng viên, môn học, thời khóa biểu, lớp học phần, lịch thi nếu file tương ứng có trong dữ liệu mẫu.
- File tài khoản mẫu: dùng để đăng nhập thử các role như `ADMIN`, `STUDENT`, `LECTURER` nếu dữ liệu có cung cấp.

## 6. Hướng dẫn chạy backend

Di chuyển vào thư mục backend:

```bash
cd backend/studentportal
```

Chạy bằng Maven Wrapper:

```bash
./mvnw spring-boot:run
```

Trên Windows có thể dùng:

```bash
mvnw.cmd spring-boot:run
```

Nếu đã cài Maven toàn cục:

```bash
mvn spring-boot:run
```

Backend mặc định chạy tại:

```text
http://localhost:8080
```

API base URL frontend đang gọi:

```text
http://localhost:8080/api
```

## 7. Hướng dẫn chạy frontend

Di chuyển vào thư mục frontend:

```bash
cd frontend
```

Cài dependencies:

```bash
npm install
```

Chạy development server:

```bash
npm run dev
```

Hoặc:

```bash
npm start
```

Frontend mặc định chạy tại:

```text
http://localhost:5173
```

## 8. Tài khoản đăng nhập mẫu

Trong file `backend/studentportal/docs/merge_migration.sql` có seed tài khoản admin:

```text
Username: admin01
Password: 123456
Role: ADMIN
```
Sau khi import sinh viên:
Username: Mã sinh viên in hoa (D22KH001)
Password: Mã sinh viên in thường(d22kh001)
Role: STUDENT

Sau khi import giảng viên:
Username: Mã giảng viên in hoa (GV001)
Password: Mã giảng viên in thường(gv001)
Role: LECTURER

Sau lần đăng nhập lần đầu sẽ bị yêu cầu đổi mật khẩu khác do cá nhân tự tạo.

## 9. Quy trình demo đề xuất

1. Import database/schema bằng `backend/studentportal/docs/merge_migration.sql`.
2. Nếu có file `.sql` bổ sung trong dữ liệu mẫu, import thêm theo đúng hướng dẫn của dữ liệu mẫu.
3. Chạy backend tại `http://localhost:8080`.
4. Chạy frontend tại `http://localhost:5173`.
5. Đăng nhập bằng tài khoản mẫu.
6. Demo các chức năng chính: quản lý sinh viên, giảng viên, môn học, lớp học phần, đăng ký học phần.
7. Demo thời khóa biểu: quản lý lịch mẫu, generate lịch học, xem lịch theo sinh viên/giảng viên/admin.
8. Demo import dữ liệu nếu có file Excel tương ứng: sinh viên, giảng viên, môn học, thời khóa biểu, lịch thi.
9. Kiểm tra học phí, lịch thi, điểm và thông báo nếu dữ liệu mẫu đã đủ.

## 10. Lỗi thường gặp

- Backend không kết nối được database: kiểm tra MySQL đã chạy và database đã được import.
- Sai username/password database: sửa trong `application.properties`.
- Port `8080` bị chiếm: đổi `server.port` trong backend hoặc tắt process đang dùng port.
- Port `5173` bị chiếm: đổi port trong `frontend/vite.config.js` hoặc tắt process đang dùng port.
- Frontend gọi sai API URL: kiểm tra `frontend/src/services/app.js`, giá trị hiện tại là `http://localhost:8080/api`.
- Chưa import dữ liệu mẫu nên màn hình trống hoặc không có học kỳ/lớp học phần để hiển thị.
- Token hết hạn hoặc chưa đăng nhập: đăng xuất, xóa session trình duyệt nếu cần, rồi đăng nhập lại.
- Dữ liệu thời khóa biểu/lớp học phần/học phí/lịch thi không hiển thị: kiểm tra học kỳ, năm học, trạng thái dữ liệu và quyền của tài khoản đang đăng nhập.

## 11. Ghi chú 

Đây là project đồ án phục vụ demo hệ thống quản lý đào tạo/sinh viên. Dữ liệu mẫu trong Google Drive dùng để phục vụ demo và kiểm thử. Một số màn hình như thời khóa biểu, lớp học phần, học phí, lịch thi cần dữ liệu đúng học kỳ/năm học thì mới hiển thị đầy đủ.
