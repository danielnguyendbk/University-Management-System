import { useState } from "react";
import { Plus, CheckCircle, Clock, XCircle, Eye, Search, Wrench, Zap, Droplets, Home, AlertTriangle, AlertCircle, X } from "lucide-react";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";
import { Label } from "../../../app/components/ui/label";
import { Badge } from "../../../app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../app/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../app/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../app/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../app/components/ui/dialog";

const scheduleData = [
  { id: 1, code: "SE101", subject: "Lập trình Java", lecturer: "TS. Nguyễn Văn A", room: "A-201", building: "A", day: "Thứ 2", slot: "Tiết 1-3", time: "07:00-09:30", credits: 3, status: "ongoing" },
  { id: 2, code: "SE102", subject: "Cấu trúc dữ liệu", lecturer: "PGS. Trần Thị B", room: "B-301", building: "B", day: "Thứ 3", slot: "Tiết 4-6", time: "09:45-12:15", credits: 3, status: "upcoming" },
  { id: 3, code: "SE201", subject: "Web Development", lecturer: "TS. Phạm Văn C", room: "C-105", building: "C", day: "Thứ 5", slot: "Tiết 7-9", time: "13:00-15:30", credits: 3, status: "upcoming" }
];

const bookingRequestConfig = {
  approved: { label: "Đã duyệt", className: "bg-green-100 text-green-700", icon: CheckCircle },
  pending: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-700", icon: Clock },
  rejected: { label: "Từ chối", className: "bg-red-100 text-red-700", icon: XCircle }
};

const maintenanceConfig = {
  pending: { label: "Chờ xử lý", className: "bg-yellow-100 text-yellow-700", icon: Clock },
  processing: { label: "Đang xử lý", className: "bg-blue-100 text-blue-700", icon: Zap },
  completed: { label: "Hoàn thành", className: "bg-green-100 text-green-700", icon: CheckCircle },
  cancelled: { label: "Hủy", className: "bg-gray-100 text-gray-700", icon: XCircle }
};

const maintenanceTypeLabels = {
  electrical: "Điện",
  plumbing: "Nước",
  furniture: "Nội thất",
  equipment: "Thiết bị",
  other: "Khác"
};

