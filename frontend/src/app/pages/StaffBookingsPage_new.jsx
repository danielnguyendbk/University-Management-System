import { useState } from "react";
import { Plus, CheckCircle, Clock, XCircle, Eye, AlertCircle, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

const initialBookingList = [
  { id: "DPK-2025-001", room: "A-301", purpose: "Thi cuối kỳ — CS101", date: "20/04/2025", slot: "Tiết 1-4", requester: "Trần Thị Thanh Hoa", created: "10/04/2025", status: "approved" },
  { id: "DPK-2025-002", room: "C-201", purpose: "Hội thảo khoa học CNTT", date: "25/04/2025", slot: "Tiết 7-10", requester: "Trần Thị Thanh Hoa", created: "11/04/2025", status: "pending" },
  { id: "DPK-2025-003", room: "B-105", purpose: "Bảo vệ đồ án tốt nghiệp", date: "28/04/2025", slot: "Tiết 1-6", requester: "Trần Thị Thanh Hoa", created: "09/04/2025", status: "approved" },
  { id: "DPK-2025-004", room: "D-102", purpose: "Kiểm tra giữa kỳ — SE302", date: "15/04/2025", slot: "Tiết 4-6", requester: "Trần Thị Thanh Hoa", created: "08/04/2025", status: "rejected" },
  { id: "DPK-2025-005", room: "A-201", purpose: "Học bù — MATH201", date: "22/04/2025", slot: "Tiết 1-3", requester: "Trần Thị Thanh Hoa", created: "11/04/2025", status: "pending" }
];

const statusConfig = {
  approved: { label: "Đã duyệt", className: "bg-green-100 text-green-700", icon: CheckCircle },
  pending: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-700", icon: Clock },
  rejected: { label: "Từ chối", className: "bg-red-100 text-red-700", icon: XCircle }
};

const StaffBookingsPage = () => {
  const [activeTab, setActiveTab] = useState("new");
  const [form, setForm] = useState({ room: "", date: "", slot: "", purpose: "", notes: "", attendees: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookings, setBookings] = useState(initialBookingList);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.room) errs.room = "Vui lòng chọn phòng";
    if (!form.date) errs.date = "Vui lòng chọn ngày";
    if (!form.slot) errs.slot = "Vui lòng chọn ca học";
    if (!form.purpose.trim()) errs.purpose = "Vui lòng nhập mục đích sử dụng";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setForm({ room: "", date: "", slot: "", purpose: "", notes: "", attendees: "" });
    }, 1200);
  };

  const handleApprove = (bookingId) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "approved" } : b));
    setShowDetailModal(false);
    setSelectedBooking(null);
  };

  const handleReject = (bookingId) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "rejected" } : b));
    setShowDetailModal(false);
    setSelectedBooking(null);
  };

  const viewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const pendingBookings = bookings.filter(b => b.status === "pending");

  return (
    <div className="p-5 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Đặt phòng</h1>
          <p className="text-sm text-gray-500 mt-0.5">Đặt phòng khẩn cấp và quản lý danh sách đặt phòng</p>
        </div>
        <Button
          onClick={() => {
            setActiveTab("new");
            setSubmitted(false);
          }}
          className="bg-blue-600 hover:bg-blue-700 gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Đặt phòng mới
        </Button>
      </div>

      <div className="flex border-b border-gray-200">
        {[
          { key: "new", label: "Tạo yêu cầu đặt phòng" },
          { key: "list", label: `Danh sách đặt phòng (${bookings.length})` },
          { key: "approve", label: `Duyệt yêu cầu (${pendingBookings.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Create New Booking */}
      {activeTab === "new" && (
        <div className="max-w-2xl">
          {submitted && (
            <div className="flex items-start gap-3 p-4 mb-5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Yêu cầu đặt phòng đã được gửi!</p>
                <p className="text-xs text-green-700 mt-0.5">Mã yêu cầu: DPK-2025-006 · Đang chờ phê duyệt từ Ban Quản trị</p>
              </div>
            </div>
          )}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Mẫu đặt phòng khẩn cấp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">
                      Phòng học <span className="text-red-500">*</span>
                    </Label>
                    <Select value={form.room} onValueChange={(v) => setForm((f) => ({ ...f, room: v }))}>
                      <SelectTrigger className={`h-9 text-sm ${errors.room ? "border-red-400" : ""}`}>
                        <SelectValue placeholder="Chọn phòng học" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A-201">A-201 (SC: 45)</SelectItem>
                        <SelectItem value="A-301">A-301 (SC: 50)</SelectItem>
                        <SelectItem value="B-105">B-105 (SC: 65)</SelectItem>
                        <SelectItem value="B-302">B-302 Phòng máy (SC: 30)</SelectItem>
                        <SelectItem value="C-102">C-102 (SC: 60)</SelectItem>
                        <SelectItem value="D-201">D-201 Hội trường (SC: 100)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.room && <p className="text-xs text-red-500">{errors.room}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">
                      Ngày sử dụng <span className="text-red-500">*</span>
                    </Label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className={`w-full h-9 px-3 text-sm border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.date ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                    {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">
                      Ca học <span className="text-red-500">*</span>
                    </Label>
                    <Select value={form.slot} onValueChange={(v) => setForm((f) => ({ ...f, slot: v }))}>
                      <SelectTrigger className={`h-9 text-sm ${errors.slot ? "border-red-400" : ""}`}>
                        <SelectValue placeholder="Chọn ca học" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tiet1-3">Tiết 1-3 (07:00 - 09:30)</SelectItem>
                        <SelectItem value="tiet4-6">Tiết 4-6 (09:45 - 12:15)</SelectItem>
                        <SelectItem value="tiet7-9">Tiết 7-9 (13:00 - 15:30)</SelectItem>
                        <SelectItem value="tiet10-12">Tiết 10-12 (15:45 - 18:15)</SelectItem>
                        <SelectItem value="tiet1-6">Tiết 1-6 (cả buổi sáng)</SelectItem>
                        <SelectItem value="tiet7-12">Tiết 7-12 (cả buổi chiều)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.slot && <p className="text-xs text-red-500">{errors.slot}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">Số người tham dự</Label>
                    <Input
                      type="number"
                      placeholder="Nhập số lượng"
                      value={form.attendees}
                      onChange={(e) => setForm((f) => ({ ...f, attendees: e.target.value }))}
                      className="h-9 text-sm"
                      min="1"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">
                    Mục đích sử dụng <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="VD: Thi cuối kỳ, Hội thảo, Hợp họi đồng..."
                    value={form.purpose}
                    onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                    className={`h-9 text-sm ${errors.purpose ? "border-red-400" : ""}`}
                  />
                  {errors.purpose && <p className="text-xs text-red-500">{errors.purpose}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">Ghi chú thêm</Label>
                  <textarea
                    placeholder="Yêu cầu đặc biệt (máy chiếu, điều hòa, bố trí bàn ghế...)"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-sm gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      "Gửi yêu cầu đặt phòng"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-sm"
                    onClick={() => setForm({ room: "", date: "", slot: "", purpose: "", notes: "", attendees: "" })}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB: Booking List */}
      {activeTab === "list" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">Chưa có yêu cầu đặt phòng</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-semibold text-gray-600">Mã yêu cầu</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600">Phòng</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600">Mục đích</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600">Ngày sử dụng</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600">Ca học</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600">Ngày tạo</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 text-center">Trạng thái</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => {
                    const cfg = statusConfig[b.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <TableRow key={b.id} className="hover:bg-gray-50 border-b border-gray-100">
                        <TableCell className="font-mono text-xs font-bold text-blue-700">{b.id}</TableCell>
                        <TableCell className="text-xs font-semibold text-gray-900">{b.room}</TableCell>
                        <TableCell className="text-xs text-gray-700 max-w-[200px]">
                          <div className="truncate" title={b.purpose}>{b.purpose}</div>
                        </TableCell>
                        <TableCell className="text-xs text-gray-700 whitespace-nowrap">{b.date}</TableCell>
                        <TableCell className="text-xs text-gray-600">{b.slot}</TableCell>
                        <TableCell className="text-xs text-gray-500">{b.created}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${cfg.className} gap-1 text-[11px]`}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => viewDetails(b)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 mx-auto"
                          >
                            <Eye className="w-3 h-3" />
                            Xem
                          </button>
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

      {/* TAB: Approve Requests */}
      {activeTab === "approve" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {pendingBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">Không có yêu cầu chờ duyệt</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-semibold text-gray-600">Mã yêu cầu</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600">Yêu cầu từ</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600">Phòng</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600">Mục đích</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600">Ngày sử dụng</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingBookings.map((b) => (
                    <TableRow key={b.id} className="hover:bg-gray-50 border-b border-gray-100">
                      <TableCell className="font-mono text-xs font-bold text-blue-700">{b.id}</TableCell>
                      <TableCell className="text-xs text-gray-700">{b.requester}</TableCell>
                      <TableCell className="text-xs font-semibold text-gray-900">{b.room}</TableCell>
                      <TableCell className="text-xs text-gray-700">{b.purpose}</TableCell>
                      <TableCell className="text-xs text-gray-700 whitespace-nowrap">{b.date}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(b.id)}
                            className="h-7 px-3 bg-green-600 hover:bg-green-700 text-xs"
                          >
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReject(b.id)}
                            variant="destructive"
                            className="h-7 px-3 text-xs"
                          >
                            Từ chối
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Chi tiết yêu cầu <span className="text-blue-600">{selectedBooking.id}</span>
              </DialogTitle>
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Phòng</p>
                <p className="text-sm font-bold text-gray-900">{selectedBooking.room}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Mục đích</p>
                <p className="text-sm text-gray-700">{selectedBooking.purpose}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Ngày sử dụng</p>
                <p className="text-sm text-gray-700">{selectedBooking.date}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Ca học</p>
                <p className="text-sm text-gray-700">{selectedBooking.slot}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Yêu cầu từ</p>
                <p className="text-sm text-gray-700">{selectedBooking.requester}</p>
              </div>
            </div>
            {activeTab === "approve" && selectedBooking.status === "pending" && (
              <div className="flex gap-2 pt-3 border-t">
                <Button
                  onClick={() => handleApprove(selectedBooking.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-sm"
                >
                  Phê duyệt
                </Button>
                <Button
                  onClick={() => handleReject(selectedBooking.id)}
                  variant="destructive"
                  className="flex-1 text-sm"
                >
                  Từ chối
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StaffBookingsPage;
