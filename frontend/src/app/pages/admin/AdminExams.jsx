import React, { useState, useEffect, useRef } from "react";
import {
  Plus, Download, Upload, ShieldAlert, BadgeCheck, Trash2, Edit3, X,
  UserCheck, AlertTriangle, AlertCircle, Calendar, Clock, MapPin, Users,
  CheckCircle2, HelpCircle, FileSpreadsheet, Search, RefreshCw, Eye
} from "lucide-react";
import { adminExamApi } from "../../../api/adminExamApi";
import { ExamStatusBadge } from "../../components/exam/ExamStatusBadge";
import { ExamTypeBadge } from "../../components/exam/ExamTypeBadge";
import { ExamMethodBadge } from "../../components/exam/ExamMethodBadge";
import { ExamSemesterFilter } from "../../components/exam/ExamSemesterFilter";
import { ExamEmptyState } from "../../components/exam/ExamEmptyState";

export function AdminExams() {
  // Main Data States
  const [exams, setExams] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [eligibleSections, setEligibleSections] = useState([]);
  const [selectedInvigilators, setSelectedInvigilators] = useState([]);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRoom, setFilterRoom] = useState("");

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal States
  // 'create' | 'edit' | 'import' | 'invigilator' | 'constraints' | null
  const [activeModal, setActiveModal] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [constraintPanel, setConstraintPanel] = useState(null); // holds validation run details

  // Form States
  const [formFields, setFormFields] = useState({
    semesterId: "",
    sectionId: "",
    courseCode: "",
    courseName: "",
    sectionCode: "",
    roomId: "",
    roomCode: "",
    examType: "midterm",
    examMethod: "WRITTEN",
    examDate: "",
    startTime: "08:00",
    endTime: "09:30",
    duration: "90 phút",
    seatRange: "",
    studentCount: 30,
    status: "DRAFT",
    note: ""
  });

  // Invigilator Sub-form States
  const [invField, setInvField] = useState({
    lecturerId: "",
    role: "MAIN",
    note: ""
  });

  // Excel Import States
  const [excelFile, setExcelFile] = useState(null);
  const [excelErrors, setExcelErrors] = useState([]);
  const [excelPreviewItems, setExcelPreviewItems] = useState([]);
  const [excelPreviewStats, setExcelPreviewStats] = useState(null);
  const [isCheckingExcel, setIsCheckingExcel] = useState(false);
  const [importSuccessCount, setImportSuccessCount] = useState(0);

  const fileInputRef = useRef(null);

  // Load Initial Metadata
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [sems, rms, lecs] = await Promise.all([
          adminExamApi.getSemesters(),
          adminExamApi.getRooms(),
          adminExamApi.getLecturers()
        ]);

        setSemesters(sems);
        setRooms(rms);
        setLecturers(lecs);

        // Select active semester
        const activeSem = sems.find(s => s.active) || sems[0];
        if (activeSem) {
          setSelectedSemester(activeSem.id);
          setFormFields(prev => ({ ...prev, semesterId: activeSem.id }));
        }
      } catch (err) {
        console.error("Lỗi khi tải metadata admin:", err);
        setError("Không thể tải cấu hình môn học/học kỳ từ hệ thống.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Fetch Exams when semester changes or on refresh
  const loadExams = async () => {
    if (!selectedSemester) return;
    try {
      setLoading(true);
      const data = await adminExamApi.getExams({ semesterId: selectedSemester });
      setExams(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách lịch thi:", err);
      setError("Không thể tải danh sách lịch thi. Vui lòng tải lại.");
    } finally {
      setLoading(false);
    }
  };

  const loadEligibleSections = async () => {
    if (!selectedSemester) return;
    try {
      const data = await adminExamApi.getEligibleSections(selectedSemester);
      setEligibleSections(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách lớp học phần:", err);
    }
  };

  useEffect(() => {
    loadExams();
    loadEligibleSections();
  }, [selectedSemester]);

  // Toast notifier
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Bulk publish draft -> scheduled
  const handlePublishAll = async () => {
    if (window.confirm("Bạn có chắc chắn muốn công bố toàn bộ lịch thi đang ở trạng thái nháp (DRAFT) trong học kỳ này không?")) {
      try {
        setLoading(true);
        await adminExamApi.publishExams(selectedSemester);
        await loadExams();
        showToast("Đã công bố thành công tất cả lịch thi nháp!");
      } catch (err) {
        showToast(err.response?.data?.message || err.message || "Không thể công bố lịch thi", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Run Constraints Checks
  const handleCheckConstraints = async () => {
    try {
      setLoading(true);
      const report = await adminExamApi.checkAllConstraints(selectedSemester);
      setConstraintPanel(report);
      setActiveModal("constraints");
      showToast("Đã hoàn thành kiểm tra ràng buộc!");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Không thể thực hiện kiểm tra ràng buộc", "error");
    } finally {
      setLoading(false);
    }
  };

  // Manual Creation Form Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formFields.sectionId) {
      showToast("Vui lòng chọn lớp học phần khả dụng!", "error");
      return;
    }
    if (!formFields.roomId) {
      showToast("Vui lòng chọn phòng thi!", "error");
      return;
    }

    // Get current section studentCount
    const currentSection = eligibleSections.find(s => String(s.sectionId) === String(formFields.sectionId));
    const studentCount = currentSection ? currentSection.studentCount : 0;

    if (!studentCount || studentCount === 0) {
      showToast("Lớp học phần này chưa có sinh viên đăng ký nên không thể tạo lịch thi.", "error");
      return;
    }

    // Validation: capacity warning
    const currentRoom = rooms.find(r => String(r.roomId) === String(formFields.roomId));
    if (currentRoom && currentRoom.capacity < studentCount) {
      if (!window.confirm(`Cảnh báo: Phòng thi không đủ sức chứa (${currentRoom.capacity} ghế) cho số sinh viên lớp học phần (${studentCount} SV). Bạn có chắc chắn vẫn muốn tiếp tục?`)) {
        return;
      }
    }

    // Validation: SCHEDULED status requires at least 1 MAIN invigilator
    if (formFields.status === "SCHEDULED") {
      const hasMain = selectedInvigilators.some(inv => inv.role === "MAIN");
      if (!hasMain) {
        showToast("Lịch thi đã lên lịch cần có giám thị chính.", "error");
        return;
      }
    }

    // Check if any invigilator has an error (duplicate or teaching conflict)
    for (let i = 0; i < selectedInvigilators.length; i++) {
      const errorMsg = getInvigilatorError(selectedInvigilators[i].lecturerId, selectedInvigilators[i].role, i);
      if (errorMsg) {
        showToast(errorMsg, "error");
        return;
      }
    }

    try {
      setLoading(true);
      await adminExamApi.createExam({
        semesterId: selectedSemester,
        sectionId: Number(formFields.sectionId),
        roomId: Number(formFields.roomId),
        examType: formFields.examType,
        examMethod: formFields.examMethod,
        examDate: formFields.examDate,
        startTime: formFields.startTime,
        endTime: formFields.endTime,
        status: formFields.status,
        note: formFields.note,
        invigilators: selectedInvigilators
      });
      await loadExams();
      setActiveModal(null);
      showToast("Đã tạo lịch thi thành công!");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Lỗi khi tạo lịch thi", "error");
    } finally {
      setLoading(false);
    }
  };

  // Manual Update Form Submit
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    // Get current section studentCount
    const currentSection = eligibleSections.find(s => String(s.sectionId) === String(formFields.sectionId));
    const studentCount = currentSection ? currentSection.studentCount : (selectedExam ? selectedExam.studentCount : 0);

    if (!studentCount || studentCount === 0) {
      showToast("Lớp học phần này chưa có sinh viên đăng ký nên không thể tạo lịch thi.", "error");
      return;
    }

    // Validation: capacity warning
    const currentRoom = rooms.find(r => String(r.roomId) === String(formFields.roomId));
    if (currentRoom && currentRoom.capacity < studentCount) {
      if (!window.confirm(`Cảnh báo: Phòng thi không đủ sức chứa (${currentRoom.capacity} ghế) cho số sinh viên lớp học phần (${studentCount} SV). Bạn có chắc chắn vẫn muốn tiếp tục?`)) {
        return;
      }
    }

    // Validation: SCHEDULED status requires at least 1 MAIN invigilator
    if (formFields.status === "SCHEDULED") {
      const hasMain = selectedInvigilators.some(inv => inv.role === "MAIN");
      if (!hasMain) {
        showToast("Lịch thi đã lên lịch cần có giám thị chính.", "error");
        return;
      }
    }

    // Check if any invigilator has an error (duplicate or teaching conflict)
    for (let i = 0; i < selectedInvigilators.length; i++) {
      const errorMsg = getInvigilatorError(selectedInvigilators[i].lecturerId, selectedInvigilators[i].role, i);
      if (errorMsg) {
        showToast(errorMsg, "error");
        return;
      }
    }

    try {
      setLoading(true);
      await adminExamApi.updateExam(selectedExam.id, {
        semesterId: Number(formFields.semesterId),
        sectionId: Number(formFields.sectionId),
        roomId: Number(formFields.roomId),
        examType: formFields.examType,
        examMethod: formFields.examMethod,
        examDate: formFields.examDate,
        startTime: formFields.startTime,
        endTime: formFields.endTime,
        status: formFields.status,
        note: formFields.note,
        invigilators: selectedInvigilators
      });
      await loadExams();
      setActiveModal(null);
      setSelectedExam(null);
      showToast("Cập nhật lịch thi thành công!");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Lỗi khi cập nhật lịch thi", "error");
    } finally {
      setLoading(false);
    }
  };

  // Cancel Exam
  const handleCancelExam = async (examId, code) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy lịch thi môn ${code} không?`)) {
      try {
        setLoading(true);
        await adminExamApi.cancelExam(examId);
        await loadExams();
        showToast(`Đã hủy lịch thi môn ${code}!`);
      } catch (err) {
        showToast(err.response?.data?.message || err.message || "Lỗi khi hủy lịch thi", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Delete Exam
  const handleDeleteExam = async (examId, code) => {
    if (window.confirm(`Hành động này sẽ XÓA VĨNH VIỄN lịch thi môn ${code}. Bạn chắc chắn muốn xóa?`)) {
      try {
        setLoading(true);
        await adminExamApi.deleteExam(examId);
        await loadExams();
        showToast(`Đã xóa vĩnh viễn lịch thi môn ${code}!`);
      } catch (err) {
        showToast(err.response?.data?.message || err.message || "Lỗi khi xóa lịch thi", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Invigilator Assignment Submit
  const handleAssignInvigilator = async (e) => {
    e.preventDefault();
    if (!invField.lecturerId) {
      showToast("Vui lòng chọn giảng viên", "error");
      return;
    }
    try {
      const updated = await adminExamApi.assignInvigilator(selectedExam.id, invField);
      setSelectedExam(updated);
      await loadExams();
      setInvField({ lecturerId: "", role: "MAIN", note: "" });
      showToast("Đã phân công giảng viên coi thi!");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Lỗi khi phân công", "error");
    }
  };

  // Invigilator Removal
  const handleRemoveInvigilator = async (lecturerId) => {
    try {
      const updated = await adminExamApi.removeInvigilator(selectedExam.id, lecturerId);
      setSelectedExam(updated);
      await loadExams();
      showToast("Đã rút phân công cán bộ coi thi!");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Lỗi khi rút cán bộ coi thi", "error");
    }
  };

  // Excel Excel Import Actions
  const handleDownloadTemplate = async () => {
    try {
      await adminExamApi.downloadTemplate(selectedSemester);
      showToast("Bắt đầu tải file mẫu Excel...");
    } catch (err) {
      showToast("Không thể tải file mẫu", "error");
    }
  };

  const handleExcelFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExcelFile(file);
      setExcelErrors([]);
      setExcelPreviewItems([]);
      setExcelPreviewStats(null);
      setImportSuccessCount(0);
    }
  };

  const handleCheckExcel = async () => {
    if (!excelFile) {
      showToast("Vui lòng chọn file Excel trước", "error");
      return;
    }
    try {
      setIsCheckingExcel(true);
      const res = await adminExamApi.previewExcelImport(excelFile, selectedSemester);
      setExcelErrors(res.errors || []);
      setExcelPreviewItems(res.previewItems || []);
      setExcelPreviewStats({
        success: res.success,
        totalRows: res.totalRows,
        validRows: res.validRows,
        errorCount: res.errorCount,
        warningCount: res.warningCount
      });
      showToast(res.success ? "File hợp lệ!" : "Phát hiện lỗi trong file", res.success ? "success" : "error");
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi đọc file Excel", "error");
    } finally {
      setIsCheckingExcel(false);
    }
  };

  const handleConfirmImport = async () => {
    try {
      setLoading(true);
      const res = await adminExamApi.confirmExcelImport(excelFile, selectedSemester);
      if (!res.success) {
        setExcelErrors(res.errors || []);
        setExcelPreviewStats({
          success: res.success,
          totalRows: res.totalRows,
          validRows: res.validRows,
          errorCount: res.errorCount,
          warningCount: res.warningCount
        });
        throw new Error(res.errors?.[0]?.message || "File Excel chưa hợp lệ để import");
      }
      await loadExams();
      setImportSuccessCount(res.validRows || 0);
      setExcelFile(null);
      showToast(`Đã import thành công ${res.validRows} ca thi từ Excel!`);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi xác nhận import", "error");
    } finally {
      setLoading(false);
    }
  };

  // Helpers to manage invigilator assignment on the manual form
  const addInvigilatorRow = (role = "ASSISTANT") => {
    setSelectedInvigilators(prev => [
      ...prev,
      { lecturerId: "", role, note: "" }
    ]);
  };

  const updateInvigilatorRow = (index, field, value) => {
    setSelectedInvigilators(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeInvigilatorRow = (index) => {
    setSelectedInvigilators(prev => prev.filter((_, idx) => idx !== index));
  };

  const getInvigilatorError = (lecturerId, role, index) => {
    if (!lecturerId) return null;

    // Check teaching lecturer
    const currentSection = eligibleSections.find(s => String(s.sectionId) === String(formFields.sectionId));
    const teachingLecturerId = currentSection ? currentSection.lecturerId : null;
    if (teachingLecturerId && String(lecturerId) === String(teachingLecturerId)) {
      return "Giảng viên phụ trách lớp này không thể coi thi lớp mình dạy.";
    }

    // Check duplicate in selectedInvigilators
    const isDuplicate = selectedInvigilators.some((inv, idx) => idx !== index && String(inv.lecturerId) === String(lecturerId));
    if (isDuplicate) {
      return "Giảng viên này đã được phân công trong ca thi.";
    }

    return null;
  };

  // Helpers to prep editing form
  const openEditModal = (exam) => {
    setSelectedExam(exam);
    setFormFields({
      semesterId: exam.semesterId,
      sectionId: exam.sectionId,
      courseCode: exam.courseCode,
      courseName: exam.courseName,
      sectionCode: exam.sectionCode,
      roomId: exam.roomId || "",
      roomCode: exam.roomCode || "",
      examType: exam.examType,
      examMethod: exam.examMethod,
      examDate: exam.examDate,
      startTime: exam.startTime,
      endTime: exam.endTime,
      duration: exam.duration || "90 phút",
      seatRange: exam.seatRange || "",
      studentCount: exam.studentCount,
      status: exam.status,
      note: exam.note || ""
    });
    setSelectedInvigilators(
      (exam.invigilators || []).map(inv => ({
        lecturerId: inv.lecturerId,
        role: inv.role,
        note: inv.note || ""
      }))
    );
    setActiveModal("edit");
  };

  // Reset form helper
  const openCreateModal = () => {
    setFormFields({
      semesterId: selectedSemester,
      sectionId: "",
      courseCode: "",
      courseName: "",
      sectionCode: "",
      roomId: "",
      roomCode: "",
      examType: "midterm",
      examMethod: "WRITTEN",
      examDate: new Date().toISOString().split("T")[0],
      startTime: "08:00",
      endTime: "09:30",
      duration: "90 phút",
      seatRange: "",
      studentCount: 30,
      status: "DRAFT",
      note: ""
    });
    setSelectedInvigilators([]);
    setActiveModal("create");
  };

  const handleSectionSelectChange = (e) => {
    const secId = e.target.value;
    if (!secId) {
      setFormFields(prev => ({
        ...prev,
        sectionId: "",
        courseCode: "",
        courseName: "",
        sectionCode: "",
        studentCount: 30
      }));
      return;
    }
    const sec = eligibleSections.find(s => String(s.sectionId) === String(secId));
    if (sec) {
      setFormFields(prev => ({
        ...prev,
        sectionId: sec.sectionId,
        courseCode: sec.courseCode,
        courseName: sec.courseName,
        sectionCode: sec.sectionCode,
        studentCount: Number(sec.studentCount)
      }));
    }
  };

  // Filter exams based on Search & Select lists
  const filteredExams = exams.filter(e => {
    const matchesSearch =
      e.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.sectionCode && e.sectionCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = !filterType || e.examType === filterType;
    const matchesStatus = !filterStatus || e.status === filterStatus;
    const matchesRoom = !filterRoom || e.roomCode === filterRoom;

    return matchesSearch && matchesType && matchesStatus && matchesRoom;
  });

  // Calculate statistics for Top Cards
  const totalExams = exams.length;
  const draftExams = exams.filter(e => e.status === "DRAFT").length;
  const scheduledExams = exams.filter(e => e.status === "SCHEDULED").length;
  const missingInvigilators = exams.filter(e => e.status !== "DRAFT" && (!e.invigilators || e.invigilators.length === 0)).length;

  // Count distinct exams with at least 1 ERROR in constraints
  const errorConstraints = exams.filter(e => e.constraints?.some(c => c.severity === "ERROR")).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Toast popup */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[999] px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"
          }`}>
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý lịch thi</h1>
          <p className="text-gray-600 mt-1">Xây dựng lịch, giám sát phân công coi thi và kiểm tra trùng chéo</p>
        </div>
        <div className="flex items-center gap-3">
          {semesters.length > 0 && (
            <ExamSemesterFilter
              semesters={semesters}
              selectedSemesterId={selectedSemester}
              onChange={setSelectedSemester}
              disabled={loading}
            />
          )}
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Tổng lịch thi</p>
            <p className="text-3xl font-extrabold text-[#1E3A8A] mt-1">{totalExams}</p>
          </div>
          <p className="text-xs text-gray-600 mt-2">Tổng số trong học kỳ này</p>
        </article>

        <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Lịch nháp</p>
            <p className="text-3xl font-extrabold text-gray-700 mt-1">{draftExams}</p>
          </div>
          <p className="text-xs text-gray-600 mt-2">Đang biên soạn, chưa công bố</p>
        </article>

        <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Đã lên lịch</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{scheduledExams}</p>
          </div>
          <p className="text-xs text-gray-600 mt-2">Đã công bố đến SV & GV</p>
        </article>

        <article className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">Lỗi ràng buộc</p>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-3xl font-extrabold text-amber-700 mt-1">{errorConstraints}</p>
          </div>
          <p className="text-xs text-amber-800 mt-2">Trùng phòng thi, giảng viên</p>
        </article>

        <article className="bg-rose-50 rounded-xl shadow-sm border border-rose-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-rose-700 font-bold uppercase tracking-wider">Chưa gán giám thị</p>
              <Users className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-3xl font-extrabold text-rose-700 mt-1">{missingInvigilators}</p>
          </div>
          <p className="text-xs text-rose-800 mt-2">Cần bổ sung nhân sự</p>
        </article>

      </div>

      {/* Main Action Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tạo lịch thi
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-gray-500" />
            Tải file mẫu
          </button>

          <button
            onClick={() => setActiveModal("import")}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
          >
            <Upload className="w-4 h-4 text-gray-500" />
            Import Excel
          </button>

          <button
            onClick={handleCheckConstraints}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <ShieldAlert className="w-4 h-4" />
            Kiểm tra ràng buộc
          </button>

        </div>

        <button
          onClick={handlePublishAll}
          disabled={draftExams === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <BadgeCheck className="w-4 h-4" />
          Công bố lịch thi ({draftExams})
        </button>
      </div>

      {/* Grid Filtering & Table Lists */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Table Filters header */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row gap-3">

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo mã môn, tên môn học, lớp HP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] bg-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5 shrink-0 w-full md:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] bg-white font-medium text-gray-700"
            >
              <option value="">-- Loại thi --</option>
              <option value="midterm">Giữa kỳ</option>
              <option value="final">Cuối kỳ</option>
              <option value="makeup">Thi lại</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] bg-white font-medium text-gray-700"
            >
              <option value="">-- Trạng thái --</option>
              <option value="DRAFT">Nháp</option>
              <option value="SCHEDULED">Đã lên lịch</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="COMPLETED">Hoàn thành</option>
            </select>

            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] bg-white font-medium text-gray-700"
            >
              <option value="">-- Phòng thi --</option>
              {rooms.map(r => (
                <option key={r.roomCode} value={r.roomCode}>{r.roomCode}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Exams Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">Môn học / Lớp HP</th>
                <th className="px-5 py-3">Loại thi</th>
                <th className="px-5 py-3">Ngày thi</th>
                <th className="px-5 py-3">Khung giờ</th>
                <th className="px-5 py-3">Phòng</th>
                <th className="px-5 py-3 text-center">Số SV</th>
                <th className="px-5 py-3">Giám thị</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-center">Ràng buộc</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center text-gray-500 font-medium animate-pulse">
                    Đang tải danh sách lịch thi...
                  </td>
                </tr>
              ) : filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500 font-medium">
                    Không tìm thấy lịch thi nào thỏa mãn bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => {
                  const errorCount = exam.constraints?.filter(c => c.severity === "ERROR").length || 0;
                  const warningCount = exam.constraints?.filter(c => c.severity === "WARNING").length || 0;

                  return (
                    <tr
                      key={exam.id}
                      className={`hover:bg-gray-50 transition-colors ${errorCount > 0 ? "bg-rose-50/40 hover:bg-rose-50/60" : ""
                        }`}
                    >
                      {/* Course / Section */}
                      <td className="px-5 py-4">
                        <div>
                          <span className="font-bold text-gray-900">{exam.courseCode}</span>
                          <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xxs font-semibold">
                            {exam.sectionCode}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">{exam.courseName}</div>
                      </td>

                      {/* Type & Method */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <ExamTypeBadge type={exam.examType} />
                          <ExamMethodBadge method={exam.examMethod} />
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 font-semibold text-gray-800">
                        {(() => {
                          if (!exam.examDate) return "Chưa xếp";
                          const parts = exam.examDate.split("-");
                          return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : exam.examDate;
                        })()}
                      </td>

                      {/* Time Slot */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-800">{exam.startTime} - {exam.endTime}</div>
                        <div className="text-xxs text-gray-500 mt-0.5">Thời lượng: {exam.duration}</div>
                      </td>

                      {/* Room */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900">{exam.roomCode || "Chưa xếp"}</div>
                        <div className="text-xxs text-gray-500">{exam.building || ""}</div>
                      </td>

                      {/* Student Count */}
                      <td className="px-5 py-4 text-center font-bold text-gray-800">
                        {exam.studentCount}
                      </td>

                      {/* Invigilators */}
                      <td className="px-5 py-4">
                        {exam.invigilators && exam.invigilators.length > 0 ? (
                          <div className="space-y-1">
                            {exam.invigilators.map((inv, idx) => (
                              <div key={idx} className="flex items-center gap-1 text-xs">
                                <span className={`w-1.5 h-1.5 rounded-full ${inv.role === "MAIN" ? "bg-indigo-600" : "bg-violet-400"
                                  }`}></span>
                                <span className="font-semibold text-gray-700">{inv.lecturerName}</span>
                                <span className="text-xxs text-gray-400">({inv.role})</span>
                              </div>
                            ))}
                          </div>
                        ) : exam.status === "DRAFT" ? (
                          <span className="text-xs text-gray-400 italic">Không yêu cầu (Nháp)</span>
                        ) : (
                          <span className="text-xs text-red-500 font-semibold flex items-center gap-0.5">
                            <Users className="w-3.5 h-3.5" /> Chưa phân công
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <ExamStatusBadge status={exam.status} />
                      </td>

                      {/* Constraint Findings */}
                      <td className="px-5 py-4 text-center">
                        {errorCount > 0 ? (
                          <button
                            onClick={() => {
                              setSelectedExam(exam);
                              setConstraintPanel({
                                status: "ERROR",
                                details: exam.constraints
                              });
                              setActiveModal("constraints");
                            }}
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded text-xs font-bold"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errorCount} Lỗi
                          </button>
                        ) : warningCount > 0 ? (
                          <button
                            onClick={() => {
                              setSelectedExam(exam);
                              setConstraintPanel({
                                status: "WARNING",
                                details: exam.constraints
                              });
                              setActiveModal("constraints");
                            }}
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded text-xs font-bold"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {warningCount} Cảnh báo
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                          </span>
                        )}
                      </td>

                      {/* Operations */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedExam(exam);
                              setInvField({ lecturerId: "", role: "MAIN", note: "" });
                              setActiveModal("invigilator");
                            }}
                            title="Phân công giám thị"
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 border border-indigo-100 rounded transition-colors"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openEditModal(exam)}
                            title="Sửa lịch thi"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-100 rounded transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {exam.status !== "CANCELLED" && (
                            <button
                              onClick={() => handleCancelExam(exam.id, exam.courseCode)}
                              title="Hủy lịch thi"
                              className="p-1.5 text-amber-600 hover:bg-amber-50 border border-amber-100 rounded transition-colors"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteExam(exam.id, exam.courseCode)}
                            title="Xóa vĩnh viễn"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ========================================================
          MODAL 1 & 2: MANAGE MANUAL EXAM FORM (CREATE / EDIT)
          ======================================================== */}
      {(activeModal === "create" || activeModal === "edit") && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="bg-[#1E3A8A] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {activeModal === "create" ? "Tạo lịch thi mới" : `Sửa lịch thi môn ${selectedExam?.courseCode}`}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-white hover:text-blue-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={activeModal === "create" ? handleCreateSubmit : handleUpdateSubmit} className="p-6 space-y-4">

              <div className="grid grid-cols-2 gap-4">

                {activeModal === "create" ? (
                  <div className="col-span-2 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Lớp học phần khả dụng *</label>
                      <select
                        required
                        value={formFields.sectionId || ""}
                        onChange={handleSectionSelectChange}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 bg-white font-medium text-gray-800"
                      >
                        {eligibleSections.length === 0 ? (
                          <option value="" disabled>Không có lớp học phần đủ điều kiện (có sinh viên đăng ký) trong học kỳ này</option>
                        ) : (
                          <>
                            <option value="">-- Chọn lớp học phần để xếp lịch thi --</option>
                            {eligibleSections.map(sec => (
                              <option key={sec.sectionId} value={sec.sectionId}>
                                {sec.courseCode} - {sec.sectionCode} ({sec.courseName} — {sec.studentCount} SV)
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>

                    {formFields.sectionId && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <p className="text-xxs font-bold text-blue-700 uppercase tracking-wider">Thông tin học phần lựa chọn</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-semibold text-gray-700">
                          <div>
                            <span className="text-gray-400 font-normal">Môn học:</span>{" "}
                            <span className="text-gray-900">{formFields.courseName} ({formFields.courseCode})</span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-normal">Lớp học phần:</span>{" "}
                            <span className="text-gray-900">{formFields.sectionCode}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-normal">Giảng viên phụ trách:</span>{" "}
                            <span className="text-gray-900">
                              {(() => {
                                const sec = eligibleSections.find(s => String(s.sectionId) === String(formFields.sectionId));
                                return sec ? sec.lecturerName : "N/A";
                              })()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-normal">Số sinh viên đăng ký:</span>{" "}
                            <span className="text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded text-xxs inline-block">
                              {(() => {
                                const sec = eligibleSections.find(s => String(s.sectionId) === String(formFields.sectionId));
                                return sec ? sec.studentCount : 0;
                              })()} SV (Chỉ đọc)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="col-span-2 space-y-3">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Học phần đang hiệu chỉnh</p>
                      <p className="text-sm font-bold text-[#1E3A8A] mt-1">
                        {formFields.courseCode} - {formFields.sectionCode}
                      </p>
                      <p className="text-xs text-gray-600 font-semibold mt-0.5">{formFields.courseName}</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 space-y-2">
                      <p className="text-xxs font-bold text-blue-700 uppercase tracking-wider">Thông tin lớp học phần (Chỉ đọc)</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-semibold text-gray-700">
                        <div>
                          <span className="text-gray-400 font-normal">Môn học:</span>{" "}
                          <span className="text-gray-900">{formFields.courseName} ({formFields.courseCode})</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-normal">Lớp học phần:</span>{" "}
                          <span className="text-gray-900">{formFields.sectionCode}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-normal">Số sinh viên đăng ký:</span>{" "}
                          <span className="text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded text-xxs inline-block">
                            {selectedExam?.studentCount || 0} SV (Chỉ đọc)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Loại thi</label>
                  <select
                    value={formFields.examType}
                    onChange={(e) => setFormFields(prev => ({ ...prev, examType: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] bg-white font-medium text-gray-800"
                  >
                    <option value="midterm">Giữa kỳ</option>
                    <option value="final">Cuối kỳ</option>
                    <option value="makeup">Thi lại</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Hình thức thi</label>
                  <select
                    value={formFields.examMethod}
                    onChange={(e) => setFormFields(prev => ({ ...prev, examMethod: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] bg-white font-medium text-gray-800"
                  >
                    <option value="WRITTEN">Tự luận/Trắc nghiệm giấy</option>
                    <option value="PRACTICAL">Thực hành máy tính</option>
                    <option value="ONLINE">Trực tuyến</option>
                    <option value="ORAL">Vấn đáp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Ngày thi *</label>
                  <input
                    type="date"
                    required
                    value={formFields.examDate}
                    onChange={(e) => setFormFields(prev => ({ ...prev, examDate: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xxs font-bold text-gray-700 uppercase tracking-wider mb-1">Bắt đầu</label>
                    <input
                      type="text"
                      required
                      placeholder="HH:MM"
                      value={formFields.startTime}
                      onChange={(e) => setFormFields(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-gray-700 uppercase tracking-wider mb-1">Kết thúc</label>
                    <input
                      type="text"
                      required
                      placeholder="HH:MM"
                      value={formFields.endTime}
                      onChange={(e) => setFormFields(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Thời lượng (phút)</label>
                  <input
                    type="text"
                    value={formFields.duration}
                    onChange={(e) => setFormFields(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Phòng thi *</label>
                  <select
                    required
                    value={formFields.roomId || ""}
                    onChange={(e) => {
                      const rId = e.target.value;
                      const rObj = rooms.find(r => String(r.roomId) === String(rId));
                      setFormFields(prev => ({
                        ...prev,
                        roomId: rId,
                        roomCode: rObj ? rObj.roomCode : ""
                      }));
                    }}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] bg-white font-medium text-gray-800"
                  >
                    <option value="">-- Chọn phòng thi --</option>
                    {rooms.map(r => (
                      <option key={r.roomId} value={r.roomId}>{r.roomCode} ({r.building} - Sức chứa: {r.capacity})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Trạng thái lịch thi</label>
                  <select
                    value={formFields.status}
                    onChange={(e) => setFormFields(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] bg-white font-medium text-gray-800"
                  >
                    <option value="DRAFT">Lịch nháp (DRAFT)</option>
                    <option value="SCHEDULED">Đã lên lịch (SCHEDULED)</option>
                    <option value="CANCELLED">Hủy thi (CANCELLED)</option>
                    <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Ghi chú đặc biệt</label>
                  <textarea
                    rows={2}
                    placeholder="Các yêu cầu kỹ thuật khác cho phòng máy/giám thị..."
                    value={formFields.note}
                    onChange={(e) => setFormFields(prev => ({ ...prev, note: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] resize-none"
                  ></textarea>
                </div>

              </div>

              {/* Phân công giảng viên coi thi Section */}
              <div className="border-t border-gray-200 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#1E3A8A]" />
                    Phân công giảng viên coi thi
                  </h4>
                  <button
                    type="button"
                    onClick={() => addInvigilatorRow("ASSISTANT")}
                    className="text-xs font-bold text-[#1E3A8A] hover:text-[#1E3A8A]/80 flex items-center gap-1 bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg transition-all"
                  >
                    + Thêm giám thị
                  </button>
                </div>

                {selectedInvigilators.length === 0 ? (
                  <div className="text-center py-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-500 italic">Chưa phân công giảng viên nào. (Bắt buộc ít nhất 1 Giám thị chính nếu để trạng thái SCHEDULED)</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {selectedInvigilators.map((inv, idx) => {
                      const errorMsg = getInvigilatorError(inv.lecturerId, inv.role, idx);
                      const currentSection = eligibleSections.find(s => String(s.sectionId) === String(formFields.sectionId));
                      const teachingLecturerId = currentSection ? currentSection.lecturerId : null;

                      return (
                        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
                          <div className="grid grid-cols-12 gap-3 items-center">

                            {/* Lecturer Select */}
                            <div className="col-span-12 sm:col-span-5">
                              <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Giảng viên *</label>
                              <select
                                required
                                value={inv.lecturerId || ""}
                                onChange={(e) => updateInvigilatorRow(idx, "lecturerId", Number(e.target.value))}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 bg-white font-medium text-gray-800"
                              >
                                <option value="">-- Chọn giảng viên coi thi --</option>
                                {lecturers.map(lec => {
                                  const isTeaching = teachingLecturerId && String(lec.lecturerId) === String(teachingLecturerId);
                                  return (
                                    <option
                                      key={lec.lecturerId}
                                      value={lec.lecturerId}
                                      disabled={isTeaching}
                                    >
                                      {lec.lecturerCode} - {lec.lecturerName || lec.fullName} {isTeaching ? " (GV giảng dạy - KHÔNG được chọn)" : ""}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>

                            {/* Role Select */}
                            <div className="col-span-12 sm:col-span-3">
                              <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Vai trò</label>
                              <select
                                value={inv.role}
                                onChange={(e) => updateInvigilatorRow(idx, "role", e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 bg-white font-medium text-gray-800"
                              >
                                <option value="MAIN">Giám thị chính (MAIN)</option>
                                <option value="ASSISTANT">Giám thị phụ (ASSISTANT)</option>
                              </select>
                            </div>

                            {/* Note Input */}
                            <div className="col-span-10 sm:col-span-3">
                              <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Ghi chú</label>
                              <input
                                type="text"
                                placeholder="Nhập ghi chú..."
                                value={inv.note || ""}
                                onChange={(e) => updateInvigilatorRow(idx, "note", e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
                              />
                            </div>

                            {/* Remove button */}
                            <div className="col-span-2 sm:col-span-1 text-right">
                              <button
                                type="button"
                                onClick={() => removeInvigilatorRow(idx)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-lg transition-colors inline-block"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                          </div>

                          {/* Error validation display */}
                          {errorMsg && (
                            <p className="text-xxs font-semibold text-rose-600 flex items-center gap-1 mt-1 bg-rose-50 border border-rose-100 px-2 py-1 rounded">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {errorMsg}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-100 rounded-lg text-sm font-semibold text-gray-700"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Xác nhận lưu
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: EXCEL IMPORT MODAL
          ======================================================== */}
      {activeModal === "import" && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-3xl max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

            <div className="bg-[#1E3A8A] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-200" />
                <h3 className="text-lg font-bold">Import lịch thi từ file Excel</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-white hover:text-blue-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">

              {/* Instructions and Download Template */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 justify-between">
                <div>
                  <h4 className="font-bold text-[#1E3A8A] text-sm">Tải file mẫu Excel tiêu chuẩn</h4>
                  <p className="text-xs text-blue-800 mt-1">Để đảm bảo hệ thống không bị lỗi dữ liệu, vui lòng điền theo cấu trúc các cột định dạng sẵn.</p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E3A8A] hover:bg-[#1E3A8A]/95 text-white rounded text-xs font-semibold shrink-0"
                >
                  <Download className="w-3.5 h-3.5" /> Tải file mẫu
                </button>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#1E3A8A] transition-all bg-gray-50/50">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700">Chọn file Excel lịch thi để upload</p>
                <p className="text-xs text-gray-500 mt-1">Hỗ trợ định dạng .xlsx, .xls</p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls"
                  onChange={handleExcelFileChange}
                  className="hidden"
                />

                <div className="mt-4 flex justify-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Chọn file
                  </button>
                  {excelFile && (
                    <button
                      onClick={handleCheckExcel}
                      disabled={isCheckingExcel}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                    >
                      {isCheckingExcel ? "Đang kiểm tra..." : "Kiểm tra file"}
                    </button>
                  )}
                </div>

                {excelFile && (
                  <p className="text-xs font-semibold text-gray-900 bg-blue-50/70 border border-blue-100 rounded px-3 py-1 mt-3.5 inline-block">
                    Đã nạp file: {excelFile.name} ({(excelFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {excelPreviewStats && (
                <div className="flex gap-4 mb-4 mt-6 border-b pb-4">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded p-3">
                    <p className="text-xs text-gray-500 uppercase font-bold">Tổng số dòng</p>
                    <p className="text-xl font-bold text-gray-900">{excelPreviewStats.totalRows}</p>
                  </div>
                  <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded p-3">
                    <p className="text-xs text-emerald-700 uppercase font-bold">Hợp lệ</p>
                    <p className="text-xl font-bold text-emerald-700">{excelPreviewStats.validRows}</p>
                  </div>
                  <div className="flex-1 bg-amber-50 border border-amber-200 rounded p-3">
                    <p className="text-xs text-amber-700 uppercase font-bold">Cảnh báo</p>
                    <p className="text-xl font-bold text-amber-700">{excelPreviewStats.warningCount}</p>
                  </div>
                  <div className="flex-1 bg-rose-50 border border-rose-200 rounded p-3">
                    <p className="text-xs text-rose-700 uppercase font-bold">Lỗi (Block)</p>
                    <p className="text-xl font-bold text-rose-700">{excelPreviewStats.errorCount}</p>
                  </div>
                </div>
              )}

              {/* Validation Result Table */}
              {excelErrors.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 text-rose-600">
                    <AlertTriangle className="w-4 h-4" />
                    Kết quả phát hiện lỗi / Cảnh báo theo dòng ({excelErrors.length})
                  </h4>

                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-100 border-b border-gray-200 text-gray-600 font-semibold sticky top-0">
                        <tr>
                          <th className="px-3 py-2">Sheet</th>
                          <th className="px-3 py-2 text-center">Dòng</th>
                          <th className="px-3 py-2">Trường lỗi</th>
                          <th className="px-3 py-2">Mức độ</th>
                          <th className="px-3 py-2">Chi tiết thông điệp lỗi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 font-medium">
                        {excelErrors.map((err, idx) => (
                          <tr key={idx} className={err.severity === "ERROR" ? "bg-rose-50/60" : "bg-amber-50/40"}>
                            <td className="px-3 py-2 text-gray-700">{err.sheet}</td>
                            <td className="px-3 py-2 text-center font-bold text-gray-900">{err.rowNumber}</td>
                            <td className="px-3 py-2 font-mono text-gray-800">{err.field}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-0.5 rounded text-xxs font-bold ${err.severity === "ERROR" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                                }`}>
                                {err.severity}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-900">{err.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xxs text-amber-800 italic">* Các cảnh báo (WARNING) vẫn được nạp nếu bạn tiếp tục. Lỗi (ERROR) sẽ ngăn cản quá trình nhập dữ liệu.</p>
                </div>
              )}
              
              {excelPreviewItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 text-blue-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Preview dữ liệu sẽ được Import ({excelPreviewItems.length})
                  </h4>
                  
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                      <thead className="bg-gray-100 border-b border-gray-200 text-gray-600 font-semibold sticky top-0">
                        <tr>
                          <th className="px-3 py-2">Mã lớp HP</th>
                          <th className="px-3 py-2">Phòng</th>
                          <th className="px-3 py-2">Ngày</th>
                          <th className="px-3 py-2">Bắt đầu</th>
                          <th className="px-3 py-2">Kết thúc</th>
                          <th className="px-3 py-2">Sĩ số</th>
                          <th className="px-3 py-2">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 font-medium">
                        {excelPreviewItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-bold text-[#1E3A8A]">{item.sectionCode}</td>
                            <td className="px-3 py-2">{item.roomCode}</td>
                            <td className="px-3 py-2">{item.examDate}</td>
                            <td className="px-3 py-2">{item.startTime}</td>
                            <td className="px-3 py-2">{item.endTime}</td>
                            <td className="px-3 py-2">{item.studentCount}</td>
                            <td className="px-3 py-2">{item.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {(!excelErrors.length && !excelPreviewItems.length && importSuccessCount > 0) ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <p className="font-bold text-emerald-900">Import thành công!</p>
                  <p className="text-xs text-emerald-800 mt-1">Đã chèn và khởi tạo thành công {importSuccessCount} ca thi mới vào học kỳ hiện tại.</p>
                </div>
              ) : null}

              {/* Confirm Actions */}
              <div className="sticky bottom-0 bg-white flex justify-end gap-3 pt-4 pb-1 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-100 rounded-lg text-sm font-semibold text-gray-700"
                >
                  Đóng lại
                </button>
                {excelFile && excelPreviewStats && excelPreviewStats.success && excelPreviewItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={loading}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm disabled:opacity-50"
                  >
                    Xác nhận Import Dữ Liệu
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: PANEL KIỂM TRA RÀNG BUỘC (CONSTRAINT CHECKER)
          ======================================================== */}
      {activeModal === "constraints" && constraintPanel && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            <div className="bg-[#1E3A8A] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-300" />
                <h3 className="text-lg font-bold">Báo cáo kết quả kiểm tra ràng buộc tự động</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-white hover:text-blue-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Overall Summary state bar */}
              <div className={`p-4 rounded-lg border flex items-center gap-3.5 justify-between ${constraintPanel.status === "ERROR"
                  ? "bg-rose-50 border-rose-200 text-rose-900"
                  : constraintPanel.status === "WARNING"
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : "bg-emerald-50 border-emerald-200 text-emerald-900"
                }`}>
                <div className="flex items-center gap-3">
                  {constraintPanel.status === "ERROR" ? (
                    <AlertCircle className="w-8 h-8 text-rose-600 shrink-0" />
                  ) : constraintPanel.status === "WARNING" ? (
                    <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-extrabold text-sm">
                      HỆ THỐNG XẾP LỊCH: {constraintPanel.status === "ERROR" ? "CÓ LỖI RÀNG BUỘC (ERROR)" : constraintPanel.status === "WARNING" ? "CÓ CẢNH BÁO (WARNING)" : "TẤT CẢ RÀNG BUỘC ĐÃ ĐẠT (PASS)"}
                    </h4>
                    <p className="text-xs mt-0.5">
                      Tìm thấy {constraintPanel.errorCount || 0} lỗi phòng thi/giảng viên bị trùng và {constraintPanel.warningCount || 0} cảnh báo chưa phân công.
                    </p>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${constraintPanel.status === "ERROR"
                    ? "bg-rose-200 border-rose-300 text-rose-900"
                    : constraintPanel.status === "WARNING"
                      ? "bg-amber-200 border-amber-300 text-amber-900"
                      : "bg-emerald-200 border-emerald-300 text-emerald-900"
                  }`}>
                  {constraintPanel.status}
                </span>
              </div>

              {/* Grouped findings detailed list */}
              {constraintPanel.details && constraintPanel.details.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 text-sm">Danh sách các vi phạm ràng buộc chi tiết:</h4>

                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-2">
                    {constraintPanel.details.map((detail, idx) => {
                      const typeLabels = {
                        room_clash: "Lỗi trùng phòng thi (ROOM CLASH)",
                        lecturer_clash: "Lỗi trùng lịch cán bộ coi thi (LECTURER CLASH)",
                        student_clash: "Lỗi trùng lịch sinh viên (STUDENT CLASH)",
                        missing_data: "Thiếu dữ liệu (MISSING DATA)",
                        time_clash: "Lỗi trùng thời gian (TIME CLASH)"
                      };

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border flex items-start gap-2.5 ${detail.severity === "ERROR"
                              ? "bg-rose-50/50 border-rose-100"
                              : "bg-amber-50/50 border-amber-100"
                            }`}
                        >
                          <span className={`px-2 py-0.5 rounded text-xxs font-black shrink-0 ${detail.severity === "ERROR" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                            }`}>
                            {detail.severity}
                          </span>

                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-gray-800">
                              {typeLabels[detail.type] || detail.type} — Lớp {detail.sectionCode} ({detail.courseCode})
                            </p>
                            <p className="text-xs text-gray-600 font-medium">
                              Phòng: {detail.roomCode || "Chưa gán"} | Ngày: {detail.examDate} | Ca: {detail.startTime}
                            </p>
                            <p className="text-xs text-red-700 font-bold mt-1">
                              👉 {detail.message}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-emerald-50 rounded-lg text-emerald-800 border border-emerald-100">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3" />
                  <p className="font-bold text-sm">Học kỳ này không có bất kỳ xung đột nào!</p>
                  <p className="text-xs mt-1">Hệ thống phòng học, ca thi và lịch coi thi của giảng viên hoàn toàn khớp sạch sẽ.</p>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-lg text-sm font-semibold"
                >
                  Xác nhận & Đóng báo cáo
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: PHÂN CÔNG GIÁM THỊ COI THI (INVIGILATOR ASSIGN)
          ======================================================== */}
      {activeModal === "invigilator" && selectedExam && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            <div className="bg-[#1E3A8A] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-200" />
                <h3 className="text-lg font-bold">Phân công cán bộ coi thi học kỳ</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-white hover:text-blue-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Target Exam details summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-xs">
                    {selectedExam.courseCode} ({selectedExam.sectionCode})
                  </span>
                  <ExamTypeBadge type={selectedExam.examType} />
                </div>
                <h4 className="font-bold text-gray-900 text-base">{selectedExam.courseName}</h4>

                <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-gray-600">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Ngày: {selectedExam.examDate}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Ca: {selectedExam.startTime} - {selectedExam.endTime}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Phòng: {selectedExam.roomCode}</span>
                </div>
              </div>

              {/* Current Assigments list */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 text-sm">Danh sách cán bộ đã phân công:</h4>
                {selectedExam.invigilators && selectedExam.invigilators.length > 0 ? (
                  <div className="space-y-2">
                    {selectedExam.invigilators.map((inv, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-indigo-50/70 border border-indigo-100 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                            {inv.role === "MAIN" ? "G1" : "G2"}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{inv.lecturerName} ({inv.lecturerCode})</p>
                            <p className="text-xxs text-gray-500 font-medium mt-0.5">
                              Vai trò: <strong>{inv.role === "MAIN" ? "Giám thị chính" : "Giám thị phụ"}</strong> {inv.note ? `| Ghi chú: ${inv.note}` : ""}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveInvigilator(inv.lecturerId)}
                          className="text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-100 rounded px-2.5 py-1"
                        >
                          Rút nhiệm vụ
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded border border-dashed text-xs text-gray-500 italic">
                    Chưa có giám thị nào được gán cho ca thi này.
                  </div>
                )}
              </div>

              {/* Add Invigilator Form */}
              <form onSubmit={handleAssignInvigilator} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                <h5 className="font-bold text-xs text-gray-700 uppercase tracking-wider">Thêm phân công mới</h5>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xxs font-bold text-gray-600 mb-1">Cán bộ giảng dạy *</label>
                    <select
                      value={invField.lecturerId}
                      onChange={(e) => setInvField(prev => ({ ...prev, lecturerId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 bg-white font-semibold text-gray-700"
                    >
                      <option value="">-- Chọn giảng viên rảnh ca thi này --</option>
                      {lecturers.map(lec => (
                        <option key={lec.lecturerId} value={lec.lecturerId}>{lec.lecturerName} ({lec.lecturerCode}) - {lec.department}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-gray-600 mb-1">Vai trò phân công</label>
                    <select
                      value={invField.role}
                      onChange={(e) => setInvField(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 bg-white font-semibold text-gray-700"
                    >
                      <option value="MAIN">Giám thị chính (MAIN)</option>
                      <option value="ASSISTANT">Giám thị phụ (ASSISTANT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-gray-600 mb-1">Ghi chú CBCT</label>
                    <input
                      type="text"
                      placeholder="VD: Nhận đề thi từ Lab..."
                      value={invField.note}
                      onChange={(e) => setInvField(prev => ({ ...prev, note: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded text-xs font-semibold"
                  >
                    Lưu phân công
                  </button>
                </div>
              </form>

              {/* Close Footer */}
              <div className="flex justify-end pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-semibold text-gray-700"
                >
                  Đóng lại
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminExams;
