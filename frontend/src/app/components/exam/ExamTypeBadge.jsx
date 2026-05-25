import React from "react";

export function ExamTypeBadge({ type, className = "" }) {
  const normalizedType = type ? String(type).trim().toLowerCase() : type;

  const typeConfig = {
    midterm: {
      text: "Giữa kỳ",
      classes: "bg-purple-50 text-purple-700 border-purple-200"
    },
    final: {
      text: "Cuối kỳ",
      classes: "bg-indigo-50 text-indigo-700 border-indigo-200"
    },
    makeup: {
      text: "Thi lại",
      classes: "bg-amber-50 text-amber-700 border-amber-200"
    },
    other: {
      text: "Khác",
      classes: "bg-slate-50 text-slate-700 border-slate-200"
    }
  };

  const current = typeConfig[normalizedType] || {
    text: type || "Không rõ",
    classes: "bg-slate-100 text-slate-700 border-slate-200"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${current.classes} ${className}`}>
      {current.text}
    </span>
  );
}

export default ExamTypeBadge;
