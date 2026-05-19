import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Download,
  FileSpreadsheet,
  PenLine,
  RefreshCw,
  Save,
  Search,
  Upload,
  Users,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../../hooks/useAuth";
import { getLecturerSections, getSectionGrades, updateGrade, updateGradesBatch } from "../../../services/gradeService";

const defaultWeights = {
  attendanceWeight: 10,
  exerciseWeight: 0,
  practiceWeight: 0,
  midtermWeight: 30,
  finalWeight: 60,
};

const emptyScoreForm = {
  attendanceScore: "",
  exerciseScore: "",
  practiceScore: "",
  midtermScore: "",
  finalScore: "",
};

const scoreFields = [
  ["attendanceScore", "Chuyên cần"],
  ["exerciseScore", "Bài tập"],
  ["practiceScore", "Thực hành"],
  ["midtermScore", "Giữa kỳ"],
  ["finalScore", "Cuối kỳ"],
];

const weightFields = [
  ["attendanceWeight", "Chuyên cần"],
  ["exerciseWeight", "Bài tập"],
  ["practiceWeight", "Thực hành"],
  ["midtermWeight", "Giữa kỳ"],
  ["finalWeight", "Cuối kỳ"],
];

function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function calculateTotalScore(form, weights) {
  const attendanceScore = toNumberOrNull(form.attendanceScore) ?? 0;
  const exerciseScore = toNumberOrNull(form.exerciseScore) ?? 0;
  const practiceScore = toNumberOrNull(form.practiceScore) ?? 0;
  const midtermScore = toNumberOrNull(form.midtermScore) ?? 0;
  const finalScore = toNumberOrNull(form.finalScore) ?? 0;

  const attendanceWeight = Number(weights.attendanceWeight || 0);
  const exerciseWeight = Number(weights.exerciseWeight || 0);
  const practiceWeight = Number(weights.practiceWeight || 0);
  const midtermWeight = Number(weights.midtermWeight || 0);
  const finalWeight = Number(weights.finalWeight || 0);

  return (
    attendanceScore * attendanceWeight +
    exerciseScore * exerciseWeight +
    practiceScore * practiceWeight +
    midtermScore * midtermWeight +
    finalScore * finalWeight
  ) / 100;
}

function buildScorePayload(source) {
  return {
    attendanceScore: toNumberOrNull(source.attendanceScore),
    exerciseScore: toNumberOrNull(source.exerciseScore),
    practiceScore: toNumberOrNull(source.practiceScore),
    midtermScore: toNumberOrNull(source.midtermScore),
    finalScore: toNumberOrNull(source.finalScore),
  };
}

function createDraftFromRow(row) {
  return {
    attendanceScore: row.attendanceScore ?? "",
    exerciseScore: row.exerciseScore ?? "",
    practiceScore: row.practiceScore ?? "",
    midtermScore: row.midtermScore ?? "",
    finalScore: row.finalScore ?? "",
  };
}

function normalizeForExport(row) {
  return {
    enrollmentId: row.enrollmentId,
    studentCode: row.studentCode,
    studentName: row.studentName,
    courseCode: row.courseCode,
    courseName: row.courseName,
    sectionCode: row.sectionCode,
    attendanceScore: row.attendanceScore ?? "",
    exerciseScore: row.exerciseScore ?? "",
    practiceScore: row.practiceScore ?? "",
    midtermScore: row.midtermScore ?? "",
    finalScore: row.finalScore ?? "",
    totalScore: row.totalScore ?? "",
  };
}

function getCellValue(row, keys) {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return null;
}

