import React from "react";

export function ExamMethodBadge({ method, className = "" }) {
  const normalizedMethod = method ? String(method).trim().toUpperCase() : method;

  const methodConfig = {
    WRITTEN: {
      text: "Tự luận/Trắc nghiệm",
      classes: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    ORAL: {
      text: "Vấn đáp",
      classes: "bg-teal-50 text-teal-700 border-teal-200"
    },
    PRACTICAL: {
      text: "Thực hành",
      classes: "bg-sky-50 text-sky-700 border-sky-200"
    },
    ONLINE: {
      text: "Trực tuyến",
      classes: "bg-violet-50 text-violet-700 border-violet-200"
    }
  };

  const current = methodConfig[normalizedMethod] || {
    text: method || "Không rõ",
    classes: "bg-slate-100 text-slate-700 border-slate-200"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${current.classes} ${className}`}>
      {current.text}
    </span>
  );
}

export default ExamMethodBadge;
