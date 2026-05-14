import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Search, RefreshCw, Eye, GraduationCap, Calendar, Clock, MapPin, BookOpen, User, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Card, CardContent } from "../components/ui/card";
import { ScheduleGridView, GridScheduleItem, BlockColor } from "../components/ScheduleGridView";

const scheduleData = [
  { id: 1, subject: "Lập trình hướng đối tượng", code: "CS101", section: "CS101.L11", class: "D21CNTT01", credits: 3, day: "Thứ 2", slot: "Tiết 1-3", time: "07:00 - 09:30", room: "A-301", building: "Toà A", lecturer: "TS. Nguyễn Văn An", type: "Lý thuyết", status: "ongoing" },
  { id: 2, subject: "Cấu trúc dữ liệu & GT", code: "CS201", section: "CS201.L03", class: "D21CNTT01", credits: 3, day: "Thứ 3", slot: "Tiết 4-6", time: "09:45 - 12:15", room: "A-205", building: "Toà A", lecturer: "TS. Lê Văn Minh", type: "Lý thuyết", status: "ongoing" },
  { id: 3, subject: "Toán cao cấp 2", code: "MATH201", section: "MATH201.L02", class: "D21CNTT01", credits: 4, day: "Thứ 4", slot: "Tiết 1-3", time: "07:00 - 09:30", room: "B-105", building: "Toà B", lecturer: "GS.TS. Trần Thị Bình", type: "Lý thuyết", status: "ongoing" },
  { id: 4, subject: "Cơ sở dữ liệu", code: "DB202", section: "DB202.L08", class: "D21CNTT01", credits: 3, day: "Thứ 4", slot: "Tiết 7-9", time: "13:00 - 15:30", room: "C-201", building: "Toà C", lecturer: "TS. Phạm Quang Hưng", type: "Lý thuyết", status: "ongoing" },
  { id: 5, subject: "Lập trình HĐT — Thực hành", code: "CS101TH", section: "CS101TH.L05", class: "D21CNTT01", credits: 1, day: "Thứ 5", slot: "Tiết 4-6", time: "09:45 - 12:15", room: "B-302", building: "Toà B", lecturer: "ThS. Lê Minh Tú", type: "Thực hành", status: "ongoing" },
  { id: 6, subject: "Tiếng Anh kỹ thuật", code: "ENG102", section: "ENG102.L06", class: "D21CNTT01", credits: 2, day: "Thứ 6", slot: "Tiết 4-6", time: "09:45 - 12:15", room: "A-101", building: "Toà A", lecturer: "ThS. Ngô Thị Mai", type: "Lý thuyết", status: "upcoming" },
];

const statusConfig: Record<string, { label: string; cls: string }> = {
  ongoing: { label: "Đang học", cls: "bg-green-100 text-green-700" },
  upcoming: { label: "Sắp tới", cls: "bg-blue-100 text-blue-700" },
  cancelled: { label: "Đã hủy", cls: "bg-red-100 text-red-700" },
  completed: { label: "Hoàn thành", cls: "bg-gray-100 text-gray-500" },
};

const typeColors: Record<string, string> = {
  "Lý thuyết": "bg-blue-50 text-blue-600",
  "Thực hành": "bg-teal-50 text-teal-600",
};

