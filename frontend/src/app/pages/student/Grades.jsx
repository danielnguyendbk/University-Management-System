import { useEffect, useState } from "react";
import { TrendingUp, Award, BookOpen, RefreshCw, AlertCircle, Eye, X } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { getStudentGrades } from "../../../services/gradeService";

const getGradeColor = (grade) => {
  if (!grade) return "text-gray-700 bg-gray-50";
  if (grade === "A+" || grade === "A") return "text-green-700 bg-green-50";
  if (grade === "B+" || grade === "B") return "text-blue-700 bg-blue-50";
  if (grade === "C+" || grade === "C") return "text-amber-700 bg-amber-50";
  if (grade === "D+" || grade === "D") return "text-orange-700 bg-orange-50";
  if (grade === "F") return "text-red-700 bg-red-50";
  if (grade.startsWith("A")) return "text-green-700 bg-green-50";
  if (grade.startsWith("B")) return "text-blue-700 bg-blue-50";
  if (grade.startsWith("C")) return "text-amber-700 bg-amber-50";
  return "text-gray-700 bg-gray-50";
};

export function Grades() {
  const { user } = useAuth();
  const [allGradesData, setAllGradesData] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);

  const studentId = user?.studentId;

  useEffect(() => {
    let mounted = true;

    async function loadGrades() {
      if (!studentId) {
        if (mounted) {
          setError("Không tìm thấy mã sinh viên trong phiên đăng nhập.");
          setLoading(false);
        }
        return;
      }

      try {
        if (mounted) {
          setLoading(true);
          setError("");
        }

        const allGrades = await getStudentGrades(studentId);

        if (mounted) {
          setAllGradesData(allGrades);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Không thể tải kết quả học tập.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadGrades();

    return () => {
      mounted = false;
    };
  }, [studentId, refreshTick]);

  const summarySource = allGradesData;
  const totalCredits = summarySource?.totalCredits ?? 0;
  const cumulativeGPA = summarySource?.cumulativeGpa ?? 0;
  const ranking = summarySource?.academicRanking ?? "Chưa có dữ liệu";
  const semesters = allGradesData?.semesters ?? [];

  const handleRefresh = () => {
    setRefreshTick((current) => current + 1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Kết quả học tập</h1>
        <p className="text-gray-600 mt-1">Xem điểm và GPA của bạn</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Tất cả bảng điểm học kỳ</p>
          <p className="text-xs text-gray-500">Cuộn lên xuống để xem lần lượt từng bảng điểm theo học kỳ.</p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Đang tải kết quả học tập...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 flex items-start gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-semibold">Không tải được dữ liệu</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* GPA Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563eb] rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-100">GPA tích lũy</p>
                <Award className="w-6 h-6 text-blue-200" />
              </div>
              <p className="text-5xl font-bold mb-1">{Number(cumulativeGPA).toFixed(2)}</p>
              <p className="text-sm text-blue-100">Thang điểm 4.0</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Tổng tín chỉ tích lũy</p>
                <BookOpen className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-semibold text-gray-900">{totalCredits}</p>
              <p className="text-sm text-gray-600 mt-1">Tín chỉ đã hoàn thành</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Xếp loại học tập</p>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-semibold text-green-600">{ranking}</p>
              <p className="text-sm text-gray-600 mt-1">Kết quả học tập hiện tại</p>
            </div>
          </div>

          {/* Semester Grades */}
          {semesters.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
              Chưa có dữ liệu điểm theo học kỳ.
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto space-y-5 pr-1">
              {semesters.map((semester) => (
                <div key={semester.semesterId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{semester.semesterName}</h2>
                        <p className="text-sm text-gray-500">{semester.academicYear}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">GPA học kỳ</p>
                          <p className="text-xl font-bold text-[#1E3A8A]">{Number(semester.semesterGpa).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Mã môn
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Tên môn
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Tín chỉ
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Điểm chữ
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Điểm hệ 4
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Hành động
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {semester.courses.map((course) => (
                          <tr key={course.enrollmentId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-medium text-gray-900">{course.courseCode}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-900">{course.courseName}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-gray-900">{course.credits}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full font-semibold text-sm ${getGradeColor(course.letterGrade)}`}>
                                {course.letterGrade}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-medium text-gray-900">{Number(course.points).toFixed(1)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setSelectedCourse({ ...course, semesterName: semester.semesterName, academicYear: semester.academicYear })}
                                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                              >
                                <Eye className="w-4 h-4" />
                                Chi tiết
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Tổng tín chỉ</span>
                      <span className="font-semibold text-gray-900">{semester.totalCredits}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedCourse ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-200 p-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Chi tiết điểm thành phần</h3>
                    <p className="text-sm text-gray-500">
                      {selectedCourse.courseCode} • {selectedCourse.courseName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                  {[
                    ["Học kỳ", `${selectedCourse.semesterName} - ${selectedCourse.academicYear}`],
                    ["Tín chỉ", selectedCourse.credits],
                    ["Chuyên cần", selectedCourse.attendanceScore ?? "-"],
                    ["Bài tập", selectedCourse.exerciseScore ?? "-"],
                    ["Thực hành", selectedCourse.practiceScore ?? "-"],
                    ["Giữa kỳ", selectedCourse.midtermScore ?? "-"],
                    ["Cuối kỳ", selectedCourse.finalScore ?? "-"],
                    ["Điểm tổng kết", selectedCourse.totalScore !== null && selectedCourse.totalScore !== undefined ? Number(selectedCourse.totalScore).toFixed(2) : "-"],
                    ["Điểm chữ", selectedCourse.letterGrade ?? "-"],
                    ["Điểm hệ 4", selectedCourse.points !== null && selectedCourse.points !== undefined ? Number(selectedCourse.points).toFixed(1) : "-"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
                      <p className="mt-1 text-base font-semibold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 p-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(null)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Grade Scale */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thang điểm</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-green-900">A+ (4.0)</p>
                <p className="text-sm text-green-700">8.95 - 10</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-green-900">A (3.7)</p>
                <p className="text-sm text-green-700">8.45 - 8.94</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-900">B+ (3.5)</p>
                <p className="text-sm text-blue-700">7.95 - 8.44</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-900">B (3.0)</p>
                <p className="text-sm text-blue-700">6.95 - 7.94</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="font-semibold text-amber-900">C+ (2.5)</p>
                <p className="text-sm text-amber-700">6.45 - 6.94</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="font-semibold text-amber-900">C (2.0)</p>
                <p className="text-sm text-amber-700">5.45 - 6.44</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="font-semibold text-orange-900">D+ (1.5)</p>
                <p className="text-sm text-orange-700">4.95 - 5.44</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="font-semibold text-orange-900">D (1.0)</p>
                <p className="text-sm text-orange-700">3.95 - 4.94</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="font-semibold text-red-900">F (0)</p>
                <p className="text-sm text-red-700">0 - 3.94</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
