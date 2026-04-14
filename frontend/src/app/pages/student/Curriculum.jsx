import { BookOpen, CheckCircle2, Circle, Lock } from "lucide-react";

const years = [
  {
    year: "Năm 1",
    semesters: [
      {
        name: "Học kỳ Thu 2024",
        courses: [
          { code: "CS101", name: "Nhập môn lập trình", credits: 4, status: "completed", grade: "A" },
          { code: "MATH101", name: "Giải tích 1", credits: 4, status: "completed", grade: "A-" },
          { code: "ENG101", name: "Kỹ năng viết tiếng Anh", credits: 3, status: "completed", grade: "B+" },
          { code: "PHY101", name: "Vật lý 1", credits: 4, status: "completed", grade: "A" },
        ]
      },
      {
        name: "Học kỳ Xuân 2025",
        courses: [
          { code: "CS102", name: "Cấu trúc dữ liệu", credits: 4, status: "completed", grade: "A" },
          { code: "MATH102", name: "Giải tích 2", credits: 4, status: "completed", grade: "A-" },
          { code: "ENG102", name: "Viết kỹ thuật", credits: 2, status: "completed", grade: "B+" },
          { code: "PHY102", name: "Vật lý 2", credits: 4, status: "completed", grade: "A" },
        ]
      }
    ]
  },
  {
    year: "Năm 2",
    semesters: [
      {
        name: "Học kỳ Thu 2025",
        courses: [
          { code: "CS201", name: "Giải thuật", credits: 4, status: "completed", grade: "A" },
          { code: "CS202", name: "Hệ điều hành", credits: 3, status: "completed", grade: "A-" },
          { code: "MATH301", name: "Toán rời rạc", credits: 3, status: "completed", grade: "A" },
          { code: "ENG201", name: "Viết kỹ thuật", credits: 2, status: "completed", grade: "B+" },
        ]
      },
      {
        name: "Học kỳ Xuân 2026 (Hiện tại)",
        courses: [
          { code: "CS301", name: "Cấu trúc dữ liệu và giải thuật", credits: 3, status: "in-progress" },
          { code: "CS302", name: "Hệ quản trị cơ sở dữ liệu", credits: 4, status: "in-progress" },
          { code: "CS303", name: "Phát triển web", credits: 3, status: "in-progress" },
          { code: "CS304", name: "Học máy", credits: 4, status: "in-progress" },
          { code: "MATH201", name: "Đại số tuyến tính", credits: 3, status: "in-progress" },
        ]
      }
    ]
  },
  {
    year: "Năm 3",
    semesters: [
      {
        name: "Học kỳ Thu 2026",
        courses: [
          { code: "CS401", name: "Kỹ nghệ phần mềm", credits: 4, status: "locked" },
          { code: "CS402", name: "Mạng máy tính", credits: 3, status: "locked" },
          { code: "CS403", name: "Trí tuệ nhân tạo", credits: 4, status: "locked" },
          { code: "ELEC1", name: "Tự chọn kỹ thuật I", credits: 3, status: "locked" },
        ]
      },
      {
        name: "Học kỳ Xuân 2027",
        courses: [
          { code: "CS404", name: "Phát triển di động", credits: 3, status: "locked" },
          { code: "CS405", name: "Điện toán đám mây", credits: 3, status: "locked" },
          { code: "CS406", name: "An toàn thông tin", credits: 3, status: "locked" },
          { code: "ELEC2", name: "Tự chọn kỹ thuật II", credits: 3, status: "locked" },
        ]
      }
    ]
  },
  {
    year: "Năm 4",
    semesters: [
      {
        name: "Học kỳ Thu 2027",
        courses: [
          { code: "CS497", name: "Đồ án tốt nghiệp I", credits: 3, status: "locked" },
          { code: "CS490", name: "Seminar tốt nghiệp", credits: 2, status: "locked" },
          { code: "ELEC3", name: "Tự chọn kỹ thuật III", credits: 3, status: "locked" },
          { code: "ELEC4", name: "Môn tự chọn chung", credits: 3, status: "locked" },
        ]
      },
      {
        name: "Học kỳ Xuân 2028",
        courses: [
          { code: "CS498", name: "Đồ án tốt nghiệp II", credits: 3, status: "locked" },
          { code: "CS499", name: "Thực hành nghề nghiệp", credits: 2, status: "locked" },
          { code: "ELEC5", name: "Tự chọn kỹ thuật IV", credits: 3, status: "locked" },
        ]
      }
    ]
  }
];

const getStatusIcon = (status) => {
  if (status === "completed") return <CheckCircle2 className="w-5 h-5 text-green-600" />;
  if (status === "in-progress") return <Circle className="w-5 h-5 text-blue-600" />;
  return <Lock className="w-5 h-5 text-gray-400" />;
};

const getStatusColor = (status) => {
  if (status === "completed") return "bg-green-50 border-green-200";
  if (status === "in-progress") return "bg-blue-50 border-blue-200";
  return "bg-gray-50 border-gray-200";
};

export function Curriculum() {
  const totalCredits = years.reduce(
    (sum, year) => sum + year.semesters.reduce(
      (s, sem) => s + sem.courses.reduce((c, course) => c + course.credits, 0),
      0
    ),
    0
  );

  const completedCredits = years.reduce(
    (sum, year) => sum + year.semesters.reduce(
      (s, sem) => s + sem.courses.filter(c => c.status === "completed").reduce((c, course) => c + course.credits, 0),
      0
    ),
    0
  );

  const inProgressCredits = years.reduce(
    (sum, year) => sum + year.semesters.reduce(
      (s, sem) => s + sem.courses.filter(c => c.status === "in-progress").reduce((c, course) => c + course.credits, 0),
      0
    ),
    0
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Chương trình đào tạo</h1>
        <p className="text-gray-600 mt-1">Công nghệ thông tin - Chương trình Cử nhân</p>
      </div>

      {/* Progress Summary */}
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
          <p className="text-3xl font-semibold text-[#1E3A8A]">
            {Math.round((completedCredits / totalCredits) * 100)}%
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Tiến độ chương trình</span>
          <span className="text-sm text-gray-600">{completedCredits} / {totalCredits} tín chỉ</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-[#1E3A8A] h-3 rounded-full transition-all"
            style={{ width: `${(completedCredits / totalCredits) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Legend */}
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

      {/* Curriculum by Year */}
      {years.map((yearData) => (
        <div key={yearData.year} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563eb] px-6 py-4">
            <h2 className="text-xl font-semibold text-white">{yearData.year}</h2>
          </div>

          <div className="p-6 space-y-6">
            {yearData.semesters.map((semester) => (
              <div key={semester.name}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{semester.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {semester.courses.map((course) => (
                    <div
                      key={course.code}
                      className={`border rounded-lg p-4 ${getStatusColor(course.status)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getStatusIcon(course.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{course.code}</p>
                            <span className="text-sm font-medium text-gray-600">{course.credits} cr</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{course.name}</p>
                          {course.grade && (
                            <span className="inline-flex px-2 py-0.5 bg-white border border-gray-200 rounded text-xs font-medium text-gray-900">
                              Điểm: {course.grade}
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
                  Tổng: {semester.courses.reduce((sum, c) => sum + c.credits, 0)} tín chỉ
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
