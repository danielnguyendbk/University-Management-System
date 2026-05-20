import React from "react";

export function ExamStatusBadge({ status, className = "" }) {
  const statusConfig = {
    DRAFT: {
      text: "Lịch nháp",
      classes: "bg-gray-100 text-gray-700 border-gray-200"
    },
    SCHEDULED: {
      text: "Đã lên lịch",
      classes: "bg-blue-50 text-blue-700 border-blue-200"
    },
    CANCELLED: {
      text: "Đã hủy",
      classes: "bg-rose-50 text-rose-700 border-rose-200"
    },
    COMPLETED: {
      text: "Đã hoàn thành",
      classes: "bg-emerald-50 text-emerald-700 border-emerald-200"
    }
  };

  const current = statusConfig[status] || {
    text: status || "Không rõ",
    classes: "bg-slate-100 text-slate-700 border-slate-200"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${current.classes} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
      {current.text}
    </span>
  );
}

export default ExamStatusBadge;
