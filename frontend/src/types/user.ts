// User domain types
export type UserRole = 'admin' | 'lecturer' | 'student' | 'staff';

export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly department?: string;
  readonly avatar?: string;
  readonly createdAt: string;
}

export interface Classroom {
  readonly id: string;
  readonly name: string;
  readonly building: string;
  readonly capacity: number;
  readonly facilities: readonly string[];
}

export interface Subject {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly credits: number;
  readonly department: string;
}
