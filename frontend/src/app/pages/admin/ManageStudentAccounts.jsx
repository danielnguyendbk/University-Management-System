import { Search, UserCheck, UserX } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";

const students = [
  { id: 1, name: "Nguyen Van Thai", code: "ST001", email: "student01@ptit.edu.vn", status: "Hoạt động" },
  { id: 2, name: "Tran Thi Lan", code: "ST002", email: "tranlan@ptit.edu.vn", status: "Khóa tạm thời" },
  { id: 3, name: "Le Minh Khoa", code: "ST003", email: "khoa.le@ptit.edu.vn", status: "Hoạt động" },
];

export function ManageStudentAccounts() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Quản lý tài khoản sinh viên" subtitle="Tạo, sửa, khóa và tra cứu tài khoản sinh viên" />

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm theo MSSV, họ tên, email..."
          className="w-full outline-none text-sm text-gray-900"
        />
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Sinh viên</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">MSSV</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.status}</td>
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