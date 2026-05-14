import type { RoleCredential } from "../types";

export const ROLE_CREDENTIALS: RoleCredential[] = [
  { role: "Admin", email: "admin@university.edu.vn", hint: "Quản trị hệ thống" },
  { role: "Staff", email: "staff@university.edu.vn", hint: "Giáo vụ / Phòng đào tạo" },
  { role: "Lecturer", email: "lecturer@university.edu.vn", hint: "Giảng viên" },
  { role: "Employee", email: "employee@university.edu.vn", hint: "Nhân viên phòng thiết bị" },
  { role: "Student", email: "student@university.edu.vn", hint: "Sinh viên" },
];

export const DEMO_PASSWORD = "password123";
