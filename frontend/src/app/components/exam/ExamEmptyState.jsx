import React from "react";
import { ClipboardList } from "lucide-react";

export function ExamEmptyState({
  title = "Không tìm thấy lịch thi",
  description = "Hiện tại chưa có lịch thi nào được xếp cho học kỳ hoặc bộ lọc đã chọn.",
  actionText,
  onAction,
  icon: Icon = ClipboardList
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
        <Icon className="w-8 h-8 text-[#1E3A8A] animate-pulse" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors text-sm font-semibold shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export default ExamEmptyState;
