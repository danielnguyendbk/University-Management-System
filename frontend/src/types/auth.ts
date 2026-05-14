export type UserRole = "Admin" | "Staff" | "Lecturer" | "Employee" | "Student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  code: string;
}
