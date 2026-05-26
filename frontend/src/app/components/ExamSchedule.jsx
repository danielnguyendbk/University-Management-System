import { Calendar, Clock, MapPin, FileText, Download } from "lucide-react";

const exams = [
  {
    id: 1,
    code: "CS301",
    name: "Cấu trúc dữ liệu và giải thuật",
    type: "Thi cuối kỳ",
    date: "15/04/2026",
    time: "09:00 - 11:00",
    duration: "2 giờ",
    room: "Exam Hall A - Seats 1-50",
    lecturer: "Dr. Emily Smith",
    status: "upcoming"
  },
  {
    id: 2,
    code: "CS302",
    name: "Hệ quản trị cơ sở dữ liệu",
    type: "Thi cuối kỳ",
    date: "17/04/2026",
    time: "14:00 - 16:30",
    duration: "2.5 giờ",
    room: "Exam Hall B - Seats 51-100",
    lecturer: "Prof. Michael Johnson",
    status: "upcoming"
  },
  {
    id: 3,
    code: "CS303",
    name: "Phát triển web",
    type: "Thi cuối kỳ",
    date: "19/04/2026",
    time: "10:00 - 12:00",
    duration: "2 giờ",
    room: "Exam Hall C - Seats 101-150",
    lecturer: "Dr. Sarah Williams",
    status: "upcoming"
  },
  {
    id: 4,
    code: "CS304",
    name: "Học máy",
    type: "Thi cuối kỳ",
    date: "22/04/2026",
    time: "09:00 - 11:30",
    duration: "2.5 giờ",
    room: "Exam Hall A - Seats 1-50",
    lecturer: "Dr. James Brown",
    status: "upcoming"
  },
  {
    id: 5,
    code: "MATH201",
    name: "Đại số tuyến tính",
    type: "Thi cuối kỳ",
    date: "24/04/2026",
    time: "13:00 - 15:00",
    duration: "2 giờ",
    room: "Exam Hall D - Seats 151-200",
    lecturer: "Dr. Robert Wilson",
    status: "upcoming"
  },
];

export function ExamSchedule() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Lịch thi</h1>
          <p className="text-gray-600 mt-1">Lịch thi cuối kỳ học kỳ Xuân 2026</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
          <Download className="w-4 h-4" />
          Tải lịch thi
        </button>
      </div>

      {/* Important Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex gap-3">
          <FileText className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-2">Quy định thi</h3>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Sinh viên phải có mặt trước giờ thi 15 phút</li>
              <li>• Bắt buộc mang theo thẻ sinh viên hợp lệ</li>
              <li>• Không được mang thiết bị điện tử, trừ máy tính được phép</li>
              <li>• Kiểm tra sơ đồ chỗ ngồi trước ngày thi</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Exam Cards */}
      <div className="space-y-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Left: Course Info */}
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-[#1E3A8A]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        {exam.code}
                      </span>
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                        {exam.type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">{exam.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">Giảng viên: {exam.lecturer}</p>
                  </div>
                </div>

                {/* Exam Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-15">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Ngày thi</p>
                      <p className="font-medium text-gray-900">{exam.date}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Thời gian</p>
                      <p className="font-medium text-gray-900">{exam.time}</p>
                      <p className="text-xs text-gray-600">Thời lượng: {exam.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:col-span-2">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Địa điểm</p>
                      <p className="font-medium text-gray-900">{exam.room}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Countdown or Status */}
              <div className="md:w-48 flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Số ngày còn lại</p>
                <p className="text-4xl font-bold text-[#1E3A8A] mb-2">23</p>
              
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar View Option */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Xem dạng lịch</h3>
          <p className="text-sm text-gray-600 mb-4">
            Xem toàn bộ lịch thi theo định dạng lịch
          </p>
          <button className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
            Mở lịch chi tiết
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Tổng số môn thi</p>
          <p className="text-3xl font-semibold text-gray-900">{exams.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Môn thi đầu tiên</p>
          <p className="text-2xl font-semibold text-gray-900">15/04</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Môn thi cuối cùng</p>
          <p className="text-2xl font-semibold text-gray-900">24/04</p>
        </div>
      </div>
    </div>
  );
}
