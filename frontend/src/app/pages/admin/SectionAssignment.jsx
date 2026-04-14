import { ArrowRightLeft, Users, BookOpen } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";

const assignments = [
  { id: 1, section: "DB202", course: "Cơ sở dữ liệu", lecturer: "Tran Thi Chau", capacity: "42/45" },
  { id: 2, section: "WEB301", course: "Phát triển web", lecturer: "Nguyen Van Hieu", capacity: "35/40" },
  { id: 3, section: "DS201", course: "Cấu trúc dữ liệu", lecturer: "Pham Quang Minh", capacity: "38/40" },
];

export function SectionAssignment() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Phân công giảng viên cho lớp học phần" subtitle="Gán giảng viên phụ trách từng lớp học phần theo học kỳ" />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {assignments.map((item) => (
          <article key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">{item.section}</p>
                <h3 className="text-lg font-semibold text-gray-900">{item.course}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2"><Users className="w-4 h-4" /> Giảng viên: {item.lecturer}</p>
              <p>Sĩ số: {item.capacity}</p>
            </div>
            <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A8A] text-white text-sm font-medium hover:bg-[#1E3A8A]/90">
              <ArrowRightLeft className="w-4 h-4" />
              Đổi giảng viên
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}