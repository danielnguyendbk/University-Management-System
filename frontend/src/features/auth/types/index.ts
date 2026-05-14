import type { User } from "@/types/auth";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface RoleCredential {
  role: string;
  email: string;
  hint: string;
}
