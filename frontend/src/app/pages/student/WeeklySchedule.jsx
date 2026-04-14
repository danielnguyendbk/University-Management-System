const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00"
];

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

const classes = [
  {
    id: 1,
    course: "Cấu trúc dữ liệu",
    code: "CS301",
    lecturer: "Dr. Smith",
    room: "A-301",
    day: "Thứ 2",
    startTime: "09:00",
    endTime: "10:30",
    color: "bg-blue-100 border-blue-300 text-blue-900"
  },
  {
    id: 2,
    course: "Hệ cơ sở dữ liệu",
    code: "CS302",
    lecturer: "Prof. Johnson",
    room: "B-205",
    day: "Thứ 3",
    startTime: "11:00",
    endTime: "12:30",
    color: "bg-green-100 border-green-300 text-green-900"
  },
  {
    id: 3,
    course: "Cấu trúc dữ liệu",
    code: "CS301",
    lecturer: "Dr. Smith",
    room: "A-301",
    day: "Thứ 4",
    startTime: "09:00",
    endTime: "10:30",
    color: "bg-blue-100 border-blue-300 text-blue-900"
  },
  {
    id: 4,
    course: "Hệ cơ sở dữ liệu",
    code: "CS302",
    lecturer: "Prof. Johnson",
    room: "B-205",
    day: "Thứ 5",
    startTime: "11:00",
    endTime: "12:30",
    color: "bg-green-100 border-green-300 text-green-900"
  },
  {
    id: 5,
    course: "Phát triển web",
    code: "CS303",
    lecturer: "Dr. Williams",
    room: "C-104",
    day: "Thứ 2",
    startTime: "14:00",
    endTime: "15:30",
    color: "bg-purple-100 border-purple-300 text-purple-900"
  },
  {
    id: 6,
    course: "Phát triển web",
    code: "CS303",
    lecturer: "Dr. Williams",
    room: "C-104",
    day: "Thứ 4",
    startTime: "14:00",
    endTime: "15:30",
    color: "bg-purple-100 border-purple-300 text-purple-900"
  },
  {
    id: 7,
    course: "Học máy",
    code: "CS304",
    lecturer: "Dr. Brown",
    room: "A-205",
    day: "Thứ 3",
    startTime: "09:00",
    endTime: "10:30",
    color: "bg-amber-100 border-amber-300 text-amber-900"
  },
  {
    id: 8,
    course: "Học máy",
    code: "CS304",
    lecturer: "Dr. Brown",
    room: "A-205",
    day: "Thứ 5",
    startTime: "09:00",
    endTime: "10:30",
    color: "bg-amber-100 border-amber-300 text-amber-900"
  },
  {
    id: 9,
    course: "Đại số tuyến tính",
    code: "MATH201",
    lecturer: "Dr. Wilson",
    room: "D-101",
    day: "Thứ 2",
    startTime: "10:30",
    endTime: "12:00",
    color: "bg-rose-100 border-rose-300 text-rose-900"
  },
  {
    id: 10,
    course: "Đại số tuyến tính",
    code: "MATH201",
    lecturer: "Dr. Wilson",
    room: "D-101",
    day: "Thứ 4",
    startTime: "10:30",
    endTime: "12:00",
    color: "bg-rose-100 border-rose-300 text-rose-900"
  },
];

export function WeeklySchedule() {
  const getClassForTimeSlot = (day, time) => {
    return classes.find((cls) => {
      if (cls.day !== day) return false;
      const startIndex = timeSlots.indexOf(cls.startTime);
      const endIndex = timeSlots.indexOf(cls.endTime);
      const currentIndex = timeSlots.indexOf(time);
      return currentIndex >= startIndex && currentIndex < endIndex;
    });
  };

  const getRowSpan = (cls) => {
    const startIndex = timeSlots.indexOf(cls.startTime);
    const endIndex = timeSlots.indexOf(cls.endTime);
    return endIndex - startIndex;
  };

  const isClassStart = (day, time) => {
    return classes.some((cls) => cls.day === day && cls.startTime === time);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Thời khóa biểu tuần</h1>
          <p className="text-gray-600 mt-1">Học kỳ Xuân 2026 - Tuần bắt đầu từ 23/03</p>
        </div>
        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
          In thời khóa biểu
        </button>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Chú thích môn học:</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span className="text-sm text-gray-700">CS301 - Cấu trúc dữ liệu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-sm text-gray-700">CS302 - Hệ cơ sở dữ liệu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
            <span className="text-sm text-gray-700">CS303 - Phát triển web</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded"></div>
            <span className="text-sm text-gray-700">CS304 - Học máy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-rose-100 border border-rose-300 rounded"></div>
            <span className="text-sm text-gray-700">MATH201 - Đại số tuyến tính</span>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                  Giờ
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="border border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time}>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600 font-medium bg-gray-50">
                    {time}
                  </td>
                  {days.map((day) => {
                    const cls = getClassForTimeSlot(day, time);
                    const isStart = isClassStart(day, time);

                    if (cls && !isStart) {
                      return null;
                    }

                    if (cls && isStart) {
                      return (
                        <td
                          key={`${day}-${time}`}
                          rowSpan={getRowSpan(cls)}
                          className={`border border-gray-200 px-3 py-2 ${cls.color} border-2`}
                        >
                          <div className="space-y-1">
                            <p className="font-semibold text-sm">{cls.code}</p>
                            <p className="text-xs font-medium">{cls.course}</p>
                            <p className="text-xs opacity-80">Phòng: {cls.room}</p>
                            <p className="text-xs opacity-80">{cls.lecturer}</p>
                            <p className="text-xs opacity-70">
                              {cls.startTime} - {cls.endTime}
                            </p>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={`${day}-${time}`}
                        className="border border-gray-200 px-3 py-2 h-16"
                      ></td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Tổng số buổi học tuần này</p>
          <p className="text-2xl font-semibold text-gray-900">15</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Tổng số giờ</p>
          <p className="text-2xl font-semibold text-gray-900">22.5</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Môn đang học</p>
          <p className="text-2xl font-semibold text-gray-900">5</p>
        </div>
      </div>
    </div>
  );
}
