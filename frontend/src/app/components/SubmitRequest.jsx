import { useState } from "react";
import { Send, FileText, Calendar, CheckCircle2 } from "lucide-react";

export function SubmitRequest() {
  const [requestType, setRequestType] = useState("leave");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Gửi yêu cầu</h1>
        <p className="text-gray-600 mt-1">Gửi đơn xin nghỉ học hoặc phúc khảo điểm</p>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Gửi yêu cầu thành công!</p>
            <p className="text-sm text-green-700">Bạn sẽ nhận thông báo khi yêu cầu được xử lý.</p>
          </div>
        </div>
      )}

      {/* Request Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Loại yêu cầu *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRequestType("leave")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  requestType === "leave"
                    ? "border-[#1E3A8A] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Calendar className={`w-6 h-6 mb-2 ${requestType === "leave" ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                <p className="font-semibold text-gray-900">Đơn xin nghỉ học</p>
                <p className="text-sm text-gray-600">Xin phép nghỉ buổi học</p>
              </button>
              <button
                type="button"
                onClick={() => setRequestType("recheck")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  requestType === "recheck"
                    ? "border-[#1E3A8A] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileText className={`w-6 h-6 mb-2 ${requestType === "recheck" ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                <p className="font-semibold text-gray-900">Phúc khảo điểm</p>
                <p className="text-sm text-gray-600">Đề nghị xem lại điểm</p>
              </button>
            </div>
          </div>

          {/* Course/Subject (for recheck) */}
          {requestType === "recheck" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Môn học *
              </label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
              >
                <option value="">Chọn môn học</option>
                <option>CS301 - Cấu trúc dữ liệu</option>
                <option>CS302 - Hệ cơ sở dữ liệu</option>
                <option>CS303 - Phát triển web</option>
                <option>CS304 - Học máy</option>
                <option>MATH201 - Đại số tuyến tính</option>
              </select>
            </div>
          )}

          {/* Date Range (for leave) */}
          {requestType === "leave" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ ngày *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đến ngày *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                />
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề *
            </label>
            <input
              type="text"
              required
              placeholder={requestType === "leave" ? "Ví dụ: Nghỉ học do ốm" : "Ví dụ: Phúc khảo điểm giữa kỳ"}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
            />
          </div>

          {/* Content/Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {requestType === "leave" ? "Lý do" : "Chi tiết"} *
            </label>
            <textarea
              required
              rows={6}
              placeholder={requestType === "leave" 
                ? "Vui lòng nêu rõ lý do xin nghỉ học..."
                : "Vui lòng cung cấp chi tiết yêu cầu phúc khảo..."
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] resize-none"
            ></textarea>
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tài liệu đính kèm
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-gray-300 transition-colors">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Bấm để tải lên hoặc kéo thả tệp
              </p>
              <p className="text-xs text-gray-500">PDF, JPG, PNG tối đa 10MB</p>
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Gửi yêu cầu
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

      {/* Recent Requests */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Yêu cầu gần đây</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-6 hover:bg-gray-50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    Đơn xin nghỉ học
                  </span>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                    Chờ duyệt
                  </span>
                </div>
                <p className="font-medium text-gray-900 mb-1">Nghỉ học do ốm</p>
                <p className="text-sm text-gray-600 mb-2">18-20/03/2026</p>
                <p className="text-xs text-gray-500">Đã gửi ngày 17/03/2026</p>
              </div>
            </div>
          </div>
          <div className="p-6 hover:bg-gray-50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                    Phúc khảo điểm
                  </span>
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                    Đã duyệt
                  </span>
                </div>
                <p className="font-medium text-gray-900 mb-1">Phúc khảo giữa kỳ - CS301</p>
                <p className="text-sm text-gray-600 mb-2">Cấu trúc dữ liệu và giải thuật</p>
                <p className="text-xs text-gray-500">Đã gửi ngày 10/03/2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
