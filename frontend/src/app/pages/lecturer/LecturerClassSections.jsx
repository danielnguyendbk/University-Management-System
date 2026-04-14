import { Users, BookOpen } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";

const sections = [
  { id: 1, code: "DB202", course: "Cơ sở dữ liệu", students: 42, semester: "HK Xuân 2026", status: "Mở" },
  { id: 2, code: "WEB301", course: "Phát triển web", students: 35, semester: "HK Xuân 2026", status: "Mở" },
  { id: 3, code: "DS201", course: "Cấu trúc dữ liệu", students: 38, semester: "HK Xuân 2026", status: "Sắp khóa" },
];

export function LecturerClassSections() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader title="Lớp học phần" subtitle="Các lớp bạn đang phụ trách trong học kỳ hiện tại" />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section) => (
          <article key={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">{section.code}</p>
                <h3 className="text-lg font-semibold text-gray-900">{section.course}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Học kỳ: {section.semester}</p>
              <p className="flex items-center gap-2"><Users className="w-4 h-4" /> {section.students} sinh viên</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{section.status}</span>
              <button className="text-sm font-medium text-[#1E3A8A] hover:underline">Xem chi tiết</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}