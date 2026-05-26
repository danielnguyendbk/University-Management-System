import { CalendarPlus, CalendarOff, Clock3 } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";

const sessions = [
  { id: 1, semester: "Học kỳ Xuân 2026", status: "Đang mở", open: "20/03/2026", close: "30/03/2026" },
  { id: 2, semester: "Học kỳ Hè 2026", status: "Sắp mở", open: "20/06/2026", close: "30/06/2026" },
];

export function RegistrationSessions() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader title="Phiên đăng ký môn học" subtitle="Tạo, mở và đóng các phiên đăng ký học phần cho sinh viên" />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map((session) => (
          <article key={session.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">{session.semester}</p>
                <h3 className="text-lg font-semibold text-gray-900">{session.status}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <CalendarPlus className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2"><Clock3 className="w-4 h-4" /> Mở: {session.open}</p>
              <p className="flex items-center gap-2"><CalendarOff className="w-4 h-4" /> Đóng: {session.close}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium">Mở</button>
              <button className="px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium">Đóng</button>
              <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium">Sửa</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}