import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Search, RefreshCw, Eye, Building2, Calendar, Info, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Card, CardContent } from "../components/ui/card";
import { ScheduleGridView, GridScheduleItem, BlockColor } from "../components/ScheduleGridView";

const roomUsageData = [
  { id: 1, room: "A-101", building: "Toà A", floor: 1, type: "Phòng thường", capacity: 45, day: "Thứ 2", date: "14/04/2025", slot: "Tiết 1-3", time: "07:00 - 09:30", section: "CS101.L11", course: "Lập trình HĐT", lecturer: "TS. Nguyễn Văn An", students: 45, prepStatus: "ready" },
  { id: 2, room: "A-101", building: "Toà A", floor: 1, type: "Phòng thường", capacity: 45, day: "Thứ 2", date: "14/04/2025", slot: "Tiết 7-9", time: "13:00 - 15:30", section: "NET301.L05", course: "Mạng máy tính", lecturer: "ThS. Lê Minh Tú", students: 38, prepStatus: "not-ready" },
  { id: 3, room: "B-203", building: "Toà B", floor: 2, type: "Phòng máy", capacity: 30, day: "Thứ 3", date: "15/04/2025", slot: "Tiết 4-6", time: "09:45 - 12:15", section: "DB202.L08", course: "Cơ sở dữ liệu", lecturer: "TS. Phạm Quang Hưng", students: 28, prepStatus: "ready" },
  { id: 4, room: "C-301", building: "Toà C", floor: 3, type: "Phòng thường", capacity: 60, day: "Thứ 4", date: "16/04/2025", slot: "Tiết 1-3", time: "07:00 - 09:30", section: "MATH201.L02", course: "Toán cao cấp 2", lecturer: "GS.TS. Trần Thị Bình", students: 58, prepStatus: "ready" },
  { id: 5, room: "D-102", building: "Toà D", floor: 1, type: "Hội trường nhỏ", capacity: 100, day: "Thứ 5", date: "17/04/2025", slot: "Tiết 1-6", time: "07:00 - 12:15", section: "—", course: "Hội thảo Công nghệ 2025", lecturer: "Phòng Đào tạo tổ chức", students: 80, prepStatus: "not-ready" },
  { id: 6, room: "A-205", building: "Toà A", floor: 2, type: "Phòng thường", capacity: 50, day: "Thứ 5", date: "17/04/2025", slot: "Tiết 4-6", time: "09:45 - 12:15", section: "CS201.L03", course: "Cấu trúc dữ liệu", lecturer: "TS. Lê Văn Minh", students: 42, prepStatus: "ready" },
  { id: 7, room: "E-101", building: "Toà E", floor: 1, type: "Phòng thí nghiệm", capacity: 25, day: "Thứ 6", date: "18/04/2025", slot: "Tiết 7-9", time: "13:00 - 15:30", section: "CHEM301.L02", course: "Hóa đại cương TH", lecturer: "PGS. Lý Văn Đức", students: 22, prepStatus: "ready" },
];

const prepConfig: Record<string, { label: string; cls: string }> = {
  ready: { label: "Đã chuẩn bị", cls: "bg-green-100 text-green-700" },
  "not-ready": { label: "Chưa chuẩn bị", cls: "bg-orange-100 text-orange-700" },
};

const roomTypeColors: Record<string, string> = {
  "Phòng thường": "bg-blue-50 text-blue-600",
  "Phòng máy": "bg-purple-50 text-purple-600",
  "Phòng thí nghiệm": "bg-teal-50 text-teal-600",
  "Hội trường nhỏ": "bg-amber-50 text-amber-600",
};

interface DetailModal {
  item: typeof roomUsageData[0] | null;
}

