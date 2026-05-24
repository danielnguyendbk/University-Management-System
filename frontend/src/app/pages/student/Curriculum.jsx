import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BookOpen, GraduationCap, Loader2, RefreshCw } from "lucide-react";
import { getStudentCurriculum } from "../../../services/courseService";

const courseTypeLabels = {
  "bắt buộc chung": "Bắt buộc chung",
  "bắt buộc chung nhóm ngành": "Bắt buộc chung nhóm ngành",
  "cơ sở ngành": "Cơ sở ngành",
  "chuyên ngành": "Chuyên ngành",
  "thực tập": "Thực tập",
  "luận văn tốt nghiệp": "Luận văn tốt nghiệp",
};

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
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCurriculum = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getStudentCurriculum();
      setCurriculum(data);
    } catch (err) {
      setError(err.message || "Không tải được chương trình đào tạo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurriculum();
  }, []);

  const courses = curriculum?.courses || [];
  const semesters = useMemo(() => groupCoursesBySemester(courses), [courses]);
  const assignedCredits = curriculum?.assignedCredits ?? courses.reduce((sum, course) => sum + (course.credits || 0), 0);
  const achievedCredits = curriculum?.achievedCredits ?? courses
    .filter((course) => course.completed)
    .reduce((sum, course) => sum + (course.credits || 0), 0);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="min-h-[420px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-[#1E3A8A]">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-semibold">Đang tải chương trình đào tạo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Chương trình đào tạo</h1>
          <p className="text-gray-600 mt-1">Theo ngành học của sinh viên đang đăng nhập</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Không tải được dữ liệu</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadCurriculum}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Chương trình đào tạo</h1>
        <p className="text-gray-600 mt-1">
          {curriculum?.programName ? `${curriculum.programName} (${curriculum.programCode})` : "Theo ngành học của sinh viên"}
        </p>
      </div>

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sinh viên</p>
              <p className="font-semibold text-gray-900">{curriculum?.fullName || "-"}</p>
              <p className="text-sm text-gray-500">{curriculum?.studentCode || "-"}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Ngành học</p>
            <p className="font-semibold text-gray-900">{curriculum?.programName || "-"}</p>
            <p className="text-sm text-gray-500">{curriculum?.programCode || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Tín chỉ đã đạt / tổng</p>
            <p className="text-2xl font-semibold text-gray-900">{achievedCredits} / {assignedCredits}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Số môn học</p>
            <p className="text-2xl font-semibold text-[#1E3A8A]">{courses.length}</p>
          </div>
        </div>

      </section>

      {semesters.length === 0 ? (
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 text-center">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-900">Chưa có môn học trong chương trình đào tạo</p>
          <p className="text-sm text-gray-500 mt-1">Ngành của sinh viên chưa được admin gán danh sách môn học.</p>
        </section>
      ) : (
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] table-fixed">
              <colgroup>
                <col style={{ width: "72px" }} />
                <col style={{ width: "150px" }} />
                <col />
                <col style={{ width: "270px" }} />
                <col style={{ width: "130px" }} />
                <col style={{ width: "110px" }} />
              </colgroup>
              <thead>
                <tr className="bg-white border-b-2 border-sky-400">
                  <th className="px-5 py-4 text-center text-sm font-bold text-gray-700">STT</th>
                  <th className="px-5 py-4 text-left text-sm font-bold text-gray-700">Mã môn</th>
                  <th className="px-5 py-4 text-left text-sm font-bold text-gray-700">Tên môn học</th>
                  <th className="px-5 py-4 text-left text-sm font-bold text-gray-700">Loại</th>
                  <th className="px-5 py-4 text-center text-sm font-bold text-gray-700">Tín chỉ</th>
                  <th className="px-5 py-4 text-center text-sm font-bold text-gray-700">Đã học</th>
                </tr>
              </thead>
              <tbody>
                {semesters.flatMap((semester) => {
                  const semesterRow = (
                    <tr key={`${semester.semesterName}-summary`} className="bg-slate-100 border-b border-sky-300">
                      <td colSpan={4} className="px-5 py-3 text-sm font-bold text-gray-700">
                        {semester.semesterName}
                      </td>
                      <td className="px-5 py-3 text-center text-sm font-bold text-sky-600">
                        {semester.credits} tín chỉ
                      </td>
                      <td className="px-5 py-3 bg-slate-100" />
                    </tr>
                  );

                  const courseRows = semester.courses.map((course, index) => (
                    <tr key={course.programCourseId || `${semester.semesterName}-${course.courseId}`} className="border-b border-sky-200 hover:bg-blue-50/50">
                      <td className="px-5 py-4 text-center text-sm text-gray-600">{index + 1}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">{course.courseCode}</td>
                      <td className="px-5 py-4 text-sm text-gray-800 break-words">{course.courseName}</td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                          {courseTypeLabels[course.courseType] || course.courseType || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center text-sm font-semibold text-gray-800">{course.credits}</td>
                      <td className="px-5 py-4 text-center text-sm font-bold">
                        {course.completed ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-50 text-green-700 ring-1 ring-green-200">
                            X
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    </tr>
                  ));

                  return [semesterRow, ...courseRows];
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
