import { useState } from "react";
import { Search, Filter, AlertCircle, CheckCircle2, Users } from "lucide-react";

const courses = [
  {
    id: 1,
    code: "CS301",
    name: "Cấu trúc dữ liệu nâng cao",
    credits: 3,
    lecturer: "Dr. Emily Smith",
    available: 12,
    total: 30,
    schedule: "Thứ 2, Thứ 4 09:00-10:30",
    room: "A-301"
  },
  {
    id: 2,
    code: "CS302",
    name: "Hệ quản trị cơ sở dữ liệu",
    credits: 4,
    lecturer: "Prof. Michael Johnson",
    available: 5,
    total: 35,
    schedule: "Thứ 3, Thứ 5 11:00-12:30",
    room: "B-205"
  },
  {
    id: 3,
    code: "CS303",
    name: "Phát triển web",
    credits: 3,
    lecturer: "Dr. Sarah Williams",
    available: 0,
    total: 25,
    schedule: "Thứ 2, Thứ 4 14:00-15:30",
    room: "C-104"
  },
  {
    id: 4,
    code: "CS304",
    name: "Học máy",
    credits: 4,
    lecturer: "Dr. James Brown",
    available: 18,
    total: 30,
    schedule: "Thứ 3, Thứ 5 09:00-10:30",
    room: "A-205"
  },
  {
    id: 5,
    code: "CS305",
    name: "Kỹ nghệ phần mềm",
    credits: 3,
    lecturer: "Prof. Lisa Davis",
    available: 8,
    total: 30,
    schedule: "Thứ 4, Thứ 6 13:00-14:30",
    room: "B-301"
  },
  {
    id: 6,
    code: "MATH201",
    name: "Đại số tuyến tính",
    credits: 3,
    lecturer: "Dr. Robert Wilson",
    available: 15,
    total: 40,
    schedule: "Thứ 2, Thứ 4 10:30-12:00",
    room: "D-101"
  },
];

export function CourseRegistration() {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("Học kỳ Xuân 2026");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const toggleCourse = (courseId) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.lecturer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment =
      selectedDepartment === "all" || course.code.startsWith(selectedDepartment);

    return matchesSearch && matchesDepartment;
  });

  const totalCredits = courses
    .filter((course) => selectedCourses.includes(course.id))
    .reduce((sum, course) => sum + course.credits, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Đăng ký môn học</h1>
        <p className="text-gray-600 mt-1">Đăng ký học phần cho học kỳ Xuân 2026</p>
      </div>

      {/* Registration Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Môn đã chọn</p>
            <p className="text-2xl font-semibold text-gray-900">{selectedCourses.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Tổng tín chỉ</p>
            <p className="text-2xl font-semibold text-gray-900">{totalCredits}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Trạng thái đăng ký</p>
            <span className="inline-flex px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
              Đang mở
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Bộ lọc</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Học kỳ
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
            >
              <option>Học kỳ Xuân 2026</option>
              <option>Học kỳ Hè 2026</option>
              <option>Học kỳ Thu 2026</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khoa
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
            >
              <option value="all">Tất cả khoa</option>
              <option value="CS">Công nghệ thông tin</option>
              <option value="MATH">Toán học</option>
              <option value="ENG">Kỹ thuật</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                  Giảng viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Lịch học
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Chỗ trống
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCourses.map((course) => {
                const isSelected = selectedCourses.includes(course.id);
                const isFull = course.available === 0;
                
                return (
                  <tr key={course.id} className={isSelected ? "bg-blue-50" : "hover:bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{course.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{course.name}</p>
                      <p className="text-sm text-gray-500">Phòng: {course.room}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">{course.credits}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">{course.lecturer}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-600 text-sm">{course.schedule}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className={`font-medium ${isFull ? "text-red-600" : "text-gray-900"}`}>
                          {course.available}/{course.total}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isFull ? (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Đã đầy</span>
                        </div>
                      ) : isSelected ? (
                        <button
                          onClick={() => toggleCourse(course.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Đã chọn</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleCourse(course.id)}
                          className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors text-sm font-medium"
                        >
                          Đăng ký
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Registration */}
      {selectedCourses.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Sẵn sàng gửi đăng ký?
              </h3>
              <p className="text-sm text-gray-600">
                Bạn đã chọn {selectedCourses.length} môn với tổng {totalCredits} tín chỉ
              </p>
            </div>
            <button className="px-6 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors font-medium">
              Gửi đăng ký
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
