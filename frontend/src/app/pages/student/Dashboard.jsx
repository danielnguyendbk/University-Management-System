import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Award, BookOpen, RefreshCw, UserCircle2 } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../../hooks/useAuth";
import { getCurrentUser } from "../../../services/authService";
import { getStudentGrades } from "../../../services/gradeService";

function scoreToHeight(score) {
  if (score === null || score === undefined) {
    return 8;
  }

  const safeScore = Math.max(0, Math.min(10, Number(score)));
  return Math.max(16, Math.round((safeScore / 10) * 220));
}

function getSemesterCode(semester) {
  return semester?.semesterCode || semester?.semesterName || (semester?.semesterId ? String(semester.semesterId) : "");
}

function getSemesterLabel(semester) {
  const code = getSemesterCode(semester);
  return code || semester?.academicYear || "Học kỳ";
}

export function Dashboard() {
  const { user, setUser } = useAuth();
  const [gradeData, setGradeData] = useState(null);
  const [selectedSemesterCode, setSelectedSemesterCode] = useState("ALL");
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const studentProfile = user?.studentProfile;
  const studentId = user?.studentId ?? studentProfile?.studentId;

  useEffect(() => {
    let mounted = true;

    async function hydrateStudentProfile() {
      if (user?.role !== "STUDENT" || studentProfile) {
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (mounted && currentUser) {
          setUser({ ...currentUser });
        }
      } catch {
        // Keep the summary login session; grade loading below will surface actionable errors.
      }
    }

    hydrateStudentProfile();

    return () => {
      mounted = false;
    };
  }, [setUser, studentProfile, user?.role]);

  async function refreshDashboard() {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser({ ...currentUser });
      }
    } catch {
      // Keep the current session if profile refresh fails.
    }

    setRefreshTick((current) => current + 1);
  }

  useEffect(() => {
    let mounted = true;

    async function loadDashboardData() {
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

        const data = await getStudentGrades(studentId);

        if (mounted) {
          setGradeData(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Không thể tải dữ liệu trang chủ sinh viên.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      mounted = false;
    };
  }, [studentId, refreshTick]);

  const semesters = gradeData?.semesters ?? [];

  useEffect(() => {
    if (!semesters.length) {
      if (selectedSemesterCode !== "ALL") {
        setSelectedSemesterCode("ALL");
      }
      return;
    }

    const hasSelected = selectedSemesterCode === "ALL" || semesters.some((semester) => getSemesterCode(semester) === selectedSemesterCode);
    if (!hasSelected) {
      setSelectedSemesterCode("ALL");
    }
  }, [semesters, selectedSemesterCode]);

  const semesterOptions = useMemo(() => {
    const seen = new Set();
    return semesters
      .map((semester) => ({ code: getSemesterCode(semester), label: getSemesterLabel(semester) }))
      .filter((semester) => {
        if (!semester.code || seen.has(semester.code)) {
          return false;
        }
        seen.add(semester.code);
        return true;
      });
  }, [semesters]);

  const currentSemester = useMemo(
    () => selectedSemesterCode === "ALL"
      ? null
      : semesters.find((semester) => getSemesterCode(semester) === selectedSemesterCode) ?? null,
    [semesters, selectedSemesterCode]
  );

  const chartRows = useMemo(() => {
    if (selectedSemesterCode === "ALL") {
      return semesters.flatMap((semester) => {
        const semesterCode = getSemesterCode(semester);
        const semesterLabel = getSemesterLabel(semester);
        return (semester.courses ?? []).map((course) => ({ ...course, semesterCode, semesterLabel }));
      });
    }

    const semesterCode = getSemesterCode(currentSemester);
    const semesterLabel = getSemesterLabel(currentSemester);
    return (currentSemester?.courses ?? []).map((course) => ({ ...course, semesterCode, semesterLabel }));
  }, [currentSemester, semesters, selectedSemesterCode]);

  const chartLabel = selectedSemesterCode === "ALL" ? "Tất cả học kỳ" : getSemesterLabel(currentSemester);
  const chartGpaLabel = selectedSemesterCode === "ALL" ? "GPA tích lũy" : "GPA học kỳ";
  const chartGpa = selectedSemesterCode === "ALL" ? gradeData?.cumulativeGpa : currentSemester?.semesterGpa;

  const summaryRows = [
    { label: "Họ và tên", value: user?.fullName || gradeData?.fullName || "Chưa có dữ liệu" },
    { label: "Mã sinh viên", value: gradeData?.studentCode || user?.studentCode || studentProfile?.studentCode || user?.username || "Chưa có dữ liệu" },
    { label: "Vai trò", value: user?.role || "STUDENT" },
    { label: "Ngày sinh", value: studentProfile?.dateOfBirth || gradeData?.dateOfBirth || "-" },
    { label: "Giới tính", value: studentProfile?.gender || "-" },
    { label: "Số điện thoại", value: studentProfile?.phone || "-" },
    { label: "Địa chỉ thường trú", value: studentProfile?.address || "-" },
    { label: "Niên khóa", value: studentProfile?.enrollmentYear || "-" },
    { label: "Trạng thái", value: studentProfile?.academicStatus || "-" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Trang chủ" subtitle={`Chào mừng quay lại, ${user?.fullName || "sinh viên"}`} />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 flex items-start gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-semibold">Không tải được dữ liệu</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : null}

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" aria-label="Student information">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserCircle2 className="w-5 h-5 text-[#1E3A8A]" />
            <h2 className="text-lg font-semibold text-gray-900">Thông tin sinh viên</h2>
          </div>
          <button
            type="button"
            onClick={refreshDashboard}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaryRows.map((row) => (
            <div key={row.label} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">{row.label}</p>
              <p className="mt-1 text-base font-semibold text-gray-900">{row.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" aria-label="Academic performance chart">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#1E3A8A]" />
            <h2 className="text-lg font-semibold text-gray-900">Biểu đồ kết quả học tập</h2>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="dashboard-semester" className="text-sm font-medium text-gray-700">
              Hiển thị theo học kỳ
            </label>
            <select
              id="dashboard-semester"
              value={selectedSemesterCode}
              onChange={(event) => setSelectedSemesterCode(event.target.value)}
              className="min-w-64 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900"
              disabled={loading || !semesters.length}
            >
              {!semesters.length ? (
                <option value="">Chưa có học kỳ</option>
              ) : null}
              {semesters.length ? <option value="ALL">Tất cả học kỳ</option> : null}
              {semesterOptions.map((semester) => (
                <option key={semester.code} value={semester.code}>
                  {semester.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
            Đang tải biểu đồ kết quả học tập...
          </div>
        ) : !semesters.length ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
            Chưa có dữ liệu học kỳ để hiển thị biểu đồ.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <p>
                {chartLabel}
              </p>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                <Award className="w-4 h-4" />
                {chartGpaLabel}: {Number(chartGpa ?? 0).toFixed(2)}
              </div>
            </div>

            {hoveredCourse ? (
              <div className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                <p className="font-semibold">
                  {hoveredCourse.courseCode} - {hoveredCourse.courseName}
                </p>
                {hoveredCourse.semesterCode ? <p className="text-blue-700">{hoveredCourse.semesterCode}</p> : null}
                <p className="text-blue-800">
                  Điểm tổng kết: {hoveredCourse.totalScore !== null && hoveredCourse.totalScore !== undefined
                    ? Number(hoveredCourse.totalScore).toFixed(2)
                    : "N/A"}
                  {" | "}
                  Điểm hệ 4: {hoveredCourse.points !== null && hoveredCourse.points !== undefined
                    ? Number(hoveredCourse.points).toFixed(1)
                    : "N/A"}
                </p>
              </div>
            ) : null}

            {chartRows.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                Học kỳ này chưa có môn học để hiển thị.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="h-[280px] flex gap-3">
                    <div className="w-10 relative border-r border-gray-200">
                      {[10, 8, 6, 4, 2, 0].map((tick) => (
                        <div
                          key={tick}
                          className="absolute right-2 text-[11px] text-gray-500"
                          style={{ bottom: `${(tick / 10) * 240}px` }}
                        >
                          {tick}
                        </div>
                      ))}
                    </div>

                    <div className="relative flex-1 border-l border-b border-gray-200 px-4 pt-2 pb-4 flex items-end gap-3 h-[260px]">
                      {[10, 8, 6, 4, 2].map((tick) => (
                        <div
                          key={`grid-${tick}`}
                          className="absolute left-0 right-0 border-t border-dashed border-gray-200"
                          style={{ bottom: `${(tick / 10) * 240}px` }}
                        />
                      ))}

                      {chartRows.map((course) => (
                        <div key={course.enrollmentId} className="relative flex-1 min-w-[92px] flex flex-col items-center gap-2 z-10">
                          <span className="text-xs font-semibold text-gray-700">
                            {course.totalScore !== null && course.totalScore !== undefined
                              ? Number(course.totalScore).toFixed(2)
                              : "N/A"}
                          </span>
                          <div
                            className="w-full max-w-[72px] rounded-t-md bg-gradient-to-t from-[#1E3A8A] to-[#3b82f6] transition-transform duration-150 hover:scale-105"
                            style={{ height: `${scoreToHeight(course.totalScore)}px` }}
                            onMouseEnter={() => setHoveredCourse(course)}
                            onMouseLeave={() => setHoveredCourse(null)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 grid" style={{ gridTemplateColumns: `repeat(${chartRows.length}, minmax(92px, 1fr))` }}>
                    {chartRows.map((course) => (
                      <div key={`${course.enrollmentId}-label`} className="px-2 text-center">
                        <p className="text-xs font-semibold text-gray-800 truncate">{course.courseCode}</p>
                        <p className="text-[11px] text-gray-500 truncate">{course.courseName}</p>
                        {selectedSemesterCode === "ALL" && course.semesterCode ? (
                          <p className="text-[11px] text-blue-600 truncate">{course.semesterCode}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
