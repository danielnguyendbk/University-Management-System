import { CalendarClock } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";

const schedule = [
  { id: 1, day: "Thứ 2", time: "07:30-09:00", course: "Cơ sở dữ liệu", section: "DB202", room: "B-205" },
  { id: 2, day: "Thứ 4", time: "10:00-11:30", course: "Phát triển web", section: "WEB301", room: "C-104" },
  { id: 3, day: "Thứ 6", time: "13:30-15:00", course: "Cấu trúc dữ liệu", section: "DS201", room: "A-301" },
];

export function LecturerTeachingSchedule() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader title="Lịch giảng dạy" subtitle="Lịch dạy theo tuần của giảng viên" />

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Danh sách tiết dạy</h2>
          <CalendarClock className="w-5 h-5 text-gray-400" />
        </div>
        <div className="divide-y divide-gray-200">
          {schedule.map((item) => (
            <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{item.course}</p>
                <p className="text-sm text-slate-600">{item.section} • Phòng {item.room}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{item.day}</span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}