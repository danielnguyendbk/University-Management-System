import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Backdrop,
  Box,
  CircularProgress,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { toast } from "sonner";
import { Eye, FileUp, Filter, Search, ShieldCheck, ShieldOff } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import {
  batchUpdateStudentStatus,
  importStudents,
  listDepartments,
  listStudentCohorts,
  listPrograms,
  listStudents,
  updateStudentStatus,
} from "../../../services/adminApi";

const academicStatusOptions = [
  { value: "", label: "Tất cả" },
  { value: "STUDYING", label: "Đang học" },
  { value: "PAUSED", label: "Bảo lưu" },
  { value: "DROPPED_OUT", label: "Bỏ học" },
  { value: "GRADUATED", label: "Đã tốt nghiệp" },
];

const statusLabelMap = {
  studying: { label: "Đang học", color: "success" },
  paused: { label: "Bảo lưu", color: "warning" },
  dropped_out: { label: "Bỏ học", color: "error" },
  graduated: { label: "Đã tốt nghiệp", color: "info" },
};

function normalizePage(payload) {
  return payload?.content ? payload : { content: [], totalElements: 0, totalPages: 0, page: 0, size: 20 };
}

function describeImportError(error) {
  const message = error?.message || "";
  if (/unable to read upload file|invalid|zip|excel|xlsx|csv/i.test(message)) {
    return "Không đọc được file import. Kiểm tra lại định dạng .csv/.xlsx và cấu trúc dữ liệu.";
  }
  return message || "Dữ liệu import không đúng. Kiểm tra lại file mẫu.";
}

function describeImportFailure(result, entityLabel) {
  const failed = Number(result?.failed || 0);
  const success = Number(result?.success || 0);
  if (failed <= 0) {
    return `Import ${entityLabel} thành công`;
  }
  return `Dữ liệu import ${entityLabel} không đúng. Hệ thống không lưu bản ghi nào khi file có lỗi. (${success} thành công, ${failed} lỗi)`;
}

function parseCsvPreview(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result || "").split(/\r?\n/).filter(Boolean);
      const [headerLine, ...rows] = lines;
      const headers = (headerLine || "").split(",").map((item) => item.trim());
      const preview = rows.slice(0, 10).map((line) => {
        const values = line.split(",");
        return headers.reduce((accumulator, header, index) => {
          accumulator[header] = values[index] || "";
          return accumulator;
        }, {});
      });
      resolve({ headers, preview });
    };
    reader.readAsText(file);
  });
}

function cohortPrefixToLabel(cohortPrefix) {
  if (!cohortPrefix || cohortPrefix.length < 3) {
    return cohortPrefix;
  }
  const yearPart = cohortPrefix.slice(1, 3);
  const year = Number.parseInt(yearPart, 10);
  if (Number.isNaN(year)) {
    return cohortPrefix;
  }
  return String(2000 + year);
}

