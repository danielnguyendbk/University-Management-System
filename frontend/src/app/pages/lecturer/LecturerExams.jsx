import React, { useState, useEffect } from "react";
import { List, Calendar as CalendarIcon, Info, Users, UserCheck, MapPin } from "lucide-react";
import { lecturerExamApi } from "../../../api/lecturerExamApi";
import { ExamSemesterFilter } from "../../components/exam/ExamSemesterFilter";
import { ExamCardBase } from "../../components/exam/ExamCardBase";
import { ExamEmptyState } from "../../components/exam/ExamEmptyState";

export function LecturerExams() {
  const [exams, setExams] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [activeTab, setActiveTab] = useState("list"); // "list" | "weekly"
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load semesters
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const sems = await lecturerExamApi.getSemesters();
        setSemesters(sems);
        
        // Default to active semester, or the first one
        const activeSem = sems.find(s => s.active) || sems[0];
        if (activeSem) {
          setSelectedSemester(activeSem.id);
        }
      } catch (err) {
        console.error("Lỗi tải học kỳ giảng viên:", err);
        setError("Không thể tải danh sách học kỳ.");
        setLoading(false);
      }
    }
    init();
  }, []);

  // Load invigilations when semester changes
  useEffect(() => {
    if (!selectedSemester) return;

    async function loadInvigilations() {
      try {
        setLoading(true);
        setError(null);
        const data = await lecturerExamApi.getMyInvigilations({ semesterId: selectedSemester });
        setExams(data);
      } catch (err) {
        console.error("Lỗi tải lịch coi thi:", err);
        setError("Đã xảy ra lỗi khi lấy danh sách lịch coi thi của bạn.");
      } finally {
        setLoading(false);
      }
    }
    loadInvigilations();
  }, [selectedSemester]);

  // Group exams by day for weekly/timeline view
  const getGroupedExamsByDay = () => {
    const grouped = {};
    // Sort exams by date & start time first
    const sorted = [...exams].sort((a, b) => {
      if (a.examDate !== b.examDate) return a.examDate.localeCompare(b.examDate);
      return a.startTime.localeCompare(b.startTime);
    });

    sorted.forEach(exam => {
      if (!grouped[exam.examDate]) {
        grouped[exam.examDate] = [];
      }
      grouped[exam.examDate].push(exam);
    });
    return grouped;
  };

  const groupedExams = getGroupedExamsByDay();

  // Helper to format days: YYYY-MM-DD -> Thứ & Ngày tháng
  const formatDayHeader = (dateStr) => {
    const dateObj = new Date(dateStr);
    const daysOfWeek = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const dayName = daysOfWeek[dateObj.getDay()];
    const parts = dateStr.split("-");
    return `${dayName}, ${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Lịch coi thi giảng viên</h1>
          <p className="text-gray-600 mt-1">Theo dõi kế hoạch, vai trò và địa điểm phân công coi thi của giảng viên</p>
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

      {/* Info Notice Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 shadow-sm">
        <div className="flex gap-3.5">
          <Info className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-semibold text-indigo-900">Hướng dẫn cán bộ coi thi (CBCT)</h3>
            <ul className="text-sm text-indigo-800 space-y-1 pl-4 list-disc">
              <li>CBCT phải có mặt tại Phòng Hội đồng thi trước giờ làm bài <strong>30 phút</strong> để nhận hồ sơ và bốc thăm phòng thi.</li>
              <li>Kiểm tra thông tin Thẻ sinh viên, đối chiếu danh sách phòng thi kỹ lưỡng trước khi phát đề.</li>
              <li>Đối với ca thi thực hành/trực tuyến: Kiểm tra kết nối mạng và hoạt động của máy tính trước giờ thi.</li>
              <li>Bàn giao bài thi, danh sách ký nộp bài đầy đủ cho Ban thư ký ngay sau khi hết giờ làm bài.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* View Switch Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 self-start">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <List className="w-4 h-4" />
            Danh sách
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === "weekly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Theo tuần (Timeline)
          </button>
        </div>

        {!loading && !error && (
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-indigo-600 rounded"></span> Giám thị chính:{" "}
              <strong className="text-gray-950">{exams.filter(e => e.invigilatorRole === "MAIN").length} ca</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-violet-400 rounded"></span> Giám thị phụ:{" "}
              <strong className="text-gray-950">{exams.filter(e => e.invigilatorRole === "ASSISTANT").length} ca</strong>
            </span>
          </div>
        )}
      </div>

      {/* Main Panel Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 animate-pulse">
              <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
              <div className="h-8 w-1/2 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center max-w-lg mx-auto">
          <p className="text-rose-800 font-semibold mb-3">{error}</p>
          <button
            onClick={() => setSelectedSemester(selectedSemester)}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors"
          >
            Tải lại
          </button>
        </div>
      ) : exams.length === 0 ? (
        <ExamEmptyState
          title="Không có ca coi thi nào"
          description="Hiện tại học kỳ này bạn chưa được phân công hoặc chưa có ca thi nào được công bố."
        />
      ) : activeTab === "list" ? (
        // List View
        <div className="space-y-4">
          {exams.map((exam) => (
            <ExamCardBase
              key={exam.id}
              exam={exam}
              role="lecturer"
            />
          ))}
        </div>
      ) : (
        // Timeline/Weekly View
        <div className="space-y-8">
          {Object.keys(groupedExams).map((date) => (
            <div key={date} className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 flex items-center justify-between">
                <span>{formatDayHeader(date)}</span>
                <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2.5 py-0.5 rounded-full">
                  {groupedExams[date].length} ca coi thi
                </span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedExams[date].map((exam) => (
                  <div
                    key={exam.id}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 border-l-4 ${
                      exam.invigilatorRole === "MAIN" ? "border-l-indigo-600" : "border-l-violet-400"
                    } hover:shadow-md transition-shadow`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 rounded text-xs font-semibold">
                          {exam.courseCode}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          exam.invigilatorRole === "MAIN" 
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-100" 
                            : "bg-violet-50 text-violet-700 border border-violet-100"
                        }`}>
                          {exam.invigilatorRole === "MAIN" ? "Giám thị chính" : "Giám thị phụ"}
                        </span>
                      </div>

                      <h4 className="font-bold text-gray-900 text-base line-clamp-1">{exam.courseName}</h4>
                      <p className="text-xs text-gray-500 font-medium">Lớp học phần: {exam.sectionCode}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="font-semibold text-gray-900">{exam.roomCode}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 justify-end">
                          <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>Sĩ số: <strong className="text-gray-900">{exam.studentCount}</strong></span>
                        </div>
                        <div className="col-span-2 text-gray-600 mt-1 flex justify-between">
                          <span>Ca thi:</span>
                          <span className="font-semibold text-gray-900">{exam.startTime} - {exam.endTime} ({exam.duration})</span>
                        </div>
                      </div>
                      
                      {exam.note && (
                        <div className="bg-amber-50 border border-amber-100 rounded p-2 text-xxs text-amber-800">
                          <strong>Ghi chú:</strong> {exam.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LecturerExams;