const StudentPage = () => {
  const [activeTab, setActiveTab] = useState("schedule");
  
  // Schedule search state
  const [searchForm, setSearchForm] = useState({ studentCode: "", year: "", semester: "", week: "", date: "" });
  const [displayMode, setDisplayMode] = useState("grid");
  
  // Club booking request state
  const [clubBookingForm, setClubBookingForm] = useState({ clubName: "", room: "", date: "", slot: "", purpose: "", attendees: "" });
  const [clubBookingErrors, setClubBookingErrors] = useState({});
  const [clubBookingSubmitting, setClubBookingSubmitting] = useState(false);
  const [clubBookingSubmitted, setClubBookingSubmitted] = useState(false);
  const [myClubBookings, setMyClubBookings] = useState([
    { id: "CLB-2025-001", clubName: "CLB Lập trình", room: "A-301", purpose: "Luyện tập Hackathon", date: "22/04/2025", slot: "Tiết 7-10", status: "approved" },
    { id: "CLB-2025-002", clubName: "CLB Lập trình", room: "C-201", purpose: "Tổ chức hội thảo", date: "25/04/2025", slot: "Tiết 1-3", status: "pending" }
  ]);

  // Maintenance request state
  const [maintenanceForm, setMaintenanceForm] = useState({ type: "", location: "", description: "", urgency: "normal" });
  const [maintenanceErrors, setMaintenanceErrors] = useState({});
  const [maintenanceSubmitting, setMaintenanceSubmitting] = useState(false);
  const [maintenanceSubmitted, setMaintenanceSubmitted] = useState(false);
  const [maintenanceRequests, setMaintenanceRequests] = useState([
    { id: "YC-STU-001", type: "electrical", location: "A-201", description: "Quạt trần không hoạt động", urgency: "normal", date: "10/04/2025", status: "completed" },
    { id: "YC-STU-002", type: "furniture", location: "B-301", description: "Bàn học bị hỏng", urgency: "normal", date: "11/04/2025", status: "processing" }
  ]);
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Club booking validation and submit
  const validateClubBooking = () => {
    const errs = {};
    if (!clubBookingForm.clubName.trim()) errs.clubName = "Vui lòng nhập tên CLB";
    if (!clubBookingForm.room) errs.room = "Vui lòng chọn phòng";
    if (!clubBookingForm.date) errs.date = "Vui lòng chọn ngày";
    if (!clubBookingForm.slot) errs.slot = "Vui lòng chọn ca học";
    if (!clubBookingForm.purpose.trim()) errs.purpose = "Vui lòng nhập mục đích";
    return errs;
  };

  const handleClubBookingSubmit = (e) => {
    e.preventDefault();
    const errs = validateClubBooking();
    setClubBookingErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setClubBookingSubmitting(true);
    setTimeout(() => {
      setClubBookingSubmitting(false);
      setClubBookingSubmitted(true);
      setClubBookingForm({ clubName: "", room: "", date: "", slot: "", purpose: "", attendees: "" });
    }, 1200);
  };

  // Maintenance validation and submit
  const validateMaintenance = () => {
    const errs = {};
    if (!maintenanceForm.type) errs.type = "Vui lòng chọn loại";
    if (!maintenanceForm.location.trim()) errs.location = "Vui lòng nhập vị trí";
    if (!maintenanceForm.description.trim()) errs.description = "Vui lòng nhập mô tả";
    return errs;
  };

  const handleMaintenanceSubmit = (e) => {
    e.preventDefault();
    const errs = validateMaintenance();
    setMaintenanceErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setMaintenanceSubmitting(true);
    setTimeout(() => {
      setMaintenanceSubmitting(false);
      setMaintenanceSubmitted(true);
      setMaintenanceForm({ type: "", location: "", description: "", urgency: "normal" });
    }, 1200);
  };

  return (
    <div className="p-5 md:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Sinh viên</h1>
        <p className="text-sm text-gray-500 mt-0.5">Xem lịch học, đặt phòng CLB và yêu cầu sửa chữa</p>
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto">
        {[
          { key: "schedule", label: "Lịch học của tôi" },
          { key: "club-booking", label: "Yêu cầu đặt phòng CLB" },
          { key: "club-booking-status", label: "Danh sách đặt phòng CLB" },
          { key: "maintenance-create", label: "Yêu cầu sửa chữa" },
          { key: "maintenance-status", label: "Lịch sử sửa chữa" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Schedule Tab */}
      {activeTab === "schedule" && (
        <div className="space-y-4">
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">Mã SV</Label>
                  <Input placeholder="VD: 20200001" value={searchForm.studentCode} onChange={(e) => setSearchForm(f => ({...f, studentCode: e.target.value}))} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">Năm HK</Label>
                  <Select value={searchForm.year} onValueChange={(v) => setSearchForm(f => ({...f, year: v}))}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Năm" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">Kỳ</Label>
                  <Select value={searchForm.semester} onValueChange={(v) => setSearchForm(f => ({...f, semester: v}))}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Kỳ" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Kỳ I</SelectItem>
                      <SelectItem value="2">Kỳ II</SelectItem>
                      <SelectItem value="3">Kỳ III</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">Tuần</Label>
                  <Input type="number" placeholder="Tuần" value={searchForm.week} onChange={(e) => setSearchForm(f => ({...f, week: e.target.value}))} className="h-9 text-sm" min="1" max="17" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">Ngày</Label>
                  <input type="date" value={searchForm.date} onChange={(e) => setSearchForm(f => ({...f, date: e.target.value}))} className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                </div>
              </div>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 gap-2 w-full md:w-auto text-sm">
                <Search className="w-4 h-4" />
                Tìm kiếm
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant={displayMode === "grid" ? "default" : "outline"} onClick={() => setDisplayMode("grid")} className="text-sm">Lưới</Button>
            <Button variant={displayMode === "table" ? "default" : "outline"} onClick={() => setDisplayMode("table")} className="text-sm">Bảng</Button>
          </div>

          {displayMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduleData.map((item) => (
                <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <Badge className="bg-blue-100 text-blue-700 text-xs">{item.code}</Badge>
                      <Badge className={`${item.status === "ongoing" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"} text-xs`} variant="outline">
                        {item.status === "ongoing" ? "Đang học" : "Sắp tới"}
                      </Badge>
                    </div>
                    <p className="font-bold text-gray-900 text-sm mb-2">{item.subject}</p>
                    <div className="space-y-1.5 text-xs text-gray-600">
                      <p>🧑‍🏫 {item.lecturer}</p>
                      <p>📍 {item.room} ({item.building})</p>
                      <p>📅 {item.day} {item.slot}</p>
                      <p>⏰ {item.time}</p>
                      <p>📚 {item.credits} tín chỉ</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-semibold">Mã môn</TableHead>
                    <TableHead className="text-xs font-semibold">Tên môn</TableHead>
                    <TableHead className="text-xs font-semibold">Giảng viên</TableHead>
                    <TableHead className="text-xs font-semibold">Phòng</TableHead>
                    <TableHead className="text-xs font-semibold">Ngày/Giờ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduleData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell className="text-xs font-bold text-blue-700">{item.code}</TableCell>
                      <TableCell className="text-xs">{item.subject}</TableCell>
                      <TableCell className="text-xs">{item.lecturer}</TableCell>
                      <TableCell className="text-xs">{item.room}</TableCell>
                      <TableCell className="text-xs">{item.day} {item.slot}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Club Booking Request Creation Tab */}
      {activeTab === "club-booking" && (
        <div className="max-w-2xl">
          {clubBookingSubmitted && (
            <div className="flex items-start gap-3 p-4 mb-5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Yêu cầu đặt phòng CLB đã được gửi!</p>
                <p className="text-xs text-green-700 mt-0.5">Mã yêu cầu: CLB-2025-301 · Đang chờ phê duyệt</p>
              </div>
            </div>
          )}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" />
                Yêu cầu đặt phòng (Đại diện CLB)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleClubBookingSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-semibold text-gray-700">Tên CLB <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="VD: CLB Lập trình, CLB Thiết kế..."
                      value={clubBookingForm.clubName}
                      onChange={(e) => setClubBookingForm((f) => ({ ...f, clubName: e.target.value }))}
                      className={`h-9 text-sm ${clubBookingErrors.clubName ? "border-red-400" : ""}`}
                    />
                    {clubBookingErrors.clubName && <p className="text-xs text-red-500">{clubBookingErrors.clubName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">Phòng <span className="text-red-500">*</span></Label>
                    <Select value={clubBookingForm.room} onValueChange={(v) => setClubBookingForm((f) => ({ ...f, room: v }))}>
                      <SelectTrigger className={`h-9 text-sm ${clubBookingErrors.room ? "border-red-400" : ""}`}>
                        <SelectValue placeholder="Chọn phòng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A-201">A-201</SelectItem>
                        <SelectItem value="A-301">A-301</SelectItem>
                        <SelectItem value="D-201">D-201 Hội trường</SelectItem>
                      </SelectContent>
                    </Select>
                    {clubBookingErrors.room && <p className="text-xs text-red-500">{clubBookingErrors.room}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">Ngày <span className="text-red-500">*</span></Label>
                    <input
                      type="date"
                      value={clubBookingForm.date}
                      onChange={(e) => setClubBookingForm((f) => ({ ...f, date: e.target.value }))}
                      className={`w-full h-9 px-3 text-sm border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${clubBookingErrors.date ? "border-red-400" : "border-gray-200"}`}
                    />
                    {clubBookingErrors.date && <p className="text-xs text-red-500">{clubBookingErrors.date}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">Ca học <span className="text-red-500">*</span></Label>
                    <Select value={clubBookingForm.slot} onValueChange={(v) => setClubBookingForm((f) => ({ ...f, slot: v }))}>
                      <SelectTrigger className={`h-9 text-sm ${clubBookingErrors.slot ? "border-red-400" : ""}`}>
                        <SelectValue placeholder="Chọn ca" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tiet1-3">Tiết 1-3</SelectItem>
                        <SelectItem value="tiet4-6">Tiết 4-6</SelectItem>
                        <SelectItem value="tiet7-10">Tiết 7-10</SelectItem>
                      </SelectContent>
                    </Select>
                    {clubBookingErrors.slot && <p className="text-xs text-red-500">{clubBookingErrors.slot}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">Số người</Label>
                    <Input type="number" placeholder="Số" value={clubBookingForm.attendees} onChange={(e) => setClubBookingForm((f) => ({ ...f, attendees: e.target.value }))} className="h-9 text-sm" min="1" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">Mục đích <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="VD: Luyện tập, Hội thảo, Gặp mặt..."
                    value={clubBookingForm.purpose}
                    onChange={(e) => setClubBookingForm((f) => ({ ...f, purpose: e.target.value }))}
                    className={`h-9 text-sm ${clubBookingErrors.purpose ? "border-red-400" : ""}`}
                  />
                  {clubBookingErrors.purpose && <p className="text-xs text-red-500">{clubBookingErrors.purpose}</p>}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-sm" disabled={clubBookingSubmitting}>
                    {clubBookingSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
                  </Button>
                  <Button type="button" variant="outline" className="text-sm" onClick={() => setClubBookingForm({ clubName: "", room: "", date: "", slot: "", purpose: "", attendees: "" })}>Hủy</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Club Booking Status Tab */}
      {activeTab === "club-booking-status" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {myClubBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">Chưa có yêu cầu</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-semibold">Mã YC</TableHead>
                    <TableHead className="text-xs font-semibold">CLB</TableHead>
                    <TableHead className="text-xs font-semibold">Phòng</TableHead>
                    <TableHead className="text-xs font-semibold">Mục đích</TableHead>
                    <TableHead className="text-xs font-semibold">Ngày</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myClubBookings.map((b) => {
                    const cfg = bookingRequestConfig[b.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <TableRow key={b.id} className="hover:bg-gray-50 border-b border-gray-100">
                        <TableCell className="font-mono text-xs font-bold text-blue-700">{b.id}</TableCell>
                        <TableCell className="text-xs">{b.clubName}</TableCell>
                        <TableCell className="text-xs">{b.room}</TableCell>
                        <TableCell className="text-xs">{b.purpose}</TableCell>
                        <TableCell className="text-xs">{b.date}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${cfg.className} gap-1 text-[11px]`}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Maintenance Request Creation Tab */}
      {activeTab === "maintenance-create" && (
        <div className="max-w-2xl">
          {maintenanceSubmitted && (
            <div className="flex items-start gap-3 p-4 mb-5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Yêu cầu sửa chữa đã được gửi!</p>
                <p className="text-xs text-green-700 mt-0.5">Mã: YC-STU-301 · Đang chờ xử lý</p>
              </div>
            </div>
          )}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-orange-500" />
                Yêu cầu sửa chữa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMaintenanceSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">Loại <span className="text-red-500">*</span></Label>
                    <Select value={maintenanceForm.type} onValueChange={(v) => setMaintenanceForm((f) => ({ ...f, type: v }))}>
                      <SelectTrigger className={`h-9 text-sm ${maintenanceErrors.type ? "border-red-400" : ""}`}>
                        <SelectValue placeholder="Chọn" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electrical">Điện</SelectItem>
                        <SelectItem value="plumbing">Nước</SelectItem>
                        <SelectItem value="furniture">Nội thất</SelectItem>
                        <SelectItem value="equipment">Thiết bị</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                    {maintenanceErrors.type && <p className="text-xs text-red-500">{maintenanceErrors.type}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">Ưu tiên</Label>
                    <Select value={maintenanceForm.urgency} onValueChange={(v) => setMaintenanceForm((f) => ({ ...f, urgency: v }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Bình thường</SelectItem>
                        <SelectItem value="urgent">Khẩn cấp</SelectItem>
                        <SelectItem value="emergency">Cấp cứu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-semibold text-gray-700">Vị trí <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="VD: A-201, B-105..."
                      value={maintenanceForm.location}
                      onChange={(e) => setMaintenanceForm((f) => ({ ...f, location: e.target.value }))}
                      className={`h-9 text-sm ${maintenanceErrors.location ? "border-red-400" : ""}`}
                    />
                    {maintenanceErrors.location && <p className="text-xs text-red-500">{maintenanceErrors.location}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">Mô tả <span className="text-red-500">*</span></Label>
                  <textarea
                    placeholder="Mô tả..."
                    value={maintenanceForm.description}
                    onChange={(e) => setMaintenanceForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className={`w-full px-3 py-2 text-sm border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${maintenanceErrors.description ? "border-red-400" : "border-gray-200"}`}
                  />
                  {maintenanceErrors.description && <p className="text-xs text-red-500">{maintenanceErrors.description}</p>}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-sm" disabled={maintenanceSubmitting}>
                    {maintenanceSubmitting ? "Đang gửi..." : "Gửi"}
                  </Button>
                  <Button type="button" variant="outline" className="text-sm" onClick={() => setMaintenanceForm({ type: "", location: "", description: "", urgency: "normal" })}>Hủy</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Maintenance Status Tab */}
      {activeTab === "maintenance-status" && (
        <div className="space-y-4">
          {maintenanceRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200">
              <Wrench className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">Chưa có</p>
            </div>
          ) : (
            maintenanceRequests.map((req) => {
              const typeCfg = maintenanceConfig[req.status];
              const StatusIcon = typeCfg.icon;
              return (
                <Card key={req.id} className="shadow-sm cursor-pointer hover:shadow-md" onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 bg-orange-100 rounded-lg"><Wrench className="w-5 h-5 text-orange-600" /></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold">{req.id}</p>
                            <Badge variant="outline" className="text-xs">{maintenanceTypeLabels[req.type]}</Badge>
                            <Badge className={`${typeCfg.className} gap-1 text-[11px]`}>
                              <StatusIcon className="w-3 h-3" />
                              {typeCfg.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{req.description}</p>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>Vị trí: {req.location}</span>
                            <span>Ngày: {req.date}</span>
                          </div>
                        </div>
                      </div>
                      <Eye className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedRequest.id}</DialogTitle>
              <button onClick={() => setShowDetailModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Loại</p>
                <p className="text-sm text-gray-700">{maintenanceTypeLabels[selectedRequest.type]}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Vị trí</p>
                <p className="text-sm text-gray-700">{selectedRequest.location}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Mô tả</p>
                <p className="text-sm text-gray-700">{selectedRequest.description}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Trạng thái</p>
                <Badge className={`${maintenanceConfig[selectedRequest.status].className} gap-1 text-xs mt-1`}>
                  {maintenanceConfig[selectedRequest.status].label}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Ngày gửi</p>
                <p className="text-sm text-gray-700">{selectedRequest.date}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StudentPage;
