import { Bell, Pin, Calendar } from "lucide-react";
import { PageHeader } from "./common/PageHeader";

const announcements = [
  {
    id: 1,
    title: "Mở đăng ký học kỳ Xuân",
    content: "Đăng ký môn học cho học kỳ Xuân 2026 đã mở. Vui lòng đăng ký trước 30/03/2026 để tránh phí trễ hạn. Sinh viên năm cuối và sinh viên hệ chất lượng cao được ưu tiên đăng ký sớm.",
    date: "20/03/2026",
    category: "Học vụ",
    pinned: true,
    important: true
  },
  {
    id: 2,
    title: "Cập nhật hướng dẫn an toàn khuôn viên",
    content: "Nhà trường đã áp dụng các quy trình an toàn mới sau đợt rà soát gần đây. Tất cả sinh viên cần đọc hướng dẫn cập nhật trên cổng thông tin và tham dự buổi định hướng an toàn bắt buộc.",
    date: "18/03/2026",
    category: "An toàn",
    pinned: true,
    important: true
  },
  {
    id: 3,
    title: "Thư viện mở cửa kéo dài mùa thi",
    content: "Thư viện trường sẽ kéo dài giờ phục vụ trong giai đoạn thi cuối kỳ. Giờ mới: Thứ Hai-Thứ Sáu 7:00-2:00, Thứ Bảy-Chủ Nhật 9:00-0:00. Sẽ bổ sung thêm phòng tự học.",
    date: "15/03/2026",
    category: "Cơ sở vật chất",
    pinned: false,
    important: false
  },
  {
    id: 4,
    title: "Ngày hội việc làm - 04/2026",
    content: "Ngày hội việc làm thường niên sẽ diễn ra vào 15-16/04/2026 tại hội trường trường. Hơn 100 doanh nghiệp tham gia. Đăng ký sớm để giữ suất phỏng vấn với nhà tuyển dụng hàng đầu. Có phiên góp ý CV từ 25-30/03.",
    date: "10/03/2026",
    category: "Nghề nghiệp",
    pinned: false,
    important: true
  },
  {
    id: 5,
    title: "Cập nhật dịch vụ y tế sinh viên",
    content: "Bộ phận y tế sinh viên đã mở rộng giờ làm và bổ sung dịch vụ mới, gồm tư vấn sức khỏe tinh thần và dinh dưỡng. Đặt lịch hẹn qua cổng thông tin sinh viên.",
    date: "08/03/2026",
    category: "Sức khỏe",
    pinned: false,
    important: false
  },
  {
    id: 6,
    title: "Nghỉ giữa kỳ Xuân - Tạm đóng cửa khuôn viên",
    content: "Khuôn viên trường tạm đóng trong kỳ nghỉ giữa kỳ từ 01-07/04/2026. Một số dịch vụ thiết yếu vẫn hoạt động hạn chế. Đường dây khẩn cấp trực 24/7.",
    date: "05/03/2026",
    category: "Chung",
    pinned: false,
    important: false
  },
];

export function Announcements() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Thông báo"
        subtitle="Cập nhật tin tức nhà trường và các nhắc nhở quan trọng"
      />

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-medium">
            Tất cả
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
            Học vụ
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
            An toàn
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
            Cơ sở vật chất
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
            Nghề nghiệp
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
            Chỉ quan trọng
          </button>
        </div>
      </div>

      <section aria-label="Announcements list">
        <ul className="space-y-4">
        {announcements.map((announcement) => (
          <li key={announcement.id}>
            <article
            className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${
              announcement.important ? "border-[#1E3A8A]" : "border-gray-200"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                announcement.important ? "bg-blue-100" : "bg-gray-100"
              }`}>
                <Bell className={`w-6 h-6 ${announcement.important ? "text-[#1E3A8A]" : "text-gray-600"}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {announcement.pinned && (
                      <Pin className="w-4 h-4 text-[#1E3A8A]" />
                    )}
                    <h3 className="font-semibold text-gray-900 text-lg">{announcement.title}</h3>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                    announcement.category === "Học vụ" ? "bg-blue-50 text-blue-700" :
                    announcement.category === "An toàn" ? "bg-red-50 text-red-700" :
                    announcement.category === "Cơ sở vật chất" ? "bg-green-50 text-green-700" :
                    announcement.category === "Nghề nghiệp" ? "bg-purple-50 text-purple-700" :
                    announcement.category === "Sức khỏe" ? "bg-amber-50 text-amber-700" :
                    "bg-gray-50 text-gray-700"
                  }`}>
                    {announcement.category}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-3">{announcement.content}</p>
                
                <div className="flex items-center gap-4">
                  <time className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {announcement.date}
                  </time>
                  {announcement.important && (
                    <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                      Quan trọng
                    </span>
                  )}
                </div>
              </div>
            </div>
            </article>
          </li>
        ))}
        </ul>
      </section>
    </div>
  );
}
