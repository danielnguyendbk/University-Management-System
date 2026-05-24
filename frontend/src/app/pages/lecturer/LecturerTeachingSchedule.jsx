import { CalendarClock } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { LecturerWeeklySchedule } from "./LecturerWeeklySchedule";

const schedule = [
  { id: 1, day: "Thứ 2", time: "07:30-09:00", course: "Cơ sở dữ liệu", section: "DB202", room: "B-205" },
  { id: 2, day: "Thứ 4", time: "10:00-11:30", course: "Phát triển web", section: "WEB301", room: "C-104" },
  { id: 3, day: "Thứ 6", time: "13:30-15:00", course: "Cấu trúc dữ liệu", section: "DS201", room: "A-301" },
];

export function LecturerTeachingSchedule() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader title="Lịch giảng dạy" subtitle="Xem lịch dạy theo tuần của bạn" />
      <LecturerWeeklySchedule />
    </div>
  );
}