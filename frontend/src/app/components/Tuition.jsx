import { useState } from "react";
import { CreditCard, Download, CheckCircle2, AlertCircle, QrCode } from "lucide-react";

const paymentHistory = [
  {
    id: 1,
    semester: "Học kỳ Thu 2025",
    amount: 4500,
    paidDate: "2025-09-15",
    status: "paid",
    invoice: "INV-2025-001"
  },
  {
    id: 2,
    semester: "Học kỳ Hè 2025",
    amount: 3000,
    paidDate: "2025-05-20",
    status: "paid",
    invoice: "INV-2025-002"
  },
  {
    id: 3,
    semester: "Học kỳ Xuân 2025",
    amount: 4500,
    paidDate: "2025-01-18",
    status: "paid",
    invoice: "INV-2025-003"
  },
];

export function Tuition() {
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Tuition & Payment</h1>
        <p className="text-gray-600 mt-1">Quản lý học phí và lịch sử thanh toán</p>
      </div>

      {/* Current Balance */}
      <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563eb] rounded-lg shadow-lg p-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-blue-100 mb-2">Số dư hiện tại</p>
            <p className="text-5xl font-bold mb-4">$4,500.00</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-100">Học phí - Học kỳ Xuân 2026</span>
                <span className="font-semibold">$4,200.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-100">Phí thực hành</span>
                <span className="font-semibold">$200.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-100">Phí hoạt động</span>
                <span className="font-semibold">$100.00</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-red-500/20 border border-red-300/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm">Thanh toán quá hạn</p>
                <p className="text-xs text-blue-100">Hạn thanh toán: 25/03/2026</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={() => setShowQR(!showQR)}
              className="px-8 py-4 bg-white text-[#1E3A8A] rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg shadow-lg"
            >
              Thanh toán ngay
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Payment */}
      {showQR && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="max-w-md mx-auto text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-6 h-6 text-[#1E3A8A]" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Quét mã để thanh toán</h2>
            <p className="text-gray-600 text-sm mb-6">
              Quét mã QR bên dưới bằng ứng dụng ngân hàng để hoàn tất thanh toán
            </p>
            
            {/* Mock QR Code */}
            <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-6 border-2 border-gray-200">
              <div className="text-center">
                <QrCode className="w-32 h-32 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Mã QR</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <p className="text-gray-600">Số tiền</p>
                  <p className="font-semibold text-gray-900">$4,500.00</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-600">Mã tham chiếu</p>
                  <p className="font-semibold text-gray-900">PAY-2026-001</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors font-medium">
                Tôi đã thanh toán xong
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Phương thức thanh toán</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-[#1E3A8A] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <QrCode className="w-8 h-8 text-[#1E3A8A] mb-2" />
            <p className="font-semibold text-gray-900">Mã QR</p>
            <p className="text-sm text-gray-600">Quét và thanh toán</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <CreditCard className="w-8 h-8 text-gray-600 mb-2" />
            <p className="font-semibold text-gray-900">Chuyển khoản ngân hàng</p>
            <p className="text-sm text-gray-600">Chuyển khoản trực tiếp</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-8 h-8 text-gray-600 mb-2" />
            <p className="font-semibold text-gray-900">Tiền mặt/Séc</p>
            <p className="text-sm text-gray-600">Tại phòng tài vụ</p>
          </button>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lịch sử thanh toán</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Học kỳ
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ngày thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Hóa đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paymentHistory.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{payment.semester}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">
                      ${payment.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600">{payment.paidDate}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã thanh toán
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600 font-mono text-sm">{payment.invoice}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-[#1E3A8A] hover:underline text-sm font-medium flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      Tải xuống
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Tổng đã thanh toán (2025)</p>
          <p className="text-2xl font-semibold text-gray-900">$12,000</p>
          <p className="text-sm text-green-600 mt-1">3 lần thanh toán</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Công nợ còn lại</p>
          <p className="text-2xl font-semibold text-gray-900">$4,500</p>
          <p className="text-sm text-red-600 mt-1">Đã quá hạn thanh toán</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Kỳ hạn tiếp theo</p>
          <p className="text-2xl font-semibold text-gray-900">25/03</p>
          <p className="text-sm text-gray-600 mt-1">Học kỳ Xuân 2026</p>
        </div>
      </div>
    </div>
  );
}