export const EmployeePage = () => {
  const { user } = useAuth();
  const [building, setBuilding] = useState("all");
  const [room, setRoom] = useState("all");
  const [week, setWeek] = useState("15");
  const [date, setDate] = useState("");
  const [searched, setSearched] = useState(true);
  const [modal, setModal] = useState<DetailModal>({ item: null });
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  const filtered = roomUsageData.filter((r) => {
    const matchBuilding = building === "all" || r.building.includes(building);
    const matchRoom = room === "all" || r.room === room;
    return matchBuilding && matchRoom;
  });

  // Group by date
  const grouped = filtered.reduce((acc, item) => {
    const key = `${item.day} — ${item.date}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, typeof roomUsageData>);

  return (
    <div className="p-5 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Lịch sử dụng phòng học</h1>
          <p className="text-sm text-gray-500 mt-0.5">{user?.name} · {user?.code} · {user?.department}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Chỉ xem — không có quyền chỉnh sửa</span>
        </div>
      </div>

      {/* View-only notice */}
      <div className="flex items-center gap-2 text-xs bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl sm:hidden">
        <Info className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Tài khoản nhân viên chỉ có quyền xem lịch sử dụng phòng</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Phòng có lịch tuần này", value: new Set(roomUsageData.map(r => r.room)).size, color: "text-blue-600 bg-blue-50" },
          { label: "Tổng ca học", value: roomUsageData.length, color: "text-purple-600 bg-purple-50" },
          { label: "Đã chuẩn bị phòng", value: roomUsageData.filter(r => r.prepStatus === "ready").length, color: "text-green-600 bg-green-50" },
          { label: "Chưa chuẩn bị", value: roomUsageData.filter(r => r.prepStatus === "not-ready").length, color: "text-orange-600 bg-orange-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className={`text-xl font-bold ${stat.color.split(" ")[0]}`}>{stat.value}</p>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <Select value={building} onValueChange={setBuilding}>
            <SelectTrigger className="w-full md:w-36 h-9 text-sm">
              <Building2 className="w-3.5 h-3.5 mr-1 text-gray-400" />
              <SelectValue placeholder="Toà nhà" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả toà</SelectItem>
              <SelectItem value="A">Toà A</SelectItem>
              <SelectItem value="B">Toà B</SelectItem>
              <SelectItem value="C">Toà C</SelectItem>
              <SelectItem value="D">Toà D</SelectItem>
              <SelectItem value="E">Toà E</SelectItem>
            </SelectContent>
          </Select>

          <Select value={room} onValueChange={setRoom}>
            <SelectTrigger className="w-full md:w-36 h-9 text-sm">
              <SelectValue placeholder="Phòng học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phòng</SelectItem>
              {Array.from(new Set(roomUsageData.map(r => r.room))).map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={week} onValueChange={setWeek}>
            <SelectTrigger className="w-full md:w-36 h-9 text-sm">
              <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
              <SelectValue placeholder="Tuần học" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 20 }, (_, i) => i + 1).map(w => (
                <SelectItem key={w} value={String(w)}>Tuần {w}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-2">
            <Button onClick={() => setSearched(true)} className="bg-blue-600 hover:bg-blue-700 h-9 text-sm gap-1.5">
              <Search className="w-4 h-4" /> Tìm kiếm
            </Button>
            <Button variant="outline" onClick={() => { setBuilding("all"); setRoom("all"); setDate(""); setSearched(true); }} className="h-9 text-sm gap-1.5">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {!searched ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200 text-center">
          <Search className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-500">Nhập điều kiện và nhấn Tìm kiếm</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700">Không có lịch sử dụng phòng</p>
          <p className="text-xs text-gray-400 mt-1.5">Không tìm thấy lịch nào phù hợp với bộ lọc đã chọn trong Tuần {week}</p>
          <Button variant="outline" size="sm" className="mt-4 text-xs gap-1.5" onClick={() => { setBuilding("all"); setRoom("all"); }}>
            <RefreshCw className="w-3.5 h-3.5" /> Xóa bộ lọc
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* View mode toggle */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">
              Hiển thị <span className="font-bold text-gray-800">{filtered.length}</span> ca sử dụng phòng · Tuần {week}
            </p>
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

          {viewMode === "grid" ? (
            <ScheduleGridView
              items={filtered.map((item): GridScheduleItem => ({
                id: item.id,
                name: item.course,
                subLabel: item.room,
                detail1: item.lecturer,
                detail2: `${item.building} · ${item.type}`,
                day: item.day,
                slot: item.slot,
                time: item.time,
                color: (item.prepStatus === "ready" ? "green" : "orange") as BlockColor,
                badge: prepConfig[item.prepStatus].label,
              }))}
              onItemClick={(gridItem) => {
                const found = filtered.find(r => r.id === gridItem.id);
                if (found) setModal({ item: found });
              }}
              compactDays
            />
          ) : (
          Object.entries(grouped).map(([dateKey, items]) => (
            <div key={dateKey}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{dateKey}</span>
                </div>
                <span className="text-xs text-gray-400">{items.length} ca học</span>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs font-semibold text-gray-600">Phòng học</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600">Loại phòng</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600 text-center">SC</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600">Ca học / Giờ</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600">Môn học</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600">Giảng viên</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600 text-center">SV</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600 text-center">Tình trạng phòng</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600 text-center">Chi tiết</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50 border-b border-gray-100">
                          <TableCell>
                            <p className="text-xs font-bold text-blue-700">{item.room}</p>
                            <p className="text-[11px] text-gray-400">{item.building} · Tầng {item.floor}</p>
                          </TableCell>
                          <TableCell>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${roomTypeColors[item.type] || "bg-gray-100 text-gray-600"}`}>
                              {item.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-center text-gray-600">{item.capacity}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs font-medium text-gray-800">{item.slot}</span>
                            </div>
                            <p className="text-[11px] text-gray-400 ml-4">{item.time}</p>
                          </TableCell>
                          <TableCell className="text-xs text-gray-700 max-w-[160px]">
                            <div className="truncate font-medium" title={item.course}>{item.course}</div>
                            {item.section !== "—" && <div className="font-mono text-[11px] text-blue-600 truncate">{item.section}</div>}
                          </TableCell>
                          <TableCell className="text-xs text-gray-600 max-w-[130px]">
                            <div className="truncate" title={item.lecturer}>{item.lecturer}</div>
                          </TableCell>
                          <TableCell className="text-xs text-center">{item.students}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${prepConfig[item.prepStatus].cls} hover:${prepConfig[item.prepStatus].cls} text-[11px]`}>
                              {prepConfig[item.prepStatus].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              onClick={() => setModal({ item })}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 mx-auto"
                            >
                              <Eye className="w-3 h-3" /> Xem
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ))
          )}

          {/* Summary note */}
          <div className="flex items-start gap-2.5 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Hướng dẫn chuẩn bị phòng</p>
              <p className="mt-0.5 text-blue-600">Vui lòng đảm bảo phòng được mở và chuẩn bị đầy đủ thiết bị (điều hoà, máy chiếu, bàn ghế) trước giờ học tối thiểu 15 phút. Các phòng có trạng thái "Chưa chuẩn bị" cần được xử lý ngay.</p>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {modal.item && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModal({ item: null })}>
          <Card className="w-full max-w-md shadow-2xl border-0" onClick={(e) => e.stopPropagation()}>
            <div className="bg-blue-600 rounded-t-xl px-5 py-4">
              <h3 className="text-sm font-bold text-white">{modal.item.room} — Chi tiết lịch sử dụng</h3>
              <p className="text-xs text-blue-200 mt-0.5">{modal.item.day} · {modal.item.date}</p>
            </div>
            <CardContent className="p-5 space-y-3">
              {[
                { label: "Toà nhà / Tầng", value: `${modal.item.building} · Tầng ${modal.item.floor}` },
                { label: "Loại phòng", value: modal.item.type },
                { label: "Sức chứa", value: `${modal.item.capacity} chỗ` },
                { label: "Ca học / Giờ", value: `${modal.item.slot} (${modal.item.time})` },
                { label: "Lớp học phần", value: modal.item.section },
                { label: "Môn học", value: modal.item.course },
                { label: "Giảng viên", value: modal.item.lecturer },
                { label: "Số sinh viên", value: `${modal.item.students} SV` },
                { label: "Tình trạng phòng", value: prepConfig[modal.item.prepStatus].label },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-start gap-4">
                  <span className="text-xs text-gray-500 flex-shrink-0">{row.label}</span>
                  <span className="text-xs font-semibold text-gray-900 text-right">{row.value}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                  <Info className="w-3.5 h-3.5" />
                  Nhân viên chỉ có quyền xem thông tin. Không thể chỉnh sửa.
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setModal({ item: null })}>
                Đóng
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};