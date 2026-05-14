import type { User, UserRole } from "@/types/auth";

import type { LoginPayload } from "../types";

const STORAGE_KEY = "csms_user";

const resolveUserFromEmail = (email: string): Omit<User, "id" | "email"> & { role: UserRole } => {
  if (email.includes("lecturer") || email.includes("gv")) {
    return {
      role: "Lecturer",
      name: "TS. Lê Văn Minh",
      department: "Khoa Công nghệ Thông tin",
      code: "GV001",
    };
  }

  if (email.includes("employee") || email.includes("nv")) {
    return {
      role: "Employee",
      name: "Phạm Thị Lan",
      department: "Phòng Quản trị - Thiết bị",
      code: "NV025",
    };
  }

  if (email.includes("student") || email.includes("sv")) {
    return {
      role: "Student",
      name: "Nguyễn Văn Hùng",
      department: "Khoa Công nghệ Thông tin",
      code: "B21DCCN123",
    };
  }

  if (email.includes("staff")) {
    return {
      role: "Staff",
      name: "Trần Thị Thanh Hoa",
      department: "Phòng Đào tạo",
      code: "PGV012",
    };
  }

  return {
    role: "Admin",
    name: "Nguyễn Văn Quản Trị",
    department: "Phòng Quản trị Hệ thống",
    code: "ADM001",
  };
};

export const authService = {
  async login(payload: LoginPayload): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const profile = resolveUserFromEmail(payload.email);

    return {
      id: "1",
      email: payload.email,
      ...profile,
    };
  },

  persistUser(user: User | null): void {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },

  getPersistedUser(): User | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  },
};
