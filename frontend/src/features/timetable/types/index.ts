export type TimetableStatus = "valid" | "conflict" | "pending";

export interface TimetableItem {
  id: number;
  courseCode: string;
  courseName: string;
  lecturer: string;
  studentCount: number;
  day: string;
  timeSlot: string;
  assignedRoom: string;
  status: TimetableStatus;
}
