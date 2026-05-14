import type { User, Classroom, Subject } from '../types'

// Mock Users
export const mockUsers: readonly User[] = [
  {
    id: 'user_1',
    email: 'admin@university.edu',
    name: 'Admin User',
    role: 'admin',
    department: 'Administration',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user_2',
    email: 'lecturer1@university.edu',
    name: 'Dr. John Smith',
    role: 'lecturer',
    department: 'Computer Science',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user_3',
    email: 'lecturer2@university.edu',
    name: 'Prof. Sarah Johnson',
    role: 'lecturer',
    department: 'Computer Science',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user_4',
    email: 'student1@university.edu',
    name: 'Jane Student',
    role: 'student',
    department: 'Computer Science',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'user_5',
    email: 'staff1@university.edu',
    name: 'Support Staff',
    role: 'staff',
    department: 'Academic Support',
    createdAt: '2026-01-05T00:00:00Z',
  },
]

// Mock Classrooms
export const mockClassrooms: readonly Classroom[] = [
  {
    id: 'classroom_1',
    name: 'Room 101',
    building: 'Engineering Block A',
    capacity: 30,
    facilities: ['projector', 'whiteboard', 'ac'],
  },
  {
    id: 'classroom_2',
    name: 'Room 202',
    building: 'Engineering Block B',
    capacity: 50,
    facilities: ['projector', 'smart board', 'ac', 'lab equipment'],
  },
  {
    id: 'classroom_3',
    name: 'Room 303',
    building: 'Science Block',
    capacity: 40,
    facilities: ['projector', 'whiteboard', 'ac'],
  },
  {
    id: 'classroom_4',
    name: 'Auditorium A',
    building: 'Main Hall',
    capacity: 200,
    facilities: ['projector', 'sound system', 'ac'],
  },
]

// Mock Subjects
export const mockSubjects: readonly Subject[] = [
  {
    id: 'subject_1',
    name: 'Introduction to Programming',
    code: 'CS101',
    credits: 3,
    department: 'Computer Science',
  },
  {
    id: 'subject_2',
    name: 'Data Structures',
    code: 'CS201',
    credits: 4,
    department: 'Computer Science',
  },
  {
    id: 'subject_3',
    name: 'Web Development',
    code: 'CS301',
    credits: 3,
    department: 'Computer Science',
  },
  {
    id: 'subject_4',
    name: 'Database Management',
    code: 'CS202',
    credits: 3,
    department: 'Computer Science',
  },
]
