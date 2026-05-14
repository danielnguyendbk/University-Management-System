import { useRef, useState } from "react";
import { toast } from "sonner";
import { downloadScheduleImportTemplate, importTimetable } from "../../../api/adminTimetableApi";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { CheckCircle2, Download, Upload, XCircle } from "lucide-react";

export function AdminScheduleImportTab() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const errors = Array.isArray(importResult?.errors) ? importResult.errors : [];

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".xlsx")) {
      setErrorMessage("Chỉ hỗ trợ file Excel .xlsx");
      toast.error("Chỉ hỗ trợ file Excel .xlsx");
      return;
    }

    setSelectedFile(file);
    setErrorMessage("");
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setErrorMessage("Vui lòng chọn file");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await importTimetable(selectedFile);
      const success = Boolean(response?.success ?? response?.data?.success);
      const message = response?.message ?? response?.data?.message ?? "";

      if (!success && message === "Invalid timetable import template") {
        const templateMessage =
          "File Excel không đúng template. Vui lòng tải lại file mẫu từ hệ thống.";
        setErrorMessage(templateMessage);
        toast.error(templateMessage);
        return;
      }

      const resultData = response?.data ?? response ?? {};
      const totalRows = Number(resultData.totalRows ?? resultData.total ?? 0);
      const successRows = Number(resultData.successRows ?? resultData.successCount ?? 0);
      const failedRows = Number(resultData.failedRows ?? resultData.failureCount ?? 0);
      const errors = Array.isArray(resultData.errors) ? resultData.errors : [];

      setImportResult({
        totalRows,
        successRows,
        failedRows,
        errors,
        message: message || resultData.message || "Import thành công",
      });

      setSelectedFile(null);
      toast.success("Đã gửi yêu cầu import");
    } catch (err) {
      console.error("Import error:", err);
      const message = err?.response?.data?.message || err?.message || "Lỗi import file";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      const blob = await downloadScheduleImportTemplate();

      if (!blob) {
        throw new Error("Không thể tải template.");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "timetable_import_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Tải template thành công");
    } catch (err) {
      console.error("Download template error:", err);
      toast.error("Không thể tải template từ hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Nhập thời khóa biểu từ Excel</h3>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="space-y-3">
              <Upload className="mx-auto h-10 w-10 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {selectedFile ? selectedFile.name : "Chọn hoặc kéo file Excel vào đây"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Chỉ hỗ trợ file Excel .xlsx theo template hệ thống
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
              >
                Chọn file
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleImport}
              disabled={!selectedFile || loading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {loading ? "Đang xử lý..." : "Import"}
            </Button>

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={loading}
            >
              Chọn file khác
            </Button>

            <Button
              onClick={handleDownloadTemplate}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Tải template
            </Button>
          </div>

          {errorMessage && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Import Result Section */}
      {importResult && (
        <Card className="p-6 border-green-200 bg-green-50">
          <div className="flex gap-3 items-start">
            <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Import thành công</h3>
              <div className="space-y-1 text-sm text-green-800 mb-4">
                <p>
                  <strong>Tổng bản ghi:</strong> {importResult.totalRows}
                </p>
                <p>
                  <strong>Thành công:</strong> {importResult.successRows}
                </p>
                <p>
                  <strong>Lỗi:</strong> {importResult.failedRows}
                </p>
              </div>

              {importResult.failedRows > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-red-700 mb-2">Chi tiết lỗi:</p>
                  <div className="bg-white rounded border border-red-200 overflow-x-auto max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-red-50 border-b border-red-200">
                          <th className="px-3 py-2 text-left">rowNumber</th>
                          <th className="px-3 py-2 text-left">semesterCode</th>
                          <th className="px-3 py-2 text-left">sectionCode</th>
                          <th className="px-3 py-2 text-left">error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {errors.length === 0 ? (
                          <tr className="border-b border-gray-200">
                            <td className="px-3 py-2" colSpan={4}>
                              Không có chi tiết lỗi.
                            </td>
                          </tr>
                        ) : (
                          errors.map((item, idx) => (
                          <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-3 py-2">{item.rowNumber ?? item.row ?? idx + 1}</td>
                            <td className="px-3 py-2">{item.semesterCode ?? ""}</td>
                            <td className="px-3 py-2">{item.sectionCode ?? ""}</td>
                            <td className="px-3 py-2 text-red-700">{item.error ?? item.message ?? ""}</td>
                          </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  setImportResult(null);
                  setSelectedFile(null);
                }}
                className="mt-4 bg-green-600 hover:bg-green-700"
              >
                Nhập file mới
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Template Guide */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Hướng dẫn định dạng file</h3>
        <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
          <li>
            <strong>semesterCode:</strong> Mã học kỳ trong database, ví dụ lấy từ semesters.academic_code
          </li>
          <li>
            <strong>sectionCode:</strong> Mã lớp học phần trong database
          </li>
          <li>
            <strong>roomCode:</strong> Mã phòng trong database
          </li>
          <li>
            <strong>lecturerCode:</strong> Mã giảng viên trong database, có thể để trống nếu chưa phân công
          </li>
          <li>
            <strong>dayOfWeek:</strong> MON, TUE, WED, THU, FRI, SAT, SUN
          </li>
          <li>
            <strong>fromWeekNo, toWeekNo:</strong> Tuần bắt đầu và kết thúc, fromWeekNo &lt;= toWeekNo
          </li>
          <li>
            <strong>slotStart, slotEnd:</strong> Slot học bắt đầu/kết thúc, 1..12
          </li>
          <li>
            <strong>startTime, endTime:</strong> HH:mm, ví dụ 07:00, 10:30
          </li>
          <li>
            <strong>sessionType:</strong> THEORY hoặc PRACTICE
          </li>
          <li>
            <strong>practiceGroupNo:</strong> 0 = lý thuyết/không chia nhóm, 1..n = nhóm thực hành
          </li>
          <li>
            <strong>note:</strong> Ghi chú, tùy chọn
          </li>
        </ul>
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          File Excel phải dùng đúng template hệ thống với 14 cột. Các mã semesterCode, sectionCode, roomCode, lecturerCode phải tồn tại trong database.
        </div>
      </Card>
    </div>
  );
}
