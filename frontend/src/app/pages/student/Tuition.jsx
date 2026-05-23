import { useState, useEffect, useRef } from "react";
import { CreditCard, Download, CheckCircle2, AlertCircle, QrCode, Loader2 } from "lucide-react";
import apiClient from "../../../api/client";
import Swal from "sweetalert2"; // <-- 1. Đã import SweetAlert2 vào đây để làm popup xịn

export function Tuition() {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [currentTuition, setCurrentTuition] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");

  // QR Modal and Polling states
  const [showQR, setShowQR] = useState(false);
  const [activePayment, setActivePayment] = useState(null);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const pollingIntervalRef = useRef(null);
  const pollingTimeoutRef = useRef(null);

  // Downloading receipts states
  const [downloadingIds, setDownloadingIds] = useState(new Set());

  // Toast notifications (Giữ lại phòng trường hợp các lỗi hệ thống nhỏ khác cần báo nhanh)
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "0 VND";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // 1. Fetch semesters on mount
  useEffect(() => {
    async function loadSemesters() {
      try {
        setLoading(true);
        const res = await apiClient.get("/student/registration/semesters");
        if (res.data && res.data.success) {
          const sems = res.data.data || [];
          setSemesters(sems);
          if (sems.length > 0) {
            setSelectedSemesterId(sems[0].semesterId);
          }
        } else {
          setError(res.data?.message || "Không thể tải danh sách học kỳ");
        }
      } catch (err) {
        console.error("Fetch semesters error:", err);
        setError("Lỗi kết nối máy chủ khi lấy danh sách học kỳ.");
      } finally {
        setLoading(false);
      }
    }
    loadSemesters();
    loadPaymentHistory();
  }, []);

  // 2. Fetch current tuition fee whenever selected semester changes
  useEffect(() => {
    if (!selectedSemesterId) return;

    async function loadCurrentTuition() {
      try {
        setLoading(true);
        setError("");
        const res = await apiClient.get(`/student/tuition/current?semesterId=${selectedSemesterId}`);
        if (res.data && res.data.success) {
          setCurrentTuition(res.data.data);
        } else {
          setCurrentTuition(null);
          setError(res.data?.message || "Không tìm thấy thông tin công nợ");
        }
      } catch (err) {
        console.error("Fetch tuition error:", err);
        setCurrentTuition(null);
        setError(err.response?.data?.message || "Lỗi tải thông tin công nợ.");
      } finally {
        setLoading(false);
      }
    }

    loadCurrentTuition();
  }, [selectedSemesterId]);

  // 3. Fetch payment history
  const loadPaymentHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await apiClient.get("/student/tuition/history");
      if (res.data && res.data.success) {
        setHistory(res.data.data || []);
      }
    } catch (err) {
      console.error("Fetch history error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // 4. Handle "Thanh toán ngay" click -> create pending payment and launch QR
  const handlePaymentInitiate = async () => {
    if (!currentTuition) return;
    try {
      setCreatingPayment(true);
      const res = await apiClient.post("/student/tuition/payments", {
        tuitionFeeId: currentTuition.tuitionFeeId,
      });
      if (res.data && res.data.success) {
        const payment = res.data.data;
        setActivePayment(payment);
        setShowQR(true);
        startPolling(payment.paymentId);
      } else {
        showToast(res.data?.message || "Không thể khởi tạo thanh toán", "error");
      }
    } catch (err) {
      console.error("Create payment error:", err);
      showToast(err.response?.data?.message || "Lỗi khởi tạo thanh toán. Vui lòng thử lại.", "error");
    } finally {
      setCreatingPayment(false);
    }
  };

  // 5. Polling details
  const startPolling = (paymentId) => {
    stopPolling();

    // Poll every 3 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await apiClient.get(`/student/tuition/payments/${paymentId}`);
        if (res.data && res.data.success) {
          const payment = res.data.data;
          if (payment.paymentStatus === "success") {
            handlePaymentSuccess();
          }
        }
      } catch (err) {
        console.error("Polling check error:", err);
      }
    }, 3000);

    // Timeout after 10 minutes (600,000 ms)
    pollingTimeoutRef.current = setTimeout(() => {
      stopPolling();
      setShowQR(false);
      setActivePayment(null);

      // Dùng luôn Swal báo hết giờ cho đồng bộ giao diện xịn sò
      Swal.fire({
        title: "Hết thời gian chờ!",
        text: "Giao dịch đã hết hạn. Vui lòng bấm thanh toán lại nếu muốn chuyển khoản.",
        icon: "warning",
        confirmButtonColor: "#1E3A8A"
      });
    }, 600000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  };

  // SỬA ĐOẠN NÀY: Xử lý đóng modal QR ngay lập tức và nổ hiệu ứng thành công của SweetAlert2
  const handlePaymentSuccess = () => {
    stopPolling();
    setShowQR(false); // Đóng modal quét mã lập tức để nhường chỗ cho Swal nổ ra
    setActivePayment(null);

    // BẮN POPUP SWEETALERT2 THẦN THÁNH LÊN MÀN HÌNH
    Swal.fire({
      title: "Thanh toán thành công!",
      text: "Hệ thống Học viện đã ghi nhận khoản nộp học phí của bạn qua cổng tự động SePay.",
      icon: "success",
      background: "#ffffff",
      confirmButtonColor: "#1E3A8A",
      confirmButtonText: "Tuyệt vời",
      timer: 4500, // Tự động biến mất sau 4.5 giây
      timerProgressBar: true
    });

    // Refresh dữ liệu công nợ tầng background ngay lập tức
    if (selectedSemesterId) {
      apiClient.get(`/student/tuition/current?semesterId=${selectedSemesterId}`)
        .then(res => {
          if (res.data && res.data.success) {
            setCurrentTuition(res.data.data);
          }
        }).catch(err => console.error(err));
    }
    loadPaymentHistory();
  };

  // ĐÃ XOÁ HÀM checkPaymentManually ĐỂ BỎ NÚT KIỂM TRA THỦ CÔNG

  const handleCancelPayment = () => {
    stopPolling();
    setShowQR(false);
    setActivePayment(null);
    showToast("Đã hủy quá trình thanh toán QR.", "error");
  };

  // 6. Download Receipt PDF
  const handleDownloadReceipt = async (paymentId) => {
    if (downloadingIds.has(paymentId)) return;
    try {
      setDownloadingIds((prev) => new Set(prev).add(paymentId));
      const response = await apiClient.get(`/student/tuition/receipt/${paymentId}/export`, {
        responseType: "blob",
      });

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers["content-disposition"] || response.headers["Content-Disposition"];
      let fileName = `receipt_${paymentId}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          fileName = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("Tải biên lai học phí thành công!");
    } catch (err) {
      console.error("Receipt download error:", err);
      showToast("Không thể tải biên lai thanh toán. Vui lòng thử lại sau.", "error");
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(paymentId);
        return next;
      });
    }
  };

  const remainingDebt = currentTuition
    ? Math.max(0, currentTuition.finalAmount - currentTuition.paidAmount)
    : 0;

  const isOverdue = currentTuition && currentTuition.dueDate && new Date(currentTuition.dueDate) < new Date() && remainingDebt > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast popup */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all transform translate-y-0 ${toast.type === "error" ? "bg-rose-600 animate-pulse" : "bg-emerald-600"
          }`}>
          {toast.message}
        </div>
      )}

      {/* Header & Semester Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Học phí & Thanh toán</h1>
          <p className="text-gray-600 mt-1">Quản lý các khoản học phí và lịch sử thanh toán</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Chọn học kỳ:</label>
          <select
            value={selectedSemesterId}
            onChange={(e) => setSelectedSemesterId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] bg-white text-gray-900 font-medium"
            disabled={loading}
          >
            {semesters.map((s) => (
              <option key={s.semesterId} value={s.semesterId}>
                {s.semesterName} - {s.academicYear}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-6 animate-pulse">
          <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-900 mb-1">Không có thông tin học phí</h3>
          <p className="text-sm text-red-700 mb-4">{error}</p>
        </div>
      ) : currentTuition ? (
        <>
          {/* Current Balance Box */}
          <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563eb] rounded-xl shadow-lg p-8 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 transform translate-x-12 -translate-y-12 opacity-10">
              <QrCode className="w-96 h-96" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div>
                <p className="text-blue-100 mb-2 font-medium">Số dư công nợ học kỳ</p>
                <p className="text-5xl font-extrabold mb-5 tracking-tight">
                  {formatCurrency(remainingDebt)}
                </p>

                <div className="space-y-2 text-sm border-t border-white/20 pt-4">
                  <div className="flex justify-between">
                    <span className="text-blue-100">Tổng học phí phát sinh:</span>
                    <span className="font-semibold">{formatCurrency(currentTuition.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Miễn giảm trừ:</span>
                    <span className="font-semibold">{formatCurrency(currentTuition.discountAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100 font-semibold">Phải đóng (Sau giảm):</span>
                    <span className="font-bold text-white text-base">{formatCurrency(currentTuition.finalAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-blue-100">Đã thanh toán:</span>
                    <span className="font-semibold text-green-300">{formatCurrency(currentTuition.paidAmount)}</span>
                  </div>
                </div>

                {isOverdue && (
                  <div className="mt-6 p-4 bg-rose-500/20 border border-rose-300/30 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm text-rose-200">Đã quá hạn thanh toán</p>
                      <p className="text-xs text-blue-100">Hạn chót: {new Date(currentTuition.dueDate).toLocaleDateString("vi-VN")}</p>
                    </div>
                  </div>
                )}
                {!isOverdue && currentTuition.dueDate && remainingDebt > 0 && (
                  <div className="mt-6 p-3 bg-blue-600/30 border border-blue-400/30 rounded-lg flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-blue-300" />
                    <span>Hạn nộp: {new Date(currentTuition.dueDate).toLocaleDateString("vi-VN")}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center">
                {currentTuition.status === "paid" ? (
                  <div className="text-center bg-white/15 backdrop-blur-md border border-white/20 p-6 rounded-xl space-y-3 max-w-sm">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                    <p className="font-bold text-lg text-white">Nghĩa vụ hoàn thành</p>
                    <p className="text-sm text-blue-100">Bạn đã hoàn thành đầy đủ nghĩa vụ học phí cho học kỳ này.</p>
                  </div>
                ) : (
                  <button
                    onClick={handlePaymentInitiate}
                    disabled={creatingPayment}
                    className="px-8 py-4 bg-white text-[#1E3A8A] rounded-xl hover:bg-blue-50 hover:scale-[1.02] transition-all font-bold text-lg shadow-xl flex items-center gap-2 border border-transparent disabled:opacity-70 disabled:pointer-events-none"
                  >
                    {creatingPayment && <Loader2 className="w-5 h-5 animate-spin" />}
                    Thanh toán ngay
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Payment form block */}
          {currentTuition.status !== "paid" ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#1E3A8A]" />
                Phương thức thanh toán khả dụng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handlePaymentInitiate}
                  className="p-5 border-2 border-[#1E3A8A] bg-blue-50/50 rounded-xl hover:bg-blue-50 hover:border-blue-600 transition-all text-left group"
                >
                  <QrCode className="w-8 h-8 text-[#1E3A8A] mb-2 group-hover:scale-105 transition-transform" />
                  <p className="font-semibold text-gray-900">Quét mã QR VietQR</p>
                  <p className="text-xs text-gray-600 mt-1">Cổng SePay xử lý tự động & ghi nhận giao dịch trong 3 giây.</p>
                </button>

                <div className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 text-left">
                  <CreditCard className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="font-semibold text-gray-500">Chuyển khoản ngân hàng</p>
                  <p className="text-xs text-gray-500 mt-1">Nhận hướng dẫn thông tin chuyển khoản chính thức của Học viện.</p>
                </div>

                <div className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 text-left">
                  <Download className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="font-semibold text-gray-500">Thu tiền mặt tại quầy</p>
                  <p className="text-xs text-gray-500 mt-1">Đến trực tiếp phòng Tài chính - Kế toán để thực hiện nộp tiền mặt.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h3 className="font-bold text-emerald-950">Thông báo từ Phòng Tài chính</h3>
                <p className="text-sm text-emerald-800">
                  Hệ thống xác nhận sinh viên đã hoàn thành nghĩa vụ học phí đối với <strong>{currentTuition.semesterName || "Học kỳ"}</strong>. Cảm ơn bạn!
                </p>
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* Real-time Payment Modal (QR Code) */}
      {showQR && activePayment && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6 text-[#1E3A8A]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">Quét mã để thanh toán</h2>
              <p className="text-gray-500 text-xs px-4">
                Sử dụng ứng dụng ngân hàng di động (Mobile Banking) để quét mã QR bên dưới
              </p>
            </div>

            {/* Live QR Image */}
            <div className="w-60 h-60 mx-auto bg-white rounded-xl flex items-center justify-center p-2 border border-gray-200 shadow-inner relative group">
              <img
                src={activePayment.qrImageUrl}
                alt="Payment QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Transaction specs */}
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2.5 text-sm border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Số tiền:</span>
                <span className="font-bold text-[#1E3A8A]">{formatCurrency(activePayment.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Mã giao dịch / Nội dung:</span>
                <span className="font-mono font-bold text-gray-900 text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                  {activePayment.orderCode}
                </span>
              </div>
              <div className="text-center pt-2 border-t border-gray-200/60 flex items-center justify-center gap-1.5 text-xs text-amber-600 font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Đang chờ hệ thống đồng bộ hóa...
              </div>
            </div>

            {/* Nút Huỷ Giao Dịch */}
            <div className="pt-2">
              <button
                onClick={handleCancelPayment}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all text-sm"
              >
                Hủy giao dịch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Block */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Lịch sử thanh toán học phí</h2>
          <span className="text-xs bg-[#1E3A8A]/10 text-[#1E3A8A] px-2.5 py-1 rounded-full font-bold">
            {history.length} Giao dịch thành công
          </span>
        </div>

        {historyLoading ? (
          <div className="p-8 space-y-4">
            <div className="h-6 bg-gray-100 rounded w-full animate-pulse"></div>
            <div className="h-6 bg-gray-100 rounded w-full animate-pulse"></div>
            <div className="h-6 bg-gray-100 rounded w-full animate-pulse"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-base font-semibold">Không tìm thấy lịch sử giao dịch nào</p>
            <p className="text-xs text-gray-400 mt-1">Các giao dịch thành công sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-700 uppercase tracking-wider">Ngày giao dịch</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-700 uppercase tracking-wider">Mã giao dịch</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-700 uppercase tracking-wider">Số tiền</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-700 uppercase tracking-wider">Phương thức</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-700 uppercase tracking-wider text-center">Hóa đơn biên lai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((payment) => (
                  <tr key={payment.paymentId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleString("vi-VN") : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 font-mono">
                      {payment.transactionCode || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#1E3A8A]">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payment.paymentMethod === "qr" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                          <QrCode className="w-3 h-3" /> Cổng QR
                        </span>
                      ) : payment.paymentMethod === "cash" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
                          <CreditCard className="w-3 h-3" /> Tiền mặt
                        </span>
                      ) : (
                        <span className="capitalize">{payment.paymentMethod}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Thành công
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleDownloadReceipt(payment.paymentId)}
                        disabled={downloadingIds.has(payment.paymentId)}
                        className="inline-flex items-center gap-1 text-[#1E3A8A] hover:text-[#1E3A8A]/80 text-sm font-bold hover:underline disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {downloadingIds.has(payment.paymentId) ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#1E3A8A]" />
                        ) : (
                          <Download className="w-4 h-4 text-[#1E3A8A]" />
                        )}
                        Tải biên lai
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tuition;