export const StudentPage = () => {
  const { user } = useAuth();
  const [studentCode, setStudentCode] = useState(user?.code || "");
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [semester, setSemester] = useState("1");
  const [week, setWeek] = useState("15");
  const [searchDate, setSearchDate] = useState("");
  const [searched, setSearched] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<typeof scheduleData[0] | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  const handleSearch = () => {
    if (studentCode.trim()) setSearched(true);
  };

  const handleRefresh = () => {
    setStudentCode(user?.code || "");
    setSemester("1");
    setWeek("15");
    setSearchDate("");
    setSearched(false);
  };

  return (
    <div className="p-5 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tra cứu Thời khóa biểu</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {user?.name} · {user?.code} · {user?.department}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Sinh viên — Chỉ xem</span>
        </div>
      </div>

      {/* View-only notice */}
      <div className="flex items-center gap-2 text-xs bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl">
        <Info className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Đây là cổng tra cứu thời khóa biểu. Sinh viên không có quyền thay đổi lịch học. Mọi thắc mắc vui lòng liên hệ Phòng Đào tạo.</span>
      </div>

      {/* Search Panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-600" />
          Điều kiện tra cứu
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <div className="xl:col-span-2">
            <label className="text-xs text-gray-500 font-medium mb-1 block">Mã sinh viên *</label>
            <Input
              placeholder="VD: B21DCCN123"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Năm học</label>
            <Select value={academicYear} onValueChange={setAcademicYear}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
                <SelectItem value="2023-2024">2023-2024</SelectItem>
                <SelectItem value="2022-2023">2022-2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Học kỳ</label>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Học kỳ 1</SelectItem>
                <SelectItem value="2">Học kỳ 2</SelectItem>
                <SelectItem value="3">Học kỳ hè</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Tuần học</label>
            <Select value={week} onValueChange={setWeek}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 20 }, (_, i) => i + 1).map(w => (
                  <SelectItem key={w} value={String(w)}>Tuần {w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Ngày học</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 h-9 text-sm gap-1.5">
            <Search className="w-4 h-4" /> Tra cứu
          </Button>
          <Button variant="outline" onClick={handleRefresh} className="h-9 text-sm gap-1.5">
            <RefreshCw className="w-4 h-4" /> Làm mới
          </Button>
        </div>
      </div>

      {/* Results */}
      {!searched ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700">Nhập mã sinh viên và nhấn Tra cứu</p>
          <p className="text-xs text-gray-400 mt-1.5">Hệ thống sẽ hiển thị thời khóa biểu theo học kỳ và tuần học đã chọn</p>
        </div>
      ) : scheduleData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700">Không tìm thấy thời khóa biểu</p>
          <p className="text-xs text-gray-400 mt-1">Mã sinh viên <span className="font-semibold">{studentCode}</span> không có lịch học trong tuần {week} — Học kỳ {semester} năm học {academicYear}</p>
          <p className="text-xs text-gray-400 mt-1">Vui lòng kiểm tra lại mã sinh viên hoặc liên hệ Phòng Đào tạo</p>
          <Button variant="outline" size="sm" className="mt-4 text-xs gap-1.5" onClick={handleRefresh}>
            <RefreshCw className="w-3.5 h-3.5" /> Tra cứu lại
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Result header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                <GraduationCap className="w-3.5 h-3.5" />
                MSV: {studentCode}
              </div>
              <span className="text-xs text-gray-500">
                HK{semester} · {academicYear} · Tuần {week} · {scheduleData.length} môn học
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex gap-2 text-xs">
                <span className="flex items-center gap-1 text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Đang học: {scheduleData.filter(s => s.status === "ongoing").length}
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Sắp tới: {scheduleData.filter(s => s.status === "upcoming").length}
                </span>
              </div>
              {/* View toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Danh sách
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Lịch tuần
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Số môn học kỳ", value: scheduleData.length, icon: BookOpen, color: "text-blue-600 bg-blue-50" },
              { label: "Tổng tín chỉ", value: scheduleData.reduce((a, s) => a + s.credits, 0), icon: GraduationCap, color: "text-purple-600 bg-purple-50" },
              { label: "Số tiết/tuần", value: scheduleData.length * 3, icon: Clock, color: "text-green-600 bg-green-50" },
              { label: "Số phòng học", value: new Set(scheduleData.map(s => s.room)).size, icon: MapPin, color: "text-orange-600 bg-orange-50" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    <p className="text-[11px] text-gray-500">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Schedule Table */}
          {viewMode === "list" ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-semibold text-gray-600 w-8"></TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600">Môn học</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600">Lớp HP</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 text-center">TC</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600">Thứ / Ca</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600">Giờ học</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600">Phòng học</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600">Giảng viên</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 text-center">Loại</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 text-center">TT</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 text-center">Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduleData.map((s) => (
                    <>
                      <TableRow
                        key={s.id}
                        className={`hover:bg-blue-50/30 border-b border-gray-100 ${expandedRow === s.id ? "bg-blue-50/20" : ""}`}
                      >
                        <TableCell className="text-center">
                          <button
                            onClick={() => setExpandedRow(expandedRow === s.id ? null : s.id)}
                            className="p-0.5 text-gray-400 hover:text-gray-600"
                          >
                            {expandedRow === s.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-semibold text-gray-900">{s.subject}</p>
                          <p className="text-[11px] font-mono text-gray-400">{s.code}</p>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-blue-700 font-semibold">{s.section}</TableCell>
                        <TableCell className="text-xs text-center font-medium">{s.credits}</TableCell>
                        <TableCell className="text-xs text-gray-700 whitespace-nowrap">{s.day} · {s.slot}</TableCell>
                        <TableCell className="text-xs text-gray-600 whitespace-nowrap">{s.time}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs font-semibold text-gray-900">{s.room}</span>
                          </div>
                          <p className="text-[11px] text-gray-400 ml-4">{s.building}</p>
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 max-w-[130px]">
                          <div className="truncate flex items-center gap-1">
                            <User className="w-3 h-3 text-gray-300 flex-shrink-0" />
                            <span title={s.lecturer}>{s.lecturer}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${typeColors[s.type] || "bg-gray-100 text-gray-600"}`}>
                            {s.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${statusConfig[s.status].cls} hover:${statusConfig[s.status].cls} text-[11px]`}>
                            {statusConfig[s.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => setDetailItem(s)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 mx-auto"
                          >
                            <Eye className="w-3 h-3" /> Xem
                          </button>
                        </TableCell>
                      </TableRow>

                      {/* Expanded row */}
                      {expandedRow === s.id && (
                        <TableRow key={`${s.id}-expanded`} className="bg-blue-50/30">
                          <TableCell colSpan={11} className="py-3 px-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              <div className="bg-white rounded-lg p-3 border border-blue-100">
                                <p className="text-gray-400 text-[11px] font-medium">Lớp sinh viên</p>
                                <p className="font-semibold text-gray-900 mt-1">{s.class}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-blue-100">
                                <p className="text-gray-400 text-[11px] font-medium">Phòng học đầy đủ</p>
                                <p className="font-semibold text-gray-900 mt-1">{s.room} — {s.building}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-blue-100">
                                <p className="text-gray-400 text-[11px] font-medium">Loại giảng dạy</p>
                                <p className="font-semibold text-gray-900 mt-1">{s.type}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-blue-100">
                                <p className="text-gray-400 text-[11px] font-medium">Số tín chỉ</p>
                                <p className="font-semibold text-gray-900 mt-1">{s.credits} tín chỉ</p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Table footer */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Hiển thị {scheduleData.length} môn học · Tổng {scheduleData.reduce((a, s) => a + s.credits, 0)} tín chỉ
              </p>
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Xuất TKB
              </Button>
            </div>
          </div>
          ) : (
            <ScheduleGridView
              items={scheduleData.map((s): GridScheduleItem => ({
                id: s.id,
                name: s.subject,
                subLabel: s.section,
                detail1: s.lecturer,
                detail2: `${s.room} · ${s.building}`,
                day: s.day,
                slot: s.slot,
                time: s.time,
                color: (s.status === "upcoming" ? "teal" : s.status === "cancelled" ? "gray" : "blue") as BlockColor,
                badge: statusConfig[s.status].label,
              }))}
              onItemClick={(item) => {
                const found = scheduleData.find(s => s.id === item.id);
                if (found) setDetailItem(found);
              }}
              compactDays
            />
          )}

          {/* Footer note */}
          <div className="flex items-start gap-2.5 p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Lưu ý quan trọng</p>
              <p className="mt-0.5 text-amber-600">Thời khóa biểu có thể thay đổi trong quá trình học kỳ. Sinh viên vui lòng kiểm tra thường xuyên và theo dõi thông báo từ Phòng Đào tạo về bất kỳ thay đổi nào. Mọi khiếu nại vui lòng gửi qua email: daotao@university.edu.vn</p>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDetailItem(null)}>
          <Card className="w-full max-w-md shadow-2xl border-0" onClick={(e) => e.stopPropagation()}>
            <div className="bg-blue-600 rounded-t-xl px-5 py-4">
              <h3 className="text-sm font-bold text-white">{detailItem.subject}</h3>
              <p className="text-xs text-blue-200 mt-0.5 font-mono">{detailItem.section} · {detailItem.code}</p>
            </div>
            <CardContent className="p-5 space-y-3">
              {[
                { icon: BookOpen, label: "Lớp sinh viên", value: detailItem.class },
                { icon: GraduationCap, label: "Số tín chỉ", value: `${detailItem.credits} TC` },
                { icon: Calendar, label: "Lịch học", value: `${detailItem.day} · ${detailItem.slot}` },
                { icon: Clock, label: "Giờ học", value: detailItem.time },
                { icon: MapPin, label: "Phòng học", value: `${detailItem.room} (${detailItem.building})` },
                { icon: User, label: "Giảng viên", value: detailItem.lecturer },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400">{item.label}</p>
                      <p className="text-xs font-semibold text-gray-900">{item.value}</p>
                    </div>
                  </div>
                );
              })}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <Badge className={`${statusConfig[detailItem.status].cls} text-xs`}>{statusConfig[detailItem.status].label}</Badge>
                <Badge className={`${typeColors[detailItem.type]} text-xs`}>{detailItem.type}</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setDetailItem(null)}>
                Đóng
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};