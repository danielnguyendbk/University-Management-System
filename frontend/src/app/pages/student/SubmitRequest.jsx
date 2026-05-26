import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Calendar, CheckCircle2, FileText, RefreshCw, Send } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { getStudentGrades } from "../../../services/gradeService";
import { getStudentRequests, submitStudentRequest } from "../../../services/requestService";

export function SubmitRequest() {
  const { user } = useAuth();
  const studentId = user?.studentId ?? user?.studentProfile?.studentId;
  const [requestType, setRequestType] = useState("leave_request");
  const [requests, setRequests] = useState([]);
  const [gradeData, setGradeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gradeLoading, setGradeLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    requestDate: "",
    sectionId: "",
    sectionCode: "",
    courseCode: "",
    courseName: "",
  });

  const loadRequests = async () => {
    if (!studentId) {
      setError("Không tìm thấy mã sinh viên trong phiên đăng nhập.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await getStudentRequests(studentId);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [studentId]);

  useEffect(() => {
    const loadGrades = async () => {
      if (!studentId) {
        setGradeLoading(false);
        return;
      }

      try {
        setGradeLoading(true);
        const data = await getStudentGrades(studentId);
        setGradeData(data);
      } catch (err) {
        setError(err.message || "Không thể tải danh sách lớp học phần.");
      } finally {
        setGradeLoading(false);
      }
    };

    loadGrades();
  }, [studentId]);

  const leaveSectionOptions = useMemo(() => {
    const semesters = gradeData?.semesters ?? [];
    if (semesters.length === 0) {
      return [];
    }

    const currentSemester = [...semesters].sort(
      (left, right) => Number(right.semesterId ?? 0) - Number(left.semesterId ?? 0)
    )[0];

    const flattened = (currentSemester?.courses ?? []).map((course) => ({
      sectionId: course.sectionId,
      sectionCode: course.sectionCode,
      courseCode: course.courseCode,
      courseName: course.courseName,
      semesterName: currentSemester.semesterName,
    }));

    const uniqueBySection = new Map();
    for (const option of flattened) {
      if (option.sectionId !== null && option.sectionId !== undefined && !uniqueBySection.has(String(option.sectionId))) {
        uniqueBySection.set(String(option.sectionId), option);
      }
    }

    return Array.from(uniqueBySection.values());
  }, [gradeData]);

  const selectedLeaveSection = useMemo(
    () => leaveSectionOptions.find((option) => String(option.sectionId) === String(form.sectionId)) ?? null,
    [leaveSectionOptions, form.sectionId]
  );

  useEffect(() => {
    if (requestType !== "leave_request" || leaveSectionOptions.length === 0) {
      return;
    }

    const selectedExists = leaveSectionOptions.some((option) => String(option.sectionId) === String(form.sectionId));
    if (selectedExists) {
      return;
    }

    const first = leaveSectionOptions[0];
    setForm((current) => ({
      ...current,
      sectionId: String(first.sectionId),
      sectionCode: first.sectionCode || "",
      courseCode: first.courseCode || "",
      courseName: first.courseName || "",
    }));
  }, [requestType, form.sectionId, leaveSectionOptions]);

  const currentSemesterLabel = leaveSectionOptions[0]?.semesterName || "học kỳ hiện tại";

  const selectedRequestTypeMeta = useMemo(() => {
    if (requestType === "leave_request") {
      return {
        label: "Đơn xin nghỉ học",
        description: "Mỗi đơn chỉ xin nghỉ 1 buổi và phải chọn đúng lớp học phần.",
      };
    }

    return {
      label: "Phúc khảo điểm",
      description: "Đề nghị xem xét lại kết quả học tập.",
    };
  }, [requestType]);

  const statusLabel = (status) => {
    if (status === "approved") return "Đã duyệt";
    if (status === "rejected") return "Từ chối";
    return "Chờ duyệt";
  };

  const statusClassName = (status) => {
    if (status === "approved") return "bg-green-50 text-green-700";
    if (status === "rejected") return "bg-red-50 text-red-700";
    return "bg-amber-50 text-amber-700";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentId) {
      setError("Không tìm thấy mã sinh viên trong phiên đăng nhập.");
      return;
    }

    if ((requestType === "leave_request" || requestType === "recheck_grade") && !selectedLeaveSection) {
      setError("Vui lòng chọn lớp học phần hợp lệ.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        requestTypeCode: requestType,
        title: form.title.trim(),
        content: form.content.trim(),
        fromDate: requestType === "leave_request" ? form.requestDate || null : null,
        toDate: null,
        sectionId: (requestType === "leave_request" || requestType === "recheck_grade") ? Number(form.sectionId) || null : null,
        sectionCode: (requestType === "leave_request" || requestType === "recheck_grade") ? selectedLeaveSection?.sectionCode || form.sectionCode || null : null,
        courseCode: requestType === "recheck_grade" ? (selectedLeaveSection?.courseCode || form.courseCode.trim() || null) : null,
        courseName: requestType === "recheck_grade" ? (selectedLeaveSection?.courseName || form.courseName.trim() || null) : null,
        attachmentFileName: selectedFileName || null,
        attachmentFileUrl: null,
      };

      const formData = new FormData();
      formData.append("request", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (selectedFile) {
        formData.append("attachment", selectedFile);
      }

      const created = await submitStudentRequest(studentId, formData);
      setRequests((current) => [created, ...current]);
      setSuccessMessage("Gửi yêu cầu thành công. Đơn đã được thêm vào danh sách chờ xử lý.");
      setForm({
        title: "",
        content: "",
        requestDate: "",
        sectionId: leaveSectionOptions[0] ? String(leaveSectionOptions[0].sectionId) : "",
        sectionCode: leaveSectionOptions[0]?.sectionCode || "",
        courseCode: "",
        courseName: "",
      });
      setSelectedFileName("");
      setSelectedFile(null);
    } catch (err) {
      setError(err.message || "Không thể gửi yêu cầu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setRequestType("leave_request");
    setForm({
      title: "",
      content: "",
      requestDate: "",
      sectionId: leaveSectionOptions[0] ? String(leaveSectionOptions[0].sectionId) : "",
      sectionCode: leaveSectionOptions[0]?.sectionCode || "",
      courseCode: "",
      courseName: "",
    });
    setSelectedFileName("");
    setSelectedFile(null);
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Gửi yêu cầu</h1>
        <p className="text-gray-600 mt-1">Gửi đơn xin nghỉ học hoặc phúc khảo điểm</p>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Gửi yêu cầu thành công!</p>
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-semibold">Không thể xử lý yêu cầu</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Loại yêu cầu *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRequestType("leave_request")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  requestType === "leave_request" ? "border-[#1E3A8A] bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Calendar className={`w-6 h-6 mb-2 ${requestType === "leave_request" ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                <p className="font-semibold text-gray-900">Đơn xin nghỉ học</p>
                <p className="text-sm text-gray-600">Xin phép nghỉ buổi học ở {currentSemesterLabel}</p>
              </button>
              <button
                type="button"
                onClick={() => setRequestType("recheck_grade")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  requestType === "recheck_grade" ? "border-[#1E3A8A] bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileText className={`w-6 h-6 mb-2 ${requestType === "recheck_grade" ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                <p className="font-semibold text-gray-900">Phúc khảo điểm</p>
                <p className="text-sm text-gray-600">Đề nghị xem lại điểm</p>
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">{selectedRequestTypeMeta.label}</p>
            <p className="text-sm text-gray-600 mt-1">{selectedRequestTypeMeta.description}</p>
            {(requestType === "leave_request" || requestType === "recheck_grade") && selectedLeaveSection ? (
              <p className="text-xs text-gray-500 mt-2">
                Đang chọn: {selectedLeaveSection.sectionCode} - {selectedLeaveSection.courseName}
              </p>
            ) : null}
          </div>

          {requestType === "leave_request" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lớp học phần *</label>
                <select
                  required
                  value={form.sectionId}
                  onChange={(event) => {
                    const selected = leaveSectionOptions.find((option) => String(option.sectionId) === event.target.value);
                    setForm((current) => ({
                      ...current,
                      sectionId: event.target.value,
                      sectionCode: selected?.sectionCode || "",
                      courseCode: selected?.courseCode || "",
                      courseName: selected?.courseName || "",
                    }));
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                  disabled={gradeLoading}
                >
                  {leaveSectionOptions.length === 0 ? <option value="">Chưa có lớp học phần</option> : null}
                  {leaveSectionOptions.map((option) => (
                    <option key={option.sectionId} value={option.sectionId}>
                      {option.sectionCode} - {option.courseName} ({option.semesterName})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày xin nghỉ *</label>
                <input
                  type="date"
                  required
                  value={form.requestDate}
                  onChange={(event) => setForm((current) => ({ ...current, requestDate: event.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                />
              </div>
            </div>
          )}

          {requestType === "recheck_grade" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lớp học phần *</label>
              <select
                required
                value={form.sectionId}
                onChange={(event) => {
                  const selected = leaveSectionOptions.find((option) => String(option.sectionId) === event.target.value);
                  setForm((current) => ({
                    ...current,
                    sectionId: event.target.value,
                    sectionCode: selected?.sectionCode || "",
                    courseCode: selected?.courseCode || "",
                    courseName: selected?.courseName || "",
                  }));
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                disabled={gradeLoading}
              >
                {leaveSectionOptions.length === 0 ? <option value="">Chưa có lớp học phần</option> : null}
                {leaveSectionOptions.map((option) => (
                  <option key={option.sectionId} value={option.sectionId}>
                    {option.sectionCode} - {option.courseName} ({option.semesterName})
                  </option>
                ))}
              </select>
            </div>
          )}

          {requestType === "leave_request" && gradeLoading && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Đang tải danh sách lớp học phần...
            </div>
          )}

          {requestType === "recheck_grade" && gradeLoading && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Đang tải danh sách lớp học phần...
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder={requestType === "leave_request" ? "Ví dụ: Nghỉ học do ốm" : "Ví dụ: Phúc khảo điểm giữa kỳ"}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {requestType === "leave_request" ? "Lý do" : "Chi tiết"} *
            </label>
            <textarea
              required
              rows={6}
              value={form.content}
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              placeholder={
                requestType === "leave_request"
                  ? "Vui lòng nêu rõ lý do xin nghỉ học..."
                  : "Vui lòng cung cấp chi tiết yêu cầu phúc khảo..."
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tài liệu đính kèm</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-gray-300 transition-colors">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Bấm để tải lên hoặc kéo thả tệp</p>
              <p className="text-xs text-gray-500">PDF, JPG, PNG tối đa 10MB</p>
              <input
                type="file"
                className="mt-3 block w-full text-sm text-gray-600"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setSelectedFile(file);
                  setSelectedFileName(file?.name || "");
                }}
              />
              {selectedFileName ? <p className="mt-2 text-xs text-gray-500">Đã chọn: {selectedFileName}</p> : null}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Yêu cầu gần đây</h2>
            <p className="text-sm text-gray-500">Danh sách đơn bạn đã gửi.</p>
          </div>
          <button
            type="button"
            onClick={loadRequests}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6 text-sm text-gray-600">Đang tải danh sách yêu cầu...</div>
          ) : requests.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">Bạn chưa gửi yêu cầu nào.</div>
          ) : (
            requests.map((request) => (
              <div key={request.requestId} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        {request.requestTypeName || request.requestTypeCode || "Yêu cầu"}
                      </span>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusClassName(request.status)}`}>
                        {statusLabel(request.status)}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 mb-1">{request.title}</p>
                    <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">{request.content}</p>
                    <p className="text-xs text-gray-500">
                      Đã gửi ngày {request.createdAt ? new Date(request.createdAt).toLocaleString("vi-VN") : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
