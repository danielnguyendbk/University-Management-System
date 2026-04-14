import { Search, UserCheck, UserX } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";

const lecturers = [
  { id: 1, name: "Tran Thi Chau", code: "LC001", email: "lecturer01@ptit.edu.vn", status: "Hoạt động" },
  { id: 2, name: "Nguyen Van Hieu", code: "LC002", email: "hieu.nguyen@ptit.edu.vn", status: "Hoạt động" },
  { id: 3, name: "Pham Quang Minh", code: "LC003", email: "minh.pham@ptit.edu.vn", status: "Khóa" },
];

export function ManageLecturerAccounts() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Quản lý tài khoản giảng viên" subtitle="Tạo, sửa, khóa và tra cứu tài khoản giảng viên" />

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm theo mã GV, họ tên, email..."
          className="w-full outline-none text-sm text-gray-900"
        />
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Giảng viên</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Mã GV</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {lecturers.map((lecturer) => (
                <tr key={lecturer.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{lecturer.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{lecturer.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{lecturer.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{lecturer.status}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium">
                        <UserCheck className="w-4 h-4" />
                        Mở khóa
                      </button>
                      <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium">
                        <UserX className="w-4 h-4" />
                        Khóa
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