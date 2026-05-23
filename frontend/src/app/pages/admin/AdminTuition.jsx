import { useState, useEffect, useRef, useCallback } from "react";
import {
  DollarSign,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  QrCode,
  Settings,
  Banknote,
  FileText,
  User,
  Hash,
  RefreshCw,
} from "lucide-react";
import apiClient from "../../../api/client";

// ─── Helpers ────────────────────────────────────────────────────────────────────
const formatCurrency = (value) => {
  if (value === undefined || value === null) return "0 VND";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const TABS = [
  { id: "config", label: "Cấu hình đơn giá", icon: Settings },
  { id: "cash", label: "Quầy thu tiền mặt", icon: Banknote },
  { id: "logs", label: "Nhật ký giao dịch", icon: FileText },
];

// ─── Main Component ─────────────────────────────────────────────────────────────
export function AdminTuition() {
  const [activeTab, setActiveTab] = useState("config");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white font-semibold text-sm transition-all ${
            toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Quản lý học phí
        </h1>
        <p className="text-gray-500 mt-1">
          Cấu hình đơn giá tín chỉ, thu tiền mặt tại quầy, và tra cứu nhật ký
          giao dịch toàn trường
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1" aria-label="Tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  isActive
                    ? "border-[#1E3A8A] text-[#1E3A8A]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "config" && <TabCreditConfig showToast={showToast} />}
      {activeTab === "cash" && <TabCashCounter showToast={showToast} />}
      {activeTab === "logs" && <TabAuditLogs showToast={showToast} />}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════════
// TAB 1: Cấu hình đơn giá tín chỉ
// ═════════════════════════════════════════════════════════════════════════════════
function TabCreditConfig({ showToast }) {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [pricePerCredit, setPricePerCredit] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    async function fetchSemesters() {
      try {
        setLoading(true);
        const res = await apiClient.get("/admin/timetable/semesters");
        if (res.data && res.data.success) {
          setSemesters(res.data.data || []);
        }
      } catch (err) {
        showToast("Không thể tải danh sách học kỳ.", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchSemesters();
  }, []);

  const validatePrice = (value) => {
    const num = Number(value);
    if (!value || isNaN(num) || num <= 0) {
      setPriceError("Đơn giá phải là số dương.");
      return false;
    }
    if (num % 1000 !== 0) {
      setPriceError("Đơn giá phải là bội số của 1.000đ (VD: 450.000).");
      return false;
    }
    setPriceError("");
    return true;
  };

  const handleSubmitClick = () => {
    if (!selectedSemesterId) {
      showToast("Vui lòng chọn một học kỳ.", "error");
      return;
    }
    if (!validatePrice(pricePerCredit)) return;
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    try {
      setSubmitting(true);
      const newPrice = Number(pricePerCredit);
      await apiClient.put(
        `/admin/tuition/semesters/${selectedSemesterId}/price`,
        { pricePerCredit: newPrice }
      );
      showToast(
        `Đã cập nhật đơn giá tín chỉ thành ${formatCurrency(
          newPrice
        )} thành công!`
      );
      
      // Update local state to show updated price immediately
      setSemesters((prev) =>
        prev.map((s) =>
          String(s.semesterId) === String(selectedSemesterId)
            ? { ...s, price_per_credit: newPrice }
            : s
        )
      );
      setSelectedSemester((prev) =>
        prev ? { ...prev, price_per_credit: newPrice } : null
      );

      setPricePerCredit("");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Lỗi khi cập nhật đơn giá tín chỉ.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-4 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-100 rounded" />
        <div className="h-10 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#1E3A8A]" />
          Thiết lập đơn giá tín chỉ theo học kỳ
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Chọn học kỳ và nhập đơn giá/tín chỉ mới. Thay đổi này sẽ ảnh hưởng
          tới tính toán học phí phát sinh cho tất cả sinh viên trong học kỳ đó.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Semester selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Học kỳ áp dụng <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedSemesterId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedSemesterId(val);
                const found = semesters.find((s) => String(s.semesterId) === String(val));
                setSelectedSemester(found || null);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] bg-white text-gray-900 font-medium"
            >
              <option value="">-- Chọn học kỳ --</option>
              {semesters.map((s) => (
                <option key={s.semesterId} value={s.semesterId}>
                  {s.semesterName} — {s.academicYear || s.semesterYear}
                </option>
              ))}
            </select>
            {selectedSemester && (
              <p
                className={`text-xs mt-2 font-semibold ${
                  selectedSemester.price_per_credit !== null &&
                  selectedSemester.price_per_credit !== undefined
                    ? "text-gray-500"
                    : "text-amber-600"
                }`}
              >
                {selectedSemester.price_per_credit !== null &&
                selectedSemester.price_per_credit !== undefined
                  ? `Đơn giá hiện tại của học kỳ này: ${selectedSemester.price_per_credit.toLocaleString(
                      "vi-VN"
                    )} đ/tín chỉ`
                  : "Học kỳ này chưa được cấu hình đơn giá tín chỉ."}
              </p>
            )}
          </div>

          {/* Price input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Đơn giá mỗi tín chỉ (VND){" "}
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={pricePerCredit}
                onChange={(e) => {
                  setPricePerCredit(e.target.value);
                  if (priceError) validatePrice(e.target.value);
                }}
                placeholder="Ví dụ: 450000"
                min={0}
                step={1000}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-gray-900 font-medium ${
                  priceError
                    ? "border-rose-400 bg-rose-50/50"
                    : "border-gray-300"
                }`}
              />
            </div>
            {priceError && (
              <p className="text-xs text-rose-600 mt-1.5 font-medium">
                {priceError}
              </p>
            )}
            {pricePerCredit && !priceError && Number(pricePerCredit) > 0 && (
              <p className="text-xs text-emerald-600 mt-1.5 font-medium">
                Đơn giá: {formatCurrency(Number(pricePerCredit))} / tín chỉ
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmitClick}
            disabled={submitting || !selectedSemesterId || !pricePerCredit}
            className="px-6 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors font-semibold text-sm shadow-md disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Cập nhật đơn giá tín chỉ
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-5 border border-gray-100">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Xác nhận thay đổi đơn giá
              </h3>
              <p className="text-sm text-gray-600">
                Bạn có chắc chắn muốn cập nhật đơn giá tín chỉ cho học kỳ đã
                chọn thành{" "}
                <strong className="text-[#1E3A8A]">
                  {formatCurrency(Number(pricePerCredit))}
                </strong>{" "}
                / tín chỉ?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 px-4 py-3 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#1E3A8A]/90 font-semibold text-sm"
              >
                Xác nhận cập nhật
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold text-sm text-gray-700"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════════
// TAB 2: Quầy thu tiền mặt
// ═════════════════════════════════════════════════════════════════════════════════
function TabCashCounter({ showToast }) {
  const [studentCode, setStudentCode] = useState("");
  const [debtInfo, setDebtInfo] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [amountPaid, setAmountPaid] = useState("");
  const [note, setNote] = useState("");
  const [amountError, setAmountError] = useState("");
  const [noteError, setNoteError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Ref to trigger audit log reload from parent
  const [cashConfirmCount, setCashConfirmCount] = useState(0);

  const handleSearchStudent = async () => {
    if (!studentCode.trim()) {
      showToast("Vui lòng nhập mã sinh viên.", "error");
      return;
    }
    try {
      setSearching(true);
      setSearchError("");
      setDebtInfo(null);
      setAmountPaid("");
      setNote("");
      setAmountError("");
      setNoteError("");

      const res = await apiClient.get("/admin/tuition/debts", {
        params: { studentCode: studentCode.trim() },
      });
      if (res.data && res.data.success) {
        setDebtInfo(res.data.data);
      } else {
        setSearchError(
          res.data?.message || "Không thể tải thông tin công nợ."
        );
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Mã sinh viên không tồn tại trong hệ thống.";
      setSearchError(msg);
      showToast(msg, "error");
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearchStudent();
  };

  const remainingDebt = debtInfo ? Number(debtInfo.remainingDebt) : 0;

  const validateCashForm = () => {
    let valid = true;
    const amount = Number(amountPaid);
    if (!amountPaid || isNaN(amount) || amount <= 0) {
      setAmountError("Số tiền phải lớn hơn 0.");
      valid = false;
    } else if (amount > remainingDebt) {
      setAmountError(
        `Số tiền thu không được vượt quá số nợ hiện tại (${formatCurrency(
          remainingDebt
        )}).`
      );
      valid = false;
    } else {
      setAmountError("");
    }
    if (!note.trim()) {
      setNoteError("Ghi chú không được bỏ trống (VD: Thu tiền mặt tại quầy).");
      valid = false;
    } else {
      setNoteError("");
    }
    return valid;
  };

  const handleConfirmCash = async () => {
    if (!validateCashForm()) return;
    try {
      setSubmitting(true);
      await apiClient.post("/admin/tuition/payments/cash-confirm", {
        tuitionFeeId: debtInfo.tuitionFeeId,
        studentCode: debtInfo.studentCode,
        amountPaid: Number(amountPaid),
        note: note.trim(),
      });
      showToast(
        `Đã xác nhận thu ${formatCurrency(
          Number(amountPaid)
        )} tiền mặt từ ${debtInfo.fullName} thành công!`
      );
      // Reset form
      setStudentCode("");
      setDebtInfo(null);
      setAmountPaid("");
      setNote("");
      setAmountError("");
      setNoteError("");
      setCashConfirmCount((c) => c + 1);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Lỗi khi xác nhận thu tiền mặt.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Banknote className="w-5 h-5 text-[#1E3A8A]" />
          Quầy xác nhận thu tiền mặt
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Nhập mã sinh viên để tra cứu công nợ, sau đó nhập số tiền thu thực tế
          và ghi chú để hoàn tất xác nhận.
        </p>

        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="Nhập mã sinh viên (VD: B21DCCN001)..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-gray-900 font-medium"
            />
          </div>
          <button
            onClick={handleSearchStudent}
            disabled={searching}
            className="px-6 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors font-semibold text-sm shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Tra cứu
          </button>
        </div>

        {/* Search error */}
        {searchError && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-sm font-medium text-rose-800">{searchError}</p>
          </div>
        )}

        {/* Student debt card */}
        {debtInfo && (
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
            {/* Info header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1E3A8A] rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {debtInfo.fullName}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {debtInfo.studentCode}
                    </span>
                    {debtInfo.cohort && <span>Khóa: {debtInfo.cohort}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Debt details */}
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50/70 rounded-lg p-4 text-center">
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  Tổng phải đóng
                </p>
                <p className="text-lg font-extrabold text-gray-900">
                  {formatCurrency(debtInfo.totalAmount)}
                </p>
              </div>
              <div className="bg-green-50/70 rounded-lg p-4 text-center">
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  Đã thanh toán
                </p>
                <p className="text-lg font-extrabold text-emerald-700">
                  {formatCurrency(debtInfo.paidAmount)}
                </p>
              </div>
              <div
                className={`rounded-lg p-4 text-center ${
                  remainingDebt > 0
                    ? "bg-rose-50/70"
                    : "bg-emerald-50/70"
                }`}
              >
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  Công nợ còn lại
                </p>
                <p
                  className={`text-lg font-extrabold ${
                    remainingDebt > 0 ? "text-rose-700" : "text-emerald-700"
                  }`}
                >
                  {formatCurrency(remainingDebt)}
                </p>
              </div>
            </div>

            {/* Cash payment form — only if student still has debt */}
            {remainingDebt > 0 ? (
              <div className="px-6 py-5 border-t border-gray-200 space-y-4 bg-gray-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Số tiền thu thực tế (VND){" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => {
                        setAmountPaid(e.target.value);
                        if (amountError) {
                          const v = Number(e.target.value);
                          if (v > 0 && v <= remainingDebt)
                            setAmountError("");
                        }
                      }}
                      placeholder="Ví dụ: 5400000"
                      min={0}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-gray-900 font-medium ${
                        amountError
                          ? "border-rose-400 bg-rose-50/50"
                          : "border-gray-300"
                      }`}
                    />
                    {amountError && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">
                        {amountError}
                      </p>
                    )}
                    {amountPaid &&
                      !amountError &&
                      Number(amountPaid) > 0 && (
                        <p className="text-xs text-emerald-600 mt-1 font-medium">
                          Thu: {formatCurrency(Number(amountPaid))}
                        </p>
                      )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Ghi chú / Lý do{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => {
                        setNote(e.target.value);
                        if (noteError && e.target.value.trim())
                          setNoteError("");
                      }}
                      placeholder="VD: Thu tiền mặt tại quầy phòng TC-KT"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-gray-900 font-medium ${
                        noteError
                          ? "border-rose-400 bg-rose-50/50"
                          : "border-gray-300"
                      }`}
                    />
                    {noteError && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">
                        {noteError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleConfirmCash}
                    disabled={submitting}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm shadow-md disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                  >
                    {submitting && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    <CheckCircle2 className="w-4 h-4" />
                    Xác nhận đã thu tiền mặt
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-5 border-t border-gray-200 bg-emerald-50/50">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-sm font-semibold text-emerald-800">
                    Sinh viên này đã thanh toán đầy đủ. Không cần thu thêm.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════════
// TAB 3: Nhật ký giao dịch (Audit Logs)
// ═════════════════════════════════════════════════════════════════════════════════
function TabAuditLogs({ showToast }) {
  const [logs, setLogs] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  const [searchCode, setSearchCode] = useState("");
  const debounceRef = useRef(null);

  const fetchLogs = useCallback(
    async (page, studentCode) => {
      try {
        setLoading(true);
        const params = { page, size: pageSize };
        if (studentCode && studentCode.trim()) {
          params.studentCode = studentCode.trim();
        }
        const res = await apiClient.get("/admin/tuition/history", { params });
        if (res.data && res.data.success) {
          const pageData = res.data.data;
          setLogs(pageData.content || []);
          setTotalPages(pageData.totalPages || 0);
          setTotalElements(pageData.totalElements || 0);
        }
      } catch (err) {
        showToast("Lỗi tải nhật ký giao dịch.", "error");
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  // Initial load
  useEffect(() => {
    fetchLogs(0, "");
  }, [fetchLogs]);

  // Debounced search
  const handleSearchChange = (value) => {
    setSearchCode(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCurrentPage(0);
      fetchLogs(0, value);
    }, 500);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setCurrentPage(newPage);
    fetchLogs(newPage, searchCode);
  };

  const handleRefresh = () => {
    fetchLogs(currentPage, searchCode);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header + Search */}
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1E3A8A]" />
            Nhật ký giao dịch toàn trường
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Hiển thị {logs.length} / {totalElements} giao dịch thành công
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => handleSearchChange(e.target.value.toUpperCase())}
              placeholder="Lọc theo mã SV..."
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-sm text-gray-900 font-medium w-56"
            />
          </div>
          <button
            onClick={handleRefresh}
            className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            title="Tải lại"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table body */}
      {loading ? (
        <div className="p-8 space-y-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="h-8 bg-gray-100 rounded w-full animate-pulse"
            />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-base font-semibold">
            Không tìm thấy giao dịch nào
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Ngày giao dịch
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Mã SV
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Mã giao dịch
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Phương thức
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Xử lý bởi
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Ghi chú
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((payment) => (
                <tr
                  key={payment.paymentId}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {payment.paidAt
                      ? new Date(payment.paidAt).toLocaleString("vi-VN")
                      : "N/A"}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                    {payment.tuitionFee?.student?.studentCode || "—"}
                  </td>
                  <td className="px-5 py-4 text-sm font-mono text-gray-800 whitespace-nowrap">
                    {payment.transactionCode || "N/A"}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#1E3A8A] whitespace-nowrap">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {payment.paymentMethod === "qr" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                        <QrCode className="w-3 h-3" />
                        Cổng QR
                      </span>
                    ) : payment.paymentMethod === "cash" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
                        <CreditCard className="w-3 h-3" />
                        Tiền mặt
                      </span>
                    ) : (
                      <span className="capitalize text-sm">
                        {payment.paymentMethod}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        payment.processedBy === "SYSTEM"
                          ? "bg-violet-50 text-violet-700"
                          : "bg-sky-50 text-sky-700"
                      }`}
                    >
                      {payment.processedBy || "SYSTEM"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                    {payment.note || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/30">
          <p className="text-xs text-gray-500 font-medium">
            Trang {currentPage + 1} / {totalPages} — Tổng {totalElements} bản
            ghi
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {/* Page number buttons */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (currentPage < 3) {
                pageNum = i;
              } else if (currentPage > totalPages - 4) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                    pageNum === currentPage
                      ? "bg-[#1E3A8A] text-white shadow-sm"
                      : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTuition;
