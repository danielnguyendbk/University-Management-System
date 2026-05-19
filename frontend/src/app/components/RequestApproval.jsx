import { useEffect, useMemo, useState } from "react";
import { Check, X, Eye, Calendar, FileText, RefreshCw, AlertCircle, Paperclip, Download } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { API_BASE_URL } from "../../services/app";
import { approveRequest, getPendingRequests, getRequestById, rejectRequest } from "../../services/requestService";

export function RequestApproval() {
  const { user } = useAuth();
  const lecturerId = user?.lecturerId;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadRequests = async () => {
    if (!lecturerId) {
      setError("Không tìm thấy mã giảng viên trong phiên đăng nhập.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await getPendingRequests(lecturerId);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [lecturerId]);

  const pendingCount = requests.length;
  const approvedToday = 0;
  const rejectedToday = 0;
  const monthlyTotal = requests.length;

  const requestTypeLabel = (requestTypeCode, requestTypeName) => requestTypeName || requestTypeCode || "Yêu cầu";

  const resolveAttachmentUrl = (fileUrl) => {
    if (!fileUrl) {
      return "#";
    }

    if (/^https?:\/\//i.test(fileUrl)) {
      return fileUrl;
    }

    return `${API_BASE_URL.replace(/\/api$/, "")}${fileUrl}`;
  };

  const handleOpenDetail = async (requestId) => {
    try {
      const detail = await getRequestById(lecturerId, requestId);
      setSelectedRequest(detail);
    } catch (err) {
      setError(err.message || "Không thể tải chi tiết yêu cầu.");
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setActionLoadingId(requestId);
      await approveRequest(lecturerId, requestId);
      await loadRequests();
      setSelectedRequest(null);
    } catch (err) {
      setError(err.message || "Không thể duyệt yêu cầu.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setActionLoadingId(requestId);
      await rejectRequest(lecturerId, requestId);
      await loadRequests();
      setSelectedRequest(null);
    } catch (err) {
      setError(err.message || "Không thể từ chối yêu cầu.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const selectedAttachmentCount = useMemo(() => selectedRequest?.attachments?.length ?? 0, [selectedRequest]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Duyệt yêu cầu</h1>
        <p className="text-gray-600 mt-1">Xem xét và xử lý yêu cầu của sinh viên</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Yêu cầu chờ duyệt</p>
          <p className="text-3xl font-semibold text-gray-900">3</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Đã duyệt hôm nay</p>
          <p className="text-3xl font-semibold text-green-600">5</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Đã từ chối hôm nay</p>
          <p className="text-3xl font-semibold text-red-600">1</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Tổng trong tháng</p>
          <p className="text-3xl font-semibold text-gray-900">28</p>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Danh sách chờ duyệt</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadRequests}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-gray-600">Đang tải danh sách yêu cầu...</div>
        ) : error ? (
          <div className="p-6 flex items-start gap-3 text-red-800 bg-red-50">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-semibold">Không tải được dữ liệu</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {requests.map((request) => (
            <div key={request.requestId} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      request.requestTypeCode === "leave_request" ? "bg-blue-100" : "bg-purple-100"
                    }`}>
                      {request.requestTypeCode === "leave_request" ? (
                        <Calendar className="w-5 h-5 text-blue-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          request.requestTypeCode === "leave_request" 
                            ? "bg-blue-50 text-blue-700"
                            : "bg-purple-50 text-purple-700"
                        }`}>
                          {requestTypeLabel(request.requestTypeCode, request.requestTypeName)}
                        </span>
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                          Chờ xem xét
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{request.title}</h3>
                    </div>
                  </div>

                  {/* Student Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-13">
                    <div>
                      <p className="text-sm text-gray-500">Sinh viên</p>
                      <p className="font-medium text-gray-900">{request.studentName}</p>
                      <p className="text-sm text-gray-600">MSSV: {request.studentCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Loại đơn</p>
                      <p className="font-medium text-gray-900">{requestTypeLabel(request.requestTypeCode, request.requestTypeName)}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="pl-13">
                    <div className="mb-2">
                      <p className="text-sm text-gray-500">Lý do</p>
                      <p className="text-sm text-gray-900 whitespace-pre-line">{request.content}</p>
                    </div>
                    <p className="text-xs text-gray-500">Đã gửi: {new Date(request.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleApprove(request.requestId)}
                    disabled={actionLoadingId === request.requestId}
                    className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Duyệt
                  </button>
                  <button
                    onClick={() => handleReject(request.requestId)}
                    disabled={actionLoadingId === request.requestId}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Từ chối
                  </button>
                  <button
                    onClick={() => handleOpenDetail(request.requestId)}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Recent Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{selectedRequest?.title || "Hoạt động gần đây"}</p>
              <p className="text-sm text-gray-600">{selectedRequest?.studentName || "Chưa chọn đơn"}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{selectedRequest ? new Date(selectedRequest.createdAt).toLocaleString("vi-VN") : ""}</span>
              <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                Đã duyệt
              </span>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{selectedRequest?.requestTypeName || "Phúc khảo điểm"}</p>
              <p className="text-sm text-gray-600">{selectedRequest?.requestTypeCode || "recheck_grade"}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{selectedRequest ? new Date(selectedRequest.createdAt).toLocaleString("vi-VN") : ""}</span>
              <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                Đã duyệt
              </span>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{selectedRequest?.title || "Đơn gần đây"}</p>
              <p className="text-sm text-gray-600">{selectedRequest?.studentCode || ""}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{selectedRequest ? new Date(selectedRequest.createdAt).toLocaleString("vi-VN") : ""}</span>
              <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                Từ chối
              </span>
            </div>
          </div>
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Chi tiết yêu cầu</h3>
                <p className="text-sm text-gray-500">{selectedRequest.studentName} • {selectedRequest.studentCode}</p>
              </div>
              <button type="button" onClick={() => setSelectedRequest(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 p-6 text-sm text-gray-700">
              <div>
                <p className="text-gray-500">Loại đơn</p>
                <p className="font-medium">{selectedRequest.requestTypeName}</p>
              </div>
              <div>
                <p className="text-gray-500">Tiêu đề</p>
                <p className="font-medium">{selectedRequest.title}</p>
              </div>
              <div>
                <p className="text-gray-500">Nội dung</p>
                <p className="whitespace-pre-line">{selectedRequest.content}</p>
              </div>
              <div>
                <p className="text-gray-500 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Tệp đính kèm ({selectedAttachmentCount})
                </p>
                {selectedAttachmentCount > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {selectedRequest.attachments.map((attachment) => (
                      <li key={attachment.attachmentId} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{attachment.fileName}</p>
                          <p className="truncate text-xs text-gray-500">{attachment.fileUrl}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={resolveAttachmentUrl(attachment.fileUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Mở
                          </a>
                          <a
                            href={resolveAttachmentUrl(attachment.fileUrl)}
                            download={attachment.fileName || "attachment"}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Tải xuống
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-gray-500">Không có tệp đính kèm.</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6">
              <button
                type="button"
                onClick={() => handleReject(selectedRequest.requestId)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                <X className="w-4 h-4" />
                Từ chối
              </button>
              <button
                type="button"
                onClick={() => handleApprove(selectedRequest.requestId)}
                className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
              >
                <Check className="w-4 h-4" />
                Duyệt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
