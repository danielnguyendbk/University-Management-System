import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  CircularProgress,
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
import { Eye, FileUp, Filter, Lock, LockOpen, Plus, Search } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import {
  createLecturer,
  importLecturers,
  listDepartments,
  listLecturers,
  updateLecturerStatus,
} from "../../../services/adminApi";

const academicTitleOptions = ["Thạc sĩ", "Tiến sĩ", "Phó giáo sư", "Giáo sư"];

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

export function ManageLecturerAccounts() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [rows, setRows] = useState([]);
  const [pageData, setPageData] = useState({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 20 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [academicTitle, setAcademicTitle] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ lecturerCode: "", fullName: "", academicTitle: "", departmentId: "", phone: "" });
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [accountDialog, setAccountDialog] = useState({ open: false, lecturerId: null, status: "active" });

  const primaryButtonSx = {
    backgroundColor: "#1E3A8A",
    borderRadius: "10px",
    textTransform: "none",
    fontWeight: 600,
    "&:hover": { backgroundColor: "#1A3378" },
  };

  const outlinedButtonSx = {
    color: "#1E3A8A",
    borderColor: "#1E3A8A",
    borderRadius: "10px",
    textTransform: "none",
    fontWeight: 600,
    "&:hover": { borderColor: "#1A3378", backgroundColor: "rgba(30, 58, 138, 0.06)" },
  };

  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    listDepartments().then(setDepartments).catch(() => toast.error("Không tải được danh sách khoa"));
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listLecturers({
      departmentId: departmentId || undefined,
      academicTitle: academicTitle || undefined,
      accountStatus: accountStatus || undefined,
      search: searchDebounced || undefined,
      page,
      size,
      sort: "lecturerCode,asc",
    })
      .then((payload) => {
        if (!mounted) return;
        const normalized = normalizePage(payload);
        setPageData(normalized);
        setRows(normalized.content || []);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [departmentId, academicTitle, accountStatus, searchDebounced, page, size]);

  const handleCreateLecturer = async () => {
    try {
      await createLecturer({ ...createForm, departmentId: Number(createForm.departmentId) });
      toast.success("Đã tạo giảng viên mới");
      setCreateOpen(false);
      setCreateForm({ lecturerCode: "", fullName: "", academicTitle: "", departmentId: "", phone: "" });
      const payload = await listLecturers({ departmentId: departmentId || undefined, academicTitle: academicTitle || undefined, accountStatus: accountStatus || undefined, search: searchDebounced || undefined, page, size, sort: "lecturerCode,asc" });
      const normalized = normalizePage(payload);
      setPageData(normalized);
      setRows(normalized.content || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const clearLecturerFiltersForSearch = () => {
    setDepartmentId("");
    setAcademicTitle("");
    setAccountStatus("");
    setPage(0);
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Vui lòng chọn file import");
      return;
    }
    setImportLoading(true);
    try {
      const result = await importLecturers(importFile);
      setImportResult(result);
      if (result?.failed && result.failed > 0) {
        toast.error(describeImportFailure(result, "giảng viên"));
      } else {
        toast.success("Import giảng viên thành công");
        closeImportDialog();
      }
      const payload = await listLecturers({ departmentId: departmentId || undefined, academicTitle: academicTitle || undefined, accountStatus: accountStatus || undefined, search: searchDebounced || undefined, page, size, sort: "lecturerCode,asc" });
      const normalized = normalizePage(payload);
      setPageData(normalized);
      setRows(normalized.content || []);
    } catch (error) {
      toast.error(describeImportError(error));
    } finally {
      setImportLoading(false);
    }
  };

  const closeImportDialog = () => {
    setImportOpen(false);
    setImportFile(null);
    setImportResult(null);
  };

  const handleAccountStatus = async () => {
    try {
      await updateLecturerStatus(accountDialog.lecturerId, accountDialog.status);
      toast.success("Đã cập nhật trạng thái tài khoản");
      setAccountDialog({ open: false, lecturerId: null, status: "active" });
      const payload = await listLecturers({ departmentId: departmentId || undefined, academicTitle: academicTitle || undefined, accountStatus: accountStatus || undefined, search: searchDebounced || undefined, page, size, sort: "lecturerCode,asc" });
      const normalized = normalizePage(payload);
      setPageData(normalized);
      setRows(normalized.content || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Quản lý giảng viên"
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" sx={outlinedButtonSx} startIcon={<FileUp size={16} />} onClick={() => setImportOpen(true)}>Import file</Button>
            <Button variant="contained" sx={primaryButtonSx} startIcon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>Thêm giảng viên</Button>
          </Stack>
        }
      />

      <Paper className="rounded-lg border border-[#1E3A8A]/15 bg-white/90 p-4 shadow-[0_16px_40px_rgba(30,58,138,0.06)]" elevation={0}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
            <TextField fullWidth size="small" label="Tìm theo tên hoặc mã giảng viên" value={search} onFocus={clearLecturerFiltersForSearch} onClick={clearLecturerFiltersForSearch} onChange={(event) => setSearch(event.target.value)} InputProps={{ startAdornment: <Search className="mr-2" size={16} /> }} />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Khoa</InputLabel>
              <Select value={departmentId} label="Khoa" onChange={(event) => setDepartmentId(event.target.value)}>
                <MenuItem value="">Tất cả</MenuItem>
                {departments.map((department) => <MenuItem key={department.departmentId} value={department.departmentId}>{department.departmentName}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Chức danh</InputLabel>
              <Select value={academicTitle} label="Chức danh" onChange={(event) => setAcademicTitle(event.target.value)}>
                <MenuItem value="">Tất cả</MenuItem>
                {academicTitleOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Trạng thái tài khoản</InputLabel>
              <Select value={accountStatus} label="Trạng thái tài khoản" onChange={(event) => setAccountStatus(event.target.value)}>
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="active">active</MenuItem>
                <MenuItem value="inactive">inactive</MenuItem>
                <MenuItem value="locked">locked</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Box display="flex" alignItems="center" gap={1} color="text.secondary">
            <Filter size={16} />
            <Typography variant="body2">{pageData.totalElements} giảng viên</Typography>
          </Box>
        </Stack>
      </Paper>

      <Paper className="overflow-hidden rounded-lg border border-[#1E3A8A]/15 bg-white/95 shadow-[0_16px_40px_rgba(30,58,138,0.06)]" elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Mã GV</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Chức danh</TableCell>
              <TableCell>Khoa</TableCell>
              <TableCell>Email công tác</TableCell>
              <TableCell>Trạng thái tài khoản</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? Array.from({ length: 5 }).map((_, index) => <TableRow key={index}><TableCell colSpan={8}><Skeleton height={48} /></TableCell></TableRow>) : rows.map((lecturer, index) => (
              <TableRow key={lecturer.lecturerId} hover>
                <TableCell>{page * size + index + 1}</TableCell>
                <TableCell>{lecturer.lecturerCode}</TableCell>
                <TableCell>{lecturer.fullName}</TableCell>
                <TableCell>{lecturer.academicTitle || "-"}</TableCell>
                <TableCell>{lecturer.departmentName || "-"}</TableCell>
                <TableCell>{lecturer.email}</TableCell>
                <TableCell><Chip size="small" label={lecturer.accountStatus} color={lecturer.accountStatus === "locked" ? "error" : lecturer.accountStatus === "inactive" ? "warning" : "success"} /></TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Tooltip title="Xem chi tiết"><IconButton onClick={() => navigate(`/admin/lecturers/${lecturer.lecturerId}`)}><Eye size={16} /></IconButton></Tooltip>
                    <Tooltip title="Khóa / mở khóa"><IconButton onClick={() => setAccountDialog({ open: true, lecturerId: lecturer.lecturerId, status: lecturer.accountStatus === "locked" ? "active" : "locked" })}>{lecturer.accountStatus === "locked" ? <LockOpen size={16} /> : <Lock size={16} />}</IconButton></Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination component="div" count={pageData.totalElements} page={pageData.page} rowsPerPage={size} rowsPerPageOptions={[10, 20, 50]} onPageChange={(_, nextPage) => setPage(nextPage)} onRowsPerPageChange={(event) => { setSize(Number(event.target.value)); setPage(0); }} />
      </Paper>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Thêm giảng viên</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
          <TextField label="Mã giảng viên" value={createForm.lecturerCode} onChange={(event) => setCreateForm({ ...createForm, lecturerCode: event.target.value })} />
          <TextField label="Họ và tên" value={createForm.fullName} onChange={(event) => setCreateForm({ ...createForm, fullName: event.target.value })} />
          <FormControl>
            <InputLabel shrink>Chức danh</InputLabel>
            <Select
              value={createForm.academicTitle}
              label="Chức danh"
              displayEmpty
              renderValue={(selected) => (
                <span style={{ color: selected ? "inherit" : "#6b7280" }}>
                  {selected || "Chọn chức danh"}
                </span>
              )}
              onChange={(event) => setCreateForm({ ...createForm, academicTitle: event.target.value })}
            >
              {academicTitleOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel shrink>Khoa</InputLabel>
            <Select
              value={createForm.departmentId}
              label="Khoa"
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: "#6b7280" }}>Chọn khoa</span>;
                }

                const selectedDepartment = departments.find((department) => String(department.departmentId) === String(selected));
                return selectedDepartment?.departmentName || "Chọn khoa";
              }}
              onChange={(event) => setCreateForm({ ...createForm, departmentId: event.target.value })}
            >
              {departments.map((department) => <MenuItem key={department.departmentId} value={department.departmentId}>{department.departmentName}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Số điện thoại" value={createForm.phone} onChange={(event) => setCreateForm({ ...createForm, phone: event.target.value })} />
          <Alert severity="info">Email và mật khẩu mặc định sẽ được hệ thống tự sinh theo mã giảng viên (viết thường). Khi đăng nhập lần đầu, tài khoản sẽ bị buộc đổi mật khẩu.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Hủy</Button>
          <Button variant="contained" sx={primaryButtonSx} onClick={handleCreateLecturer}>Lưu</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importOpen} onClose={importLoading ? undefined : closeImportDialog} fullWidth maxWidth="md" disableEscapeKeyDown={importLoading}>
        <DialogTitle>Import giảng viên</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
          <Button variant="contained" sx={primaryButtonSx} component="label" startIcon={<FileUp size={16} />} disabled={importLoading}>
            Chọn file import
            <input type="file" hidden accept=".csv,.xlsx" onChange={(event) => setImportFile(event.target.files?.[0] || null)} disabled={importLoading} />
          </Button>
          {importFile ? <Alert severity="info">File đã chọn: {importFile.name}</Alert> : null}
          {importResult ? (
            <Stack spacing={1}>
              <Alert severity={importResult.failed > 0 ? "error" : "success"}>
                Đã import {importResult.success} giảng viên thành công, {importResult.failed} bản ghi lỗi.
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
          <Button variant="contained" sx={primaryButtonSx} onClick={handleImport} disabled={importLoading}>Xác nhận import</Button>
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

      <Dialog open={accountDialog.open} onClose={() => setAccountDialog({ open: false, lecturerId: null, status: "active" })}>
        <DialogTitle>Đổi trạng thái tài khoản</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc muốn đổi trạng thái tài khoản sang <strong>{accountDialog.status}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccountDialog({ open: false, lecturerId: null, status: "active" })}>Hủy</Button>
          <Button variant="contained" sx={primaryButtonSx} onClick={handleAccountStatus}>Xác nhận</Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}