export function ManageStudentAccounts() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [rows, setRows] = useState([]);
  const [pageData, setPageData] = useState({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 20 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [programId, setProgramId] = useState("");
  const [cohort, setCohort] = useState("");
  const [cohortOptions, setCohortOptions] = useState([]);
  const [academicStatus, setAcademicStatus] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusDialog, setStatusDialog] = useState({ open: false, studentIds: [], nextStatus: "" });
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [importLoading, setImportLoading] = useState(false);


  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    listDepartments()
      .then(setDepartments)
      .catch(() => toast.error("Không tải được danh sách khoa"));
  }, []);

  useEffect(() => {
    listPrograms(departmentId || undefined).then(setPrograms).catch(() => toast.error("Không tải được danh sách ngành"));
  }, [departmentId]);

  useEffect(() => {
    let mounted = true;
    listStudentCohorts({
      departmentId: departmentId || undefined,
      programId: programId || undefined,
      academicStatus: academicStatus || undefined,
      search: searchDebounced || undefined,
    })
      .then((items) => {
        if (!mounted) return;
        const normalized = Array.isArray(items) ? items : [];
        setCohortOptions(normalized);
        setCohort((current) => (current && normalized.includes(current) ? current : ""));
      })
      .catch(() => toast.error("Không tải được danh sách khóa"));

    return () => {
      mounted = false;
    };
  }, [departmentId, programId, academicStatus, searchDebounced]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listStudents({
      departmentId: departmentId || undefined,
      programId: programId || undefined,
      cohort: cohort || undefined,
      academicStatus: academicStatus || undefined,
      search: searchDebounced || undefined,
      page,
      size,
      sort: "studentCode,asc",
    })
      .then((payload) => {
        if (!mounted) return;
        setPageData(normalizePage(payload));
        setRows(normalizePage(payload).content || []);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [departmentId, programId, cohort, academicStatus, searchDebounced, page, size]);

  const handleToggleAll = (checked) => {
    setSelectedIds(checked ? rows.map((row) => row.studentId) : []);
  };

  const handleToggleRow = (studentId) => {
    setSelectedIds((current) => (current.includes(studentId) ? current.filter((item) => item !== studentId) : [...current, studentId]));
  };

  const clearStudentFiltersForSearch = () => {
    setDepartmentId("");
    setProgramId("");
    setCohort("");
    setAcademicStatus("");
    setPage(0);
  };

  const openStatusDialog = (studentIds, nextStatus) => {
    setStatusDialog({ open: true, studentIds, nextStatus });
  };

  const handleStatusConfirm = async () => {
    try {
      if (statusDialog.studentIds.length > 1) {
        await batchUpdateStudentStatus(statusDialog.studentIds, statusDialog.nextStatus);
      } else {
        await updateStudentStatus(statusDialog.studentIds[0], statusDialog.nextStatus);
      }
      toast.success("Đã cập nhật trạng thái sinh viên");
      setSelectedIds([]);
      setStatusDialog({ open: false, studentIds: [], nextStatus: "" });
      const payload = await listStudents({
        departmentId: departmentId || undefined,
        programId: programId || undefined,
        cohort: cohort || undefined,
        academicStatus: academicStatus || undefined,
        search: searchDebounced || undefined,
        page,
        size,
        sort: "studentCode,asc",
      });
      const normalized = normalizePage(payload);
      setPageData(normalized);
      setRows(normalized.content || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleImportFile = async (file) => {
    setImportFile(file);
    setImportResult(null);
    if (file?.name.toLowerCase().endsWith(".csv")) {
      const preview = await parseCsvPreview(file);
      setImportPreview(preview.preview);
    } else {
      setImportPreview([]);
    }
  };

  const closeImportDialog = () => {
    setImportOpen(false);
    setImportFile(null);
    setImportPreview([]);
    setImportResult(null);
  };

  const primaryButtonSx = {
    backgroundColor: "#1E3A8A",
    borderRadius: "10px",
    textTransform: "none",
    fontWeight: 600,
    "&:hover": { backgroundColor: "#1A3378" },
  };

  const handleSubmitImport = async () => {
    if (!importFile) {
      toast.error("Vui lòng chọn file import");
      return;
    }
    setImportLoading(true);
    try {
      const result = await importStudents(importFile);
      setImportResult(result);
      if (result?.failed && result.failed > 0) {
        toast.error(describeImportFailure(result, "sinh viên"));
      } else {
        toast.success("Import sinh viên thành công");
        setImportFile(null);
        setImportPreview([]);
        closeImportDialog();
        const payload = await listStudents({
          departmentId: departmentId || undefined,
          programId: programId || undefined,
          cohort: cohort || undefined,
          academicStatus: academicStatus || undefined,
          search: searchDebounced || undefined,
          page,
          size,
          sort: "studentCode,asc",
        });
        const normalized = normalizePage(payload);
        setPageData(normalized);
        setRows(normalized.content || []);
      }
    } catch (error) {
      toast.error(describeImportError(error));
    } finally {
      setImportLoading(false);
    }
  };



  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Quản lý sinh viên"
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="contained" sx={primaryButtonSx} startIcon={<FileUp size={16} />} onClick={() => setImportOpen(true)}>Import sinh viên</Button>
          </Stack>
        }
      />

      <Paper className="p-4 rounded-lg border border-[#1E3A8A]/15" elevation={0}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
            <TextField fullWidth size="small" label="Tìm theo tên hoặc mã sinh viên" value={search} onFocus={clearStudentFiltersForSearch} onClick={clearStudentFiltersForSearch} onChange={(event) => setSearch(event.target.value)} InputProps={{ startAdornment: <Search className="mr-2" size={16} /> }} />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Khóa</InputLabel>
              <Select value={cohort} label="Khóa" onChange={(event) => setCohort(event.target.value)}>
                <MenuItem value="">Tất cả</MenuItem>
                {cohortOptions.map((item) => (
                  <MenuItem key={item} value={item}>
                    {cohortPrefixToLabel(item)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Khoa</InputLabel>
              <Select value={departmentId} label="Khoa" onChange={(event) => { setDepartmentId(event.target.value); setProgramId(""); }}>
                <MenuItem value="">Tất cả</MenuItem>
                {departments.map((department) => <MenuItem key={department.departmentId} value={department.departmentId}>{department.departmentName}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Ngành</InputLabel>
              <Select value={programId} label="Ngành" onChange={(event) => setProgramId(event.target.value)}>
                <MenuItem value="">Tất cả</MenuItem>
                {programs.map((program) => <MenuItem key={program.programId} value={program.programId}>{program.programName}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select value={academicStatus} label="Trạng thái" onChange={(event) => setAcademicStatus(event.target.value)}>
                {academicStatusOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
          <Box display="flex" alignItems="center" gap={1} color="text.secondary">
            <Filter size={16} />
            <Typography variant="body2">{pageData.totalElements} sinh viên</Typography>
          </Box>
        </Stack>
      </Paper>

      {selectedIds.length > 0 ? (
        <Alert severity="info" action={<Button color="inherit" onClick={() => openStatusDialog(selectedIds, "STUDYING")}>Đổi trạng thái hàng loạt</Button>}>
          Đã chọn {selectedIds.length} sinh viên.
        </Alert>
      ) : null}

      <Paper className="rounded-lg border border-[#1E3A8A]/15 overflow-hidden" elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox"><input type="checkbox" checked={rows.length > 0 && selectedIds.length === rows.length} onChange={(event) => handleToggleAll(event.target.checked)} /></TableCell>
              <TableCell>STT</TableCell>
              <TableCell>Mã SV</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Ngành</TableCell>
              <TableCell>Khoa</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? Array.from({ length: 5 }).map((_, index) => <TableRow key={index}><TableCell colSpan={10}><Skeleton height={48} /></TableCell></TableRow>) : rows.map((student, index) => (
              <TableRow key={student.studentId} hover>
                <TableCell padding="checkbox"><input type="checkbox" checked={selectedIds.includes(student.studentId)} onChange={() => handleToggleRow(student.studentId)} /></TableCell>
                <TableCell>{page * size + index + 1}</TableCell>
                <TableCell>{student.studentCode}</TableCell>
                <TableCell>
                  <Stack>
                    <Typography variant="body2" fontWeight={600}>{student.fullName}</Typography>
                    <Typography variant="caption" color="text.secondary">{student.email}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>{student.programName || "-"}</TableCell>
                <TableCell>{student.departmentName || "-"}</TableCell>
                <TableCell>{student.address || "-"}</TableCell>
                <TableCell><Chip size="small" label={statusLabelMap[student.academicStatus]?.label || student.academicStatus} color={statusLabelMap[student.academicStatus]?.color || "default"} /></TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Tooltip title="Xem chi tiết"><IconButton onClick={() => navigate(`/admin/students/${student.studentId}`)}><Eye size={16} /></IconButton></Tooltip>
                    <Tooltip title="Đổi trạng thái"><IconButton onClick={() => openStatusDialog([student.studentId], student.academicStatus === "studying" ? "PAUSED" : "STUDYING")}>{student.accountStatus === "active" ? <ShieldCheck size={16} /> : <ShieldOff size={16} />}</IconButton></Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination component="div" count={pageData.totalElements} page={pageData.page} rowsPerPage={size} rowsPerPageOptions={[10, 20, 50]} onPageChange={(_, nextPage) => setPage(nextPage)} onRowsPerPageChange={(event) => { setSize(Number(event.target.value)); setPage(0); }} />
      </Paper>

      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, studentIds: [], nextStatus: "" })} fullWidth maxWidth="sm">
        <DialogTitle>Đổi trạng thái sinh viên</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn đổi trạng thái {statusDialog.studentIds.length > 1 ? `${statusDialog.studentIds.length} sinh viên` : "sinh viên này"} sang <strong>{academicStatusOptions.find((item) => item.value === statusDialog.nextStatus)?.label || statusDialog.nextStatus}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, studentIds: [], nextStatus: "" })}>Hủy</Button>
          <Button variant="contained" sx={primaryButtonSx} onClick={handleStatusConfirm}>Xác nhận</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importOpen} onClose={importLoading ? undefined : closeImportDialog} fullWidth maxWidth="md" disableEscapeKeyDown={importLoading}>
        <DialogTitle>Import sinh viên</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">Upload file dữ liệu sinh viên để hệ thống import và báo lỗi theo từng dòng nếu có.</Typography>
          <Button variant="contained" sx={primaryButtonSx} component="label" startIcon={<FileUp size={16} />} disabled={importLoading}>
            Chọn file import
            <input type="file" hidden accept=".csv,.xlsx" onChange={(event) => handleImportFile(event.target.files?.[0] || null)} disabled={importLoading} />
          </Button>
          {importFile ? <Alert severity="info">File đã chọn: {importFile.name}</Alert> : null}
          {importPreview.length > 0 ? (
            <Box>
              <Typography variant="subtitle2" gutterBottom>Xem trước CSV</Typography>
              <Paper variant="outlined" sx={{ p: 2, overflowX: "auto" }}>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(importPreview, null, 2)}</pre>
              </Paper>
            </Box>
          ) : null}
          {importResult ? (
            <Stack spacing={1}>
              <Alert severity={importResult.failed > 0 ? "error" : "success"}>
                Đã import {importResult.success} sinh viên thành công, {importResult.failed} bản ghi lỗi.
              </Alert>
              {importResult.failed > 0 && Array.isArray(importResult.errors) ? (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Lỗi dữ liệu</Typography>
                  <Stack spacing={1}>
                    {importResult.errors.slice(0, 10).map((item, index) => (
                      <Alert key={`${item.row}-${item.field}-${index}`} severity="warning" variant="outlined">
                        Dòng {item.row}: {item.field} - {item.message}
                      </Alert>
                    ))}
                  </Stack>
                </Box>
              ) : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeImportDialog} disabled={importLoading}>Đóng</Button>
          <Button variant="contained" sx={primaryButtonSx} onClick={handleSubmitImport} disabled={importLoading}>Xác nhận import</Button>
        </DialogActions>
      </Dialog>

      <Backdrop
        open={importLoading}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.modal + 2,
          backgroundColor: "rgba(15, 23, 42, 0.5)",
          backdropFilter: "blur(2px)",
        }}
      >
        <Stack spacing={1.5} alignItems="center">
          <CircularProgress color="inherit" />
          <Typography variant="body2" fontWeight={600}>
            Đang import dữ liệu...
          </Typography>
        </Stack>
      </Backdrop>
    </div>
  );
}