export function LecturerGradeEntry() {
  const { user } = useAuth();
  const lecturerId = user?.lecturerId;
  const fileInputRef = useRef(null);

  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [gradeRows, setGradeRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [savingEnrollmentId, setSavingEnrollmentId] = useState(null);
  const [savingAll, setSavingAll] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [scoreForm, setScoreForm] = useState(emptyScoreForm);
  const [weightForm, setWeightForm] = useState(defaultWeights);
  const [searchText, setSearchText] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [rowDrafts, setRowDrafts] = useState({});

  useEffect(() => {
    let mounted = true;

    async function loadSections() {
      if (!lecturerId) {
        if (mounted) {
          setError("Không tìm thấy mã giảng viên trong phiên đăng nhập.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await getLecturerSections(lecturerId);
        const sectionList = Array.isArray(data) ? data : [];
        if (mounted) {
          setSections(sectionList);
          setSelectedSectionId((current) => current || sectionList[0]?.sectionId?.toString() || "");
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Không thể tải danh sách lớp học phần.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSections();

    return () => {
      mounted = false;
    };
  }, [lecturerId]);

  useEffect(() => {
    let mounted = true;

    async function loadGrades() {
      if (!lecturerId || !selectedSectionId) {
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await getSectionGrades(lecturerId, selectedSectionId);
        if (mounted) {
          setGradeRows(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Không thể tải danh sách điểm của lớp.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadGrades();

    return () => {
      mounted = false;
    };
  }, [lecturerId, selectedSectionId, refreshIndex]);

  const currentSection = useMemo(
    () => sections.find((section) => section.sectionId?.toString() === selectedSectionId?.toString()),
    [sections, selectedSectionId]
  );

  const totalWeight = Object.values(weightForm).reduce((sum, weight) => sum + Number(weight || 0), 0);
  const totalWeightValid = totalWeight === 100;
  const pendingDraftCount = Object.keys(rowDrafts).length;

  const displayRows = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return gradeRows
      .map((row) => ({
        ...row,
        ...(rowDrafts[row.enrollmentId] || {}),
      }))
      .filter((row) => {
        if (!keyword) {
          return true;
        }

        return [row.studentName, row.studentCode, row.courseCode, row.courseName, row.sectionCode]
          .filter(Boolean)
          .some((value) => value.toString().toLowerCase().includes(keyword));
      });
  }, [gradeRows, rowDrafts, searchText]);

  const selectedGradeSummary = useMemo(() => {
    if (!selectedSectionId) {
      return { total: 0, completed: 0 };
    }

    return {
      total: gradeRows.length,
      completed: gradeRows.filter((row) => row.totalScore !== null && row.totalScore !== undefined).length,
    };
  }, [gradeRows, selectedSectionId]);

  const updateDraft = (enrollmentId, patch) => {
    setRowDrafts((current) => ({
      ...current,
      [enrollmentId]: {
        ...(current[enrollmentId] || {}),
        ...patch,
      },
    }));
  };

  const clearDraft = (enrollmentId) => {
    setRowDrafts((current) => {
      const next = { ...current };
      delete next[enrollmentId];
      return next;
    });
  };

  const handleEditRow = (row) => {
    const mergedRow = {
      ...row,
      ...(rowDrafts[row.enrollmentId] || {}),
    };

    setEditingRow(mergedRow);
    setScoreForm(createDraftFromRow(mergedRow));
  };

  const persistRow = async (row, scoreSource, { silent = false } = {}) => {
    if (!lecturerId) {
      return null;
    }

    if (!totalWeightValid) {
      setError("Tổng trọng số phải bằng 100 trước khi lưu điểm.");
      return null;
    }

    try {
      setSavingEnrollmentId(row.enrollmentId);
      setError("");
      if (!silent) {
        setSuccessMessage("");
      }

      const payload = {
        ...defaultWeights,
        ...weightForm,
        ...buildScorePayload(scoreSource),
      };

      const updated = await updateGrade(lecturerId, row.enrollmentId, payload);
      setGradeRows((currentRows) => currentRows.map((item) => (item.enrollmentId === row.enrollmentId ? updated : item)));
      clearDraft(row.enrollmentId);
      setEditingRow(null);

      if (!silent) {
        setSuccessMessage(`Đã lưu điểm cho ${row.studentName}.`);
      }

      return updated;
    } catch (err) {
      setError(err.message || "Không thể lưu điểm.");
      return null;
    } finally {
      setSavingEnrollmentId(null);
    }
  };

  const handleSaveRow = async (row, scoreSource = scoreForm) => {
    await persistRow(row, scoreSource);
  };

  const handleSaveAllDrafts = async () => {
    if (!totalWeightValid) {
      setError("Tổng trọng số phải bằng 100 trước khi lưu tất cả.");
      return;
    }

    const drafts = Object.entries(rowDrafts);
    if (drafts.length === 0) {
      setSuccessMessage("Không có bản nháp nào để lưu.");
      return;
    }

    const rowsById = new Map(gradeRows.map((row) => [row.enrollmentId, row]));

    setSavingAll(true);
    setError("");
    setSuccessMessage("");

    try {
      // Prepare updates for batch API
      const updates = [];
      for (const [enrollmentId, draft] of drafts) {
        const row = rowsById.get(Number(enrollmentId));
        if (!row) {
          continue;
        }

        const payload = {
          ...defaultWeights,
          ...weightForm,
          ...buildScorePayload(draft),
        };
        updates.push({
          enrollmentId: Number(enrollmentId),
          gradeData: payload,
        });
      }

      if (updates.length === 0) {
        setSuccessMessage("Không có bản nháp nào để lưu.");
        return;
      }

      // Call batch API
      const results = await updateGradesBatch(lecturerId, updates);

      // Update grade rows with results
      const updatedRows = new Map(gradeRows.map((row) => [row.enrollmentId, row]));
      results.forEach((updated) => {
        updatedRows.set(updated.enrollmentId, updated);
      });
      setGradeRows(Array.from(updatedRows.values()));

      // Clear all drafts
      setRowDrafts({});

      setSuccessMessage(`Đã lưu thành công ${results.length}/${updates.length} bản nháp.`);
    } catch (err) {
      setError(err.message || "Không thể lưu hàng loạt. Vui lòng thử lại.");
    } finally {
      setSavingAll(false);
    }
  };

  const handleReload = () => {
    setSuccessMessage("");
    setError("");
    setRefreshIndex((current) => current + 1);
  };

  const handleExportExcel = () => {
    if (!currentSection) {
      setError("Hãy chọn lớp học phần trước khi xuất Excel.");
      return;
    }

    const workbook = XLSX.utils.book_new();
    const exportRows = displayRows.map(normalizeForExport);
    const dataSheet = XLSX.utils.json_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(workbook, dataSheet, "BangDiem");

    const guideSheet = XLSX.utils.aoa_to_sheet([
      ["Lop hoc phan", currentSection.sectionCode || ""],
      ["Mon hoc", currentSection.courseName || ""],
      ["Huong dan", "Sua cac cot diem roi tai lai file de import."],
      ["Cot bat buoc", "enrollmentId hoac studentCode"],
      [],
      ["enrollmentId", "studentCode", "studentName", "courseCode", "courseName", "sectionCode", "attendanceScore", "exerciseScore", "practiceScore", "midtermScore", "finalScore", "totalScore"],
    ]);
    XLSX.utils.book_append_sheet(workbook, guideSheet, "HuongDan");

    const fileName = `grade-entry-${currentSection.sectionCode || "section"}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    setSuccessMessage(`Đã xuất file ${fileName}.`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        setError("File Excel không có sheet dữ liệu.");
        return;
      }

      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (rows.length === 0) {
        setError("File Excel không có dữ liệu.");
        return;
      }

      const rowsByEnrollmentId = new Map(gradeRows.map((row) => [String(row.enrollmentId), row]));
      const rowsByStudentCode = new Map(gradeRows.map((row) => [String(row.studentCode).toLowerCase(), row]));

      let importedCount = 0;
      const nextDrafts = { ...rowDrafts };

      rows.forEach((row) => {
        const enrollmentId = getCellValue(row, ["enrollmentId", "EnrollmentId", "maDangKy"]);
        const studentCode = getCellValue(row, ["studentCode", "StudentCode", "mssv"]);

        const matchedRow = enrollmentId
          ? rowsByEnrollmentId.get(String(enrollmentId))
          : studentCode
            ? rowsByStudentCode.get(String(studentCode).toLowerCase())
            : null;

        if (!matchedRow) {
          return;
        }

        nextDrafts[matchedRow.enrollmentId] = {
          attendanceScore: getCellValue(row, ["attendanceScore", "AttendanceScore"]),
          exerciseScore: getCellValue(row, ["exerciseScore", "ExerciseScore"]),
          practiceScore: getCellValue(row, ["practiceScore", "PracticeScore"]),
          midtermScore: getCellValue(row, ["midtermScore", "MidtermScore"]),
          finalScore: getCellValue(row, ["finalScore", "FinalScore"]),
        };
        importedCount += 1;
      });

      setRowDrafts(nextDrafts);
      setSuccessMessage(`Đã nạp ${importedCount} dòng từ file Excel. Hãy kiểm tra và lưu.`);
      setError("");
    } catch (err) {
      setError(err.message || "Không thể đọc file Excel.");
    }
  };

  const totalStudents = currentSection?.currentCapacity ?? gradeRows.length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <PageHeader
        title="Nhập điểm"
        subtitle="Chọn lớp học phần, nhập trọng số, nạp Excel .xlsx hoặc cập nhật điểm từng sinh viên"
      />

      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} />

      <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white rounded-3xl shadow-xl p-5 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Grade entry workspace</p>
            <h2 className="mt-2 text-2xl font-semibold">Nhập điểm nhanh hơn với Excel</h2>
            <p className="mt-2 text-sm text-blue-100 max-w-2xl">
              Tải file .xlsx, sửa trực tiếp trong modal, lọc sinh viên theo mã/tên và lưu từng dòng hoặc lưu hàng loạt.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm min-w-[280px]">
            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <p className="text-blue-100">Lớp đang chọn</p>
              <p className="mt-1 text-lg font-semibold">{currentSection?.sectionCode || "-"}</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <p className="text-blue-100">Bản nháp</p>
              <p className="mt-1 text-lg font-semibold">{pendingDraftCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Lớp học phần</p>
            <p className="text-xs text-gray-500">Giảng viên chỉ thấy các lớp đang phụ trách.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <select
              value={selectedSectionId}
              onChange={(event) => setSelectedSectionId(event.target.value)}
              className="min-w-72 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm"
            >
              {sections.length === 0 ? (
                <option value="">Chưa có lớp học phần</option>
              ) : (
                sections.map((section) => (
                  <option key={section.sectionId} value={section.sectionId}>
                    {section.sectionCode} - {section.courseName}
                  </option>
                ))
              )}
            </select>

            <button
              type="button"
              onClick={handleReload}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </button>
          </div>
        </div>
      </section>

      {(successMessage || error) && (
        <div
          className={`rounded-2xl border p-4 flex items-start gap-3 ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
        >
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-semibold">{error ? "Không xử lý được" : "Thao tác hoàn tất"}</p>
            <p className="text-sm">{error || successMessage}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">Đang tải dữ liệu...</div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Lớp hiện tại</p>
              <p className="text-2xl font-semibold text-gray-900">{currentSection?.sectionCode || "-"}</p>
              <p className="text-sm text-gray-600 mt-1">{currentSection?.courseName || "Chưa chọn lớp"}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Sĩ số</p>
              <p className="text-2xl font-semibold text-gray-900">{totalStudents}</p>
              <p className="text-sm text-gray-600 mt-1">Đã đăng ký / hoàn thành</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Đã nhập điểm</p>
              <p className="text-2xl font-semibold text-gray-900">
                {selectedGradeSummary.completed}/{selectedGradeSummary.total}
              </p>
              <p className="text-sm text-gray-600 mt-1">Sinh viên đã có điểm tổng</p>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Trọng số thành phần</h2>
                <p className="text-sm text-gray-600">Tổng phải bằng 100 để lưu điểm.</p>
              </div>
              <div className={`text-sm font-medium ${totalWeightValid ? "text-green-700" : "text-red-600"}`}>
                Tổng trọng số: {totalWeight}%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {weightFields.map(([key, label]) => (
                <label key={key} className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={weightForm[key]}
                    onChange={(event) =>
                      setWeightForm((current) => ({
                        ...current,
                        [key]: event.target.value === "" ? 0 : Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Danh sách sinh viên</h2>
                <p className="text-sm text-gray-600">Bấm Sửa để nhập điểm thành phần, hoặc xuất/nhập file Excel .xlsx.</p>
              </div>
              <div className="flex flex-col gap-3 lg:items-end">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  {displayRows.length} / {gradeRows.length} sinh viên
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchText}
                      onChange={(event) => setSearchText(event.target.value)}
                      placeholder="Tìm theo MSSV, tên, lớp học phần..."
                      className="w-full sm:w-80 rounded-xl border border-gray-300 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 shadow-sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleImportClick}
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
                  >
                    <Upload className="w-4 h-4" />
                    Nhập .xlsx
                  </button>

                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                  >
                    <Download className="w-4 h-4" />
                    Xuất .xlsx
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAllDrafts}
                    disabled={savingAll || pendingDraftCount === 0 || !totalWeightValid}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1d4ed8] disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    {savingAll ? "Đang lưu..." : `Lưu tất cả (${pendingDraftCount})`}
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Sinh viên</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">MSSV</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Chuyên cần</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Bài tập</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Thực hành</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Giữa kỳ</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Cuối kỳ</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Tổng</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {displayRows.length === 0 ? (
                    <tr>
                      <td className="px-6 py-8 text-sm text-gray-500" colSpan={10}>
                        Không có sinh viên phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    displayRows.map((row) => {
                      const total = calculateTotalScore(
                        {
                          attendanceScore: row.attendanceScore,
                          exerciseScore: row.exerciseScore,
                          practiceScore: row.practiceScore,
                          midtermScore: row.midtermScore,
                          finalScore: row.finalScore,
                        },
                        weightForm
                      );

                      const hasDraft = Boolean(rowDrafts[row.enrollmentId]);
                      const statusLabel = hasDraft
                        ? "Bản nháp"
                        : row.totalScore !== null && row.totalScore !== undefined
                          ? "Đã nhập"
                          : "Chưa nhập";
                      const statusClass = hasDraft
                        ? "bg-amber-100 text-amber-800"
                        : row.totalScore !== null && row.totalScore !== undefined
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700";

                      return (
                        <tr key={row.enrollmentId}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.studentName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{row.studentCode}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{row.attendanceScore ?? "-"}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{row.exerciseScore ?? "-"}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{row.practiceScore ?? "-"}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{row.midtermScore ?? "-"}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{row.finalScore ?? "-"}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{Number(total).toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditRow(row)}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                              >
                                <PenLine className="w-4 h-4" />
                                Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveRow(row, rowDrafts[row.enrollmentId] || row)}
                                disabled={savingEnrollmentId === row.enrollmentId || !totalWeightValid}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                              >
                                <Save className="w-4 h-4" />
                                Lưu
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
          </section>

          {editingRow && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-200 p-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Cập nhật điểm</h3>
                    <p className="text-sm text-gray-500">
                      {editingRow.studentName} • {editingRow.studentCode}
                    </p>
                  </div>
                  <button type="button" onClick={() => setEditingRow(null)} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                  {scoreFields.map(([key, label]) => (
                    <label key={key} className="space-y-2">
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.01"
                        value={scoreForm[key]}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          setScoreForm((current) => ({ ...current, [key]: nextValue }));
                          updateDraft(editingRow.enrollmentId, { [key]: nextValue });
                        }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                      />
                    </label>
                  ))}
                </div>

                <div className="border-t border-gray-100 px-6 pb-2 text-sm text-gray-600">
                  <p>Trọng số hiện tại phải bằng 100. Bạn có thể đổi trọng số ở phần trên trước khi lưu.</p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 p-6">
                  <p className={`text-sm font-medium ${totalWeightValid ? "text-green-700" : "text-red-600"}`}>
                    Tổng trọng số hiện tại: {totalWeight}%
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingRow(null)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveRow(editingRow, scoreForm)}
                      disabled={savingEnrollmentId === editingRow.enrollmentId || !totalWeightValid}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8] disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {savingEnrollmentId === editingRow.enrollmentId ? "Đang lưu..." : "Lưu điểm"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
