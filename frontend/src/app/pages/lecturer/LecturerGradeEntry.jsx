import { Save, PenLine, Users } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";

const gradeRows = [
  { id: 1, student: "Nguyen Van A", mssv: "20210001", midterm: "8.0", final: "8.5" },
  { id: 2, student: "Tran Thi B", mssv: "20210002", midterm: "7.5", final: "8.0" },
  { id: 3, student: "Le Van C", mssv: "20210003", midterm: "6.5", final: "7.0" },
];

export function LecturerGradeEntry() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Nhập điểm"
        subtitle="Màn hình mẫu để giảng viên xem và cập nhật điểm sinh viên trong lớp học phần"
      />

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Lớp DB202</h2>
            <p className="text-sm text-gray-600">Cơ sở dữ liệu - Học kỳ Xuân 2026</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            42 sinh viên
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Sinh viên</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">MSSV</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Giữa kỳ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Cuối kỳ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {gradeRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.student}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.mssv}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.midterm}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.final}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100">
                        <PenLine className="w-4 h-4" />
                        Sửa
                      </button>
                      <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100">
                        <Save className="w-4 h-4" />
                        Lưu
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}