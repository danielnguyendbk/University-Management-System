import { useState } from "react";
import { MessageSquare, Star, Send, CheckCircle2 } from "lucide-react";

export function Feedback() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState("general");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Phản hồi</h1>
        <p className="text-gray-600 mt-1">Chia sẻ ý kiến và đề xuất của bạn với chúng tôi</p>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Cảm ơn bạn đã gửi phản hồi!</p>
            <p className="text-sm text-green-700">Chúng tôi trân trọng thời gian bạn đóng góp để cải thiện hệ thống.</p>
          </div>
        </div>
      )}

      {/* Feedback Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Danh mục phản hồi *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setCategory("general")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  category === "general"
                    ? "border-[#1E3A8A] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <MessageSquare className={`w-5 h-5 mb-1 ${category === "general" ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                <p className="font-medium text-gray-900 text-sm">Chung</p>
              </button>
              <button
                type="button"
                onClick={() => setCategory("courses")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  category === "courses"
                    ? "border-[#1E3A8A] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <MessageSquare className={`w-5 h-5 mb-1 ${category === "courses" ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                <p className="font-medium text-gray-900 text-sm">Môn học</p>
              </button>
              <button
                type="button"
                onClick={() => setCategory("facilities")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  category === "facilities"
                    ? "border-[#1E3A8A] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <MessageSquare className={`w-5 h-5 mb-1 ${category === "facilities" ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                <p className="font-medium text-gray-900 text-sm">Cơ sở vật chất</p>
              </button>
              <button
                type="button"
                onClick={() => setCategory("portal")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  category === "portal"
                    ? "border-[#1E3A8A] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <MessageSquare className={`w-5 h-5 mb-1 ${category === "portal" ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                <p className="font-medium text-gray-900 text-sm">Cổng sinh viên</p>
              </button>
              <button
                type="button"
                onClick={() => setCategory("services")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  category === "services"
                    ? "border-[#1E3A8A] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <MessageSquare className={`w-5 h-5 mb-1 ${category === "services" ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                <p className="font-medium text-gray-900 text-sm">Dịch vụ</p>
              </button>
              <button
                type="button"
                onClick={() => setCategory("other")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  category === "other"
                    ? "border-[#1E3A8A] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <MessageSquare className={`w-5 h-5 mb-1 ${category === "other" ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                <p className="font-medium text-gray-900 text-sm">Khác</p>
              </button>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Đánh giá tổng quan *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      value <= (hoveredRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-gray-600 self-center">
                  {rating === 1 && "Kém"}
                  {rating === 2 && "Trung bình"}
                  {rating === 3 && "Khá"}
                  {rating === 4 && "Tốt"}
                  {rating === 5 && "Xuất sắc"}
                </span>
              )}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề *
            </label>
            <input
              type="text"
              required
              placeholder="Tóm tắt ngắn gọn phản hồi của bạn"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung phản hồi *
            </label>
            <textarea
              required
              rows={8}
              placeholder="Vui lòng chia sẻ chi tiết góp ý, đề xuất hoặc vướng mắc của bạn..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] resize-none"
            ></textarea>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              className="w-4 h-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#1E3A8A]"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-700">
              Gửi ẩn danh
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Gửi phản hồi
            </button>
            <button
              type="button"
              className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Phản hồi gần đây của bạn</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    Cổng sinh viên
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="font-medium text-gray-900 mb-1">Giao diện mới rất tốt!</p>
                <p className="text-sm text-gray-600 mb-2">
                  Thiết kế cổng thông tin mới thân thiện hơn nhiều. Bố cục rõ ràng và điều hướng rất dễ dùng.
                </p>
                <p className="text-xs text-gray-500">Đã gửi ngày 20/03/2026</p>
              </div>
              <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                Đã xem xét
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                    Cơ sở vật chất
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <Star className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
                <p className="font-medium text-gray-900 mb-1">Thư viện cần thêm phòng tự học</p>
                <p className="text-sm text-gray-600 mb-2">
                  Thư viện rất tốt nhưng vào tuần thi rất khó tìm phòng tự học còn trống.
                </p>
                <p className="text-xs text-gray-500">Đã gửi ngày 10/03/2026</p>
              </div>
              <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                Đã xem xét
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Ý kiến của bạn rất quan trọng</h3>
        <p className="text-sm text-blue-800">
          Chúng tôi xem xét cẩn thận mọi phản hồi. Góp ý của bạn giúp cải thiện trải nghiệm học tập cho toàn bộ sinh viên. 
          Với phản hồi không ẩn danh, bạn sẽ nhận được phản hồi trong khoảng 5-7 ngày làm việc.
        </p>
      </div>
    </div>
  );
}
