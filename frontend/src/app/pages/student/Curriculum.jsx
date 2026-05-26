import { useEffect, useMemo, useState } from "react";

import { BookOpen, CheckCircle2, Circle, Lock, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { getStudentCurriculum } from "../../../services/programService";

const getStatusIcon = (status) => {
  const normalized = String(status || "").toLowerCase().replace("_", "-");
  if (normalized === "completed") return <CheckCircle2 className="w-5 h-5 text-green-600" />;
  if (["registered", "studying", "in-progress", "available", "open", "pending"].includes(normalized)) {
    return <Circle className="w-5 h-5 text-blue-600" />;
  }
  if (normalized === "failed") return <AlertCircle className="w-5 h-5 text-red-600" />;
  return <Lock className="w-5 h-5 text-gray-400" />;
};

function getStatusColor(status) {
  const normalized = String(status || "").toLowerCase().replace("_", "-");

  switch (normalized) {
    case "completed":
      return "text-green-700 bg-green-50 border-green-200";
    case "registered":
    case "studying":
    case "in-progress":
      return "text-blue-700 bg-blue-50 border-blue-200";
    case "available":
    case "open":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "pending":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "failed":
      return "text-red-700 bg-red-50 border-red-200";
    case "locked":
    case "not-started":
      return "text-gray-600 bg-gray-50 border-gray-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

function groupCoursesBySemester(courses) {
  const grouped = {};
  courses.forEach((course) => {
    const key = course.recommendedSemester ? `Học kỳ ${course.recommendedSemester}` : "Chưa xác định";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(course);
  });

  return Object.keys(grouped)
    .sort((a, b) => {
      if (a === "Chưa xác định") return 1;
      if (b === "Chưa xác định") return -1;
      return a.localeCompare(b, undefined, { numeric: true });
    })
    .map((semesterName) => ({
      semesterName,
      courses: grouped[semesterName],
      credits: grouped[semesterName].reduce((sum, course) => sum + (course.credits || 0), 0),
    }));
}

export function Curriculum() {
  const { user } = useAuth();
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const studentId = user?.studentId ?? user?.studentProfile?.studentId;

  useEffect(() => {
    let mounted = true;

    async function loadCurriculum() {
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

        const data = await getStudentCurriculum(studentId);
        if (mounted) {
          setCurriculum(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Không thể tải chương trình đào tạo.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCurriculum();

    return () => {
      mounted = false;
    };
  }, [studentId]);

  const semesterGroups = curriculum?.semesters ?? [];
  const totalCredits = curriculum?.totalCredits ?? 0;
  const completedCredits = curriculum?.completedCredits ?? 0;
  const inProgressCredits = curriculum?.inProgressCredits ?? 0;
  const lockedCredits = curriculum?.lockedCredits ?? 0;
  const progressPercent = totalCredits > 0 ? Math.round((completedCredits / totalCredits) * 100) : 0;

  const semesterCourseCount = useMemo(
    () => semesterGroups.reduce((sum, semester) => sum + (semester.courses?.length ?? 0), 0),
    [semesterGroups]
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Đang tải chương trình đào tạo...
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
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">{curriculum?.programName || "Chương trình đào tạo"}</h1>
            <p className="text-gray-600 mt-1">
              {curriculum?.departmentName || ""} • {curriculum?.studentCode || ""} • {curriculum?.fullName || ""}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Tổng tín chỉ yêu cầu</p>
              <p className="text-3xl font-semibold text-gray-900">{totalCredits}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Tín chỉ đã hoàn thành</p>
              <p className="text-3xl font-semibold text-green-600">{completedCredits}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Đang học</p>
              <p className="text-3xl font-semibold text-blue-600">{inProgressCredits}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Tiến độ hoàn thành</p>
              <p className="text-3xl font-semibold text-[#1E3A8A]">{progressPercent}%</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Tiến độ chương trình</span>
              <span className="text-sm text-gray-600">{completedCredits} / {totalCredits} tín chỉ</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-[#1E3A8A] h-3 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Đã hoàn thành</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700">Đang học</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">Chưa mở</span>
              </div>
            </div>
          </div>

          {semesterGroups.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
              Chưa có dữ liệu chương trình đào tạo.
            </div>
          ) : (
            semesterGroups.map((semester) => (
              <div key={semester.semesterNumber} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563eb] px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">{semester.semesterTitle}</h2>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {semester.courses.map((course) => (
                      <div
                        key={course.courseCode}
                        className={`border rounded-lg p-4 ${getStatusColor(course.status)}`}
                      >
                        <div className="flex items-start gap-3">
                          {getStatusIcon(course.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-semibold text-gray-900">{course.courseCode}</p>
                              <span className="text-sm font-medium text-gray-600">{course.credits} cr</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{course.courseName}</p>
                            {course.required !== null && (
                              <span className="inline-flex px-2 py-0.5 bg-white border border-gray-200 rounded text-xs font-medium text-gray-900 mr-2">
                                {course.required ? "Bắt buộc" : "Tự chọn"}
                              </span>
                            )}
                            {course.status === "in-progress" && (
                              <span className="inline-flex px-2 py-0.5 bg-blue-100 border border-blue-200 rounded text-xs font-medium text-blue-900">
                                Hiện tại
                              </span>
                            )}
                            {course.status === "locked" && (
                              <span className="inline-flex px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-medium text-gray-600">
                                Chưa khả dụng
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    Tổng: {semester.totalCredits} tín chỉ • {semester.courses.length} học phần
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
