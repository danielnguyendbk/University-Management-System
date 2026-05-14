import { useNavigate } from "react-router-dom";
import { Calendar, AlertCircle } from "lucide-react";

const announcements = [
  {
    id: 1,
    title: "Mở đăng ký học kỳ Xuân",
    description: "Đăng ký môn học cho học kỳ Xuân 2026 đã mở. Vui lòng đăng ký trước ngày 30/03/2026.",
    date: "20/03/2026"
  },
  {
    id: 2,
    title: "Cập nhật hướng dẫn an toàn trong khuôn viên",
    description: "Các quy trình an toàn mới đã được áp dụng. Tất cả sinh viên cần xem lại hướng dẫn đã cập nhật.",
    date: "18/03/2026"
  },
  {
    id: 3,
    title: "Thư viện mở cửa kéo dài trong mùa thi",
    description: "Thư viện trường sẽ kéo dài thời gian hoạt động trong thời gian thi cuối kỳ.",
    date: "15/03/2026"
  },
  {
    id: 4,
    title: "Ngày hội việc làm - Tháng 4/2026",
    description: "Ngày hội việc làm thường niên sẽ diễn ra vào 15-16/04. Đăng ký sớm để gặp các nhà tuyển dụng hàng đầu.",
    date: "10/03/2026"
  }
];

const tuitionNotices = [
  {
    id: 1,
    title: "Học phí - Học kỳ Xuân 2026",
    amount: "$4,500",
    dueDate: "25/03/2026",
    status: "overdue"
  },
  {
    id: 2,
    title: "Phí thực hành - Công nghệ thông tin",
    amount: "$200",
    dueDate: "30/03/2026",
    status: "pending"
  },
  {
    id: 3,
    title: "Phí hoạt động sinh viên",
    amount: "$150",
    dueDate: "05/04/2026",
    status: "pending"
  }
];

export function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulate login and navigate to portal
    navigate("/portal");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Cổng thông tin sinh viên</h1>
              <p className="text-xs text-gray-500">Hệ thống thông tin sinh viên</p>
            </div>
          </div>
          <button
            onClick={handleLogin}
            className="px-6 py-2.5 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors font-medium"
          >
            Đăng nhập sinh viên
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* University Announcements - Takes 2 columns */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Thông báo từ nhà trường</h2>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{announcement.description}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">{announcement.date}</span>
                        <button className="text-sm text-[#1E3A8A] hover:underline font-medium">
                          Xem chi tiết →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tuition Fee Notices - Takes 1 column */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Thông báo học phí</h2>
            <div className="space-y-4">
              {tuitionNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-5"
                >
                  <div className="flex items-start gap-3 mb-3">
                    {notice.status === "overdue" && (
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{notice.title}</h3>
                      <p className="text-lg font-bold text-gray-900">{notice.amount}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-600">Hạn: {notice.dueDate}</span>
                    {notice.status === "overdue" ? (
                      <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                        Quá hạn
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                        Chờ thanh toán
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-900 font-medium mb-1">Cần thanh toán học phí?</p>
                <p className="text-xs text-blue-700">Đăng nhập để sử dụng các phương thức thanh toán và xem hóa đơn chi tiết.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
