import React from "react";
import { Calendar, Clock, MapPin, Users, FileText, UserCheck, AlertCircle } from "lucide-react";
import { ExamStatusBadge } from "./ExamStatusBadge";
import { ExamTypeBadge } from "./ExamTypeBadge";
import { ExamMethodBadge } from "./ExamMethodBadge";

export function ExamCardBase({
  exam,
  role = "student", // "student" | "lecturer"
  actions,
  badgeExtra
}) {
  const {
    courseCode,
    courseName,
    sectionCode,
    lecturerName,
    examType,
    examMethod,
    examDate,
    startTime,
    endTime,
    duration,
    roomCode,
    building,
    seatRange,
    studentCount,
    status,
    daysRemaining,
    invigilatorRole,
    note
  } = exam;

  // Format date display: YYYY-MM-DD -> DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const formattedDate = formatDate(examDate);

  // Status visual cues (left accent bar)
  const borderAccents = {
    DRAFT: "border-l-gray-400",
    SCHEDULED: "border-l-blue-600",
    CANCELLED: "border-l-rose-500",
    COMPLETED: "border-l-emerald-500"
  };

  const leftAccent = borderAccents[status] || "border-l-blue-600";

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${leftAccent} p-6 hover:shadow-md transition-all`}>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        
        {/* Left: General Info */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
              {courseCode}
            </span>
            {sectionCode && (
              <span className="px-2.5 py-0.5 bg-slate-50 text-slate-700 text-xs font-semibold rounded-full border border-slate-100">
                Lớp HP: {sectionCode}
              </span>
            )}
            <ExamTypeBadge type={examType} />
            <ExamMethodBadge method={examMethod} />
            <ExamStatusBadge status={status} />
            {badgeExtra}
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{courseName}</h3>
            {role === "student" && lecturerName && (
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
                <span className="font-medium text-gray-700">Giảng viên:</span> {lecturerName}
              </p>
            )}
            {role === "lecturer" && invigilatorRole && (
              <div className="mt-1 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded text-xs font-semibold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  Vai trò: {invigilatorRole === "MAIN" ? "Giám thị chính (MAIN)" : "Giám thị phụ (ASSISTANT)"}
                </span>
              </div>
            )}
          </div>

          {/* Exam Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            <div className="flex items-start gap-2.5">
              <Calendar className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Ngày thi</p>
                <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Giờ thi & Thời lượng</p>
                <p className="text-sm font-semibold text-gray-900">{startTime} - {endTime}</p>
                {duration && <p className="text-xs text-gray-500">Thời lượng: {duration}</p>}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Phòng thi & Địa điểm</p>
                <p className="text-sm font-semibold text-gray-900">{roomCode || "Chưa xếp phòng"}</p>
                {building && <p className="text-xs text-gray-500">Tòa nhà: {building}</p>}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Users className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Sĩ số sinh viên</p>
                <p className="text-sm font-semibold text-gray-900">{studentCount || 0} sinh viên</p>
              </div>
            </div>

            {seatRange && (
              <div className="flex items-start gap-2.5">
                <FileText className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Sơ đồ / Dãy ghế</p>
                  <p className="text-sm font-semibold text-gray-900">{seatRange}</p>
                </div>
              </div>
            )}

            {note && (
              <div className="flex items-start gap-2.5 sm:col-span-2 md:col-span-3 bg-amber-50/55 p-2 rounded border border-amber-100/50">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">Ghi chú</p>
                  <p className="text-xs text-amber-700 mt-0.5">{note}</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right side slot for countdowns or actions */}
        {role === "student" && status === "SCHEDULED" ? (
          <div className="shrink-0 lg:w-44 flex flex-col items-center justify-center p-4 bg-[#1E3A8A]/5 border border-[#1E3A8A]/10 rounded-xl text-center self-center lg:self-auto">
            <p className="text-xs text-gray-600 font-semibold mb-0.5">Số ngày còn lại</p>
            <p className="text-4xl font-extrabold text-[#1E3A8A] tracking-tight">{daysRemaining}</p>
            <p className="text-xs text-gray-500 mt-0.5 mb-3">Ngày</p>
            {actions}
          </div>
        ) : (
          actions && <div className="shrink-0 flex items-center justify-end self-center lg:self-auto">{actions}</div>
        )}

      </div>
    </div>
  );
}

export default ExamCardBase;
