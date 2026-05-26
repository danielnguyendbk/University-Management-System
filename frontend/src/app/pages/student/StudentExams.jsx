import React, { useState, useEffect } from "react";
import { Bell, BellOff, Info, AlertTriangle, RefreshCw } from "lucide-react";
import { studentExamApi } from "../../../api/studentExamApi";
import { ExamSemesterFilter } from "../../components/exam/ExamSemesterFilter";
import { ExamCardBase } from "../../components/exam/ExamCardBase";
import { ExamEmptyState } from "../../components/exam/ExamEmptyState";

export function StudentExams() {
  const [exams, setExams] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [examTypeFilter, setExamTypeFilter] = useState("all"); // "all" | "midterm" | "final" | "makeup"
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Load semesters and initial data
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const sems = await studentExamApi.getSemesters();
        setSemesters(sems);
        
        // Default to active semester, or the first one
        const activeSem = sems.find(s => s.status === 'ACTIVE' || s.registrationStatus === 'OPEN' || s.active) || sems[0];
        if (activeSem) {
          setSelectedSemester(activeSem.semesterId || activeSem.id);
        }
      } catch (err) {
        console.error("Lỗi khi tải học kỳ:", err);
        setError("Không thể tải danh sách học kỳ. Vui lòng thử lại.");
        setLoading(false);
      }
    }
    init();
  }, []);

  // Load exams when selectedSemester changes
  useEffect(() => {
    if (!selectedSemester) return;
    
    async function loadExams() {
      try {
        setLoading(true);
        setError(null);
        const data = await studentExamApi.getMyExams({ semesterId: selectedSemester });
        setExams(data);
      } catch (err) {
        console.error("Lỗi khi tải lịch thi sinh viên:", err);
        setError("Đã xảy ra lỗi khi lấy lịch thi của bạn.");
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, [selectedSemester]);

  // Handle reminder toggles
  const handleToggleReminder = async (examId, courseCode) => {
    try {
      const isSet = await studentExamApi.toggleReminder(examId);
      
      // Update local state
      setExams(prev => prev.map(e => {
        if (e.id === examId) {
          return { ...e, hasReminder: isSet };
        }
        return e;
      }));

      // Trigger temporary toast feedback
      showToast(
        isSet 
          ? `Đã đăng ký nhận nhắc nhở lịch thi môn ${courseCode}!` 
          : `Đã hủy nhắc nhở lịch thi môn ${courseCode}.`
      );
    } catch (err) {
      showToast("Không thể thực hiện tác vụ nhắc lịch. Thử lại sau.", "error");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Filter exams based on UI Type Filter
  const filteredExams = exams.filter(exam => {
    if (examTypeFilter === "all") return true;
    return exam.examType === examTypeFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all transform translate-y-0 ${
          toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Lịch thi của tôi</h1>
          <p className="text-gray-600 mt-1">Xem kế hoạch phòng thi, thời gian và giám thị phân công học kỳ</p>
        </div>
        <div className="flex items-center gap-3">
          {semesters.length > 0 && (
            <ExamSemesterFilter
              semesters={semesters}
              selectedSemesterId={selectedSemester}
              onChange={setSelectedSemester}
              disabled={loading}
            />
          )}
        </div>
      </div>

      {/* Regulations Note Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
        <div className="flex gap-3.5">
          <Info className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-semibold text-amber-900">Quy chế thi và kiểm tra học thuật</h3>
            <ul className="text-sm text-amber-800 space-y-1 pl-4 list-disc">
              <li>Thí sinh phải có mặt tại cửa phòng thi trước giờ bắt đầu làm bài ít nhất <strong>15 phút</strong>.</li>
              <li>Bắt buộc mang theo <strong>Thẻ sinh viên</strong> (hoặc Căn cước công dân có dán ảnh) hợp lệ.</li>
              <li>Nghiêm cấm mang điện thoại di động, thiết bị đeo thông minh, tài liệu không được phép vào phòng thi.</li>
              <li>Nếu thấy lịch thi bị trùng giờ hoặc sai sót, hãy gửi đơn phúc khảo/yêu cầu hỗ trợ ngay.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Statistics Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", label: "Tất cả" },
            { id: "midterm", label: "Giữa kỳ" },
            { id: "final", label: "Cuối kỳ" },
            { id: "makeup", label: "Thi lại" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setExamTypeFilter(tab.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                examTypeFilter === tab.id
                  ? "bg-[#1E3A8A] text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {!loading && !error && (
          <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
            <span>Tổng số: <strong className="text-gray-900">{filteredExams.length} ca thi</strong></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            <span>Chờ thi: <strong className="text-[#1E3A8A]">{filteredExams.filter(e => e.status === "SCHEDULED").length} ca thi</strong></span>
          </div>
        )}
      </div>

      {/* Core Layout: List / Skeletons / Empty / Error States */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-8 w-2/3 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-10 bg-gray-100 rounded"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-lg mx-auto">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-900 mb-1">{error}</h3>
          <p className="text-sm text-red-700 mb-4">Vui lòng tải lại trang hoặc kiểm tra kết nối mạng của bạn.</p>
          <button
            onClick={() => {
              setError(null);
              setSelectedSemester(selectedSemester);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tải lại dữ liệu
          </button>
        </div>
      ) : filteredExams.length === 0 ? (
        <ExamEmptyState
          title={examTypeFilter !== "all" ? "Không có lịch thi loại này" : "Không có lịch thi nào"}
          description={
            examTypeFilter !== "all"
              ? `Hiện tại bạn chưa được xếp lịch thi ${
                  examTypeFilter === "midterm" ? "giữa kỳ" : examTypeFilter === "final" ? "cuối kỳ" : "thi lại"
                } nào cho học kỳ đã chọn.`
              : "Lịch thi học kỳ này chưa được công bố hoặc bạn chưa đăng ký học phần nào."
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredExams.map((exam) => (
            <ExamCardBase
              key={exam.id}
              exam={exam}
              role="student"
            />
          ))}
        </div>
      )}

      {/* Summary Stats Cards */}
      {!loading && !error && filteredExams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p className="text-sm font-semibold text-gray-500 mb-1">Môn thi sắp diễn ra</p>
            <p className="text-2xl font-bold text-gray-900">
              {(() => {
                const upcoming = filteredExams.filter(e => e.status === "SCHEDULED" && e.daysRemaining > 0);
                if (upcoming.length === 0) return "Không có";
                // Sort by daysRemaining ascending
                const sorted = [...upcoming].sort((a,b) => a.daysRemaining - b.daysRemaining);
                return `${sorted[0].courseCode} (${sorted[0].daysRemaining} ngày nữa)`;
              })()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p className="text-sm font-semibold text-gray-500 mb-1">Tổng hình thức thi</p>
            <p className="text-sm font-bold text-gray-900 space-y-0.5 mt-1.5">
              {["WRITTEN", "PRACTICAL", "ONLINE", "ORAL"].map((m) => {
                const count = filteredExams.filter(e => e.examMethod === m).length;
                if (count === 0) return null;
                const labels = { WRITTEN: "Thi viết", PRACTICAL: "Thực hành", ONLINE: "Thi online", ORAL: "Vấn đáp" };
                return (
                  <div key={m} className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 font-medium">{labels[m]}:</span>
                    <span className="text-gray-900 font-semibold bg-gray-100 px-1.5 py-0.5 rounded">{count} môn</span>
                  </div>
                );
              })}
            </p>
          </div>
          
        </div>
      )}
    </div>
  );
}

export default StudentExams;
