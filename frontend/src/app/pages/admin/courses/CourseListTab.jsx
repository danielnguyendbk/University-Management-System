import { useEffect, useState } from "react";
import {
  Alert, Backdrop, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Drawer, FormControl, IconButton, InputLabel,
  MenuItem, Paper, Select, Skeleton, Stack, Table, TableBody, TableCell,
  TableHead, TablePagination, TableRow, TextField, Tooltip, Typography,
} from "@mui/material";
import { toast } from "sonner";
import { Eye, FileUp, Plus, Pencil, Trash2, Search, X } from "lucide-react";
import {
  listCourses, getCourse, createCourse, updateCourse, deleteCourse, importCourses,
} from "../../../../services/adminApi";

const COURSE_TYPES = [
  { value: "bắt buộc chung", label: "Bắt buộc chung", color: "primary" },
  { value: "bắt buộc chung nhóm ngành", label: "Bắt buộc chung nhóm ngành", color: "info" },
  { value: "cơ sở ngành", label: "Cơ sở ngành", color: "secondary" },
  { value: "chuyên ngành", label: "Chuyên ngành", color: "success" },
  { value: "thực tập", label: "Thực tập", color: "warning" },
  { value: "luận văn tốt nghiệp", label: "Luận văn tốt nghiệp", color: "error" },
];

const courseTypeLabels = Object.fromEntries(COURSE_TYPES.map((type) => [type.value, type.label]));
const courseTypeColors = Object.fromEntries(COURSE_TYPES.map((type) => [type.value, type.color]));

function normalizePage(p) {
  return p?.content ? p : { content: [], totalElements: 0, totalPages: 0, page: 0, size: 20 };
}

const btnSx = { backgroundColor: "#1E3A8A", borderRadius: "10px", textTransform: "none", fontWeight: 600, "&:hover": { backgroundColor: "#1A3378" } };

export function CourseListTab() {
  const [rows, setRows] = useState([]);
  const [pageData, setPageData] = useState({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 20 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [courseType, setCourseType] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  // form modal
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formData, setFormData] = useState({ courseCode: "", courseName: "", credits: 3, courseType: "bắt buộc chung", description: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // detail drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState(null);

  // import modal
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

  // delete confirm
  const [deleteDialog, setDeleteDialog] = useState({ open: false, course: null });

  useEffect(() => { const t = setTimeout(() => { setSearchDebounced(search); setPage(0); }, 400); return () => clearTimeout(t); }, [search]);
  const fetchData = () => {
    setLoading(true);
    listCourses({
      courseType: courseType || undefined,
      keyword: searchDebounced || undefined,
      page, size, sort: "courseCode,asc",
    }).then((p) => { const n = normalizePage(p); setPageData(n); setRows(n.content || []); })
      .catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  };

  useEffect(fetchData, [courseType, searchDebounced, page, size]);

  const openCreate = () => {
    setFormMode("create"); setEditingId(null); setFormError("");
    setFormData({ courseCode: "", courseName: "", credits: 3, courseType: "bắt buộc chung", description: "" });
    setFormOpen(true);
  };

  const openEdit = (c) => {
    setFormMode("edit"); setEditingId(c.courseId); setFormError("");
    setFormData({ courseCode: c.courseCode, courseName: c.courseName, credits: c.credits, courseType: c.courseType, description: c.description || "" });
    setFormOpen(true);
  };

  const handleFormSubmit = async () => {
    if (formMode === "create" && !formData.courseCode.trim()) { setFormError("Mã môn học không được để trống"); return; }
    if (!formData.courseName.trim()) { setFormError("Tên môn học không được để trống"); return; }
    if (formData.credits < 1) { setFormError("Số tín chỉ phải lớn hơn 0"); return; }
    setFormLoading(true); setFormError("");
    try {
      if (formMode === "create") {
        await createCourse(formData);
        toast.success("Tạo môn học thành công");
      } else {
        const { courseCode, ...updateBody } = formData;
        await updateCourse(editingId, updateBody);
        toast.success("Cập nhật môn học thành công");
      }
      setFormOpen(false); fetchData();
      if (detail && detail.courseId === editingId) { loadDetail(editingId); }
    } catch (e) { setFormError(e.message); toast.error(e.message); }
    finally { setFormLoading(false); }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCourse(deleteDialog.course.courseId);
      toast.success("Đã xóa môn học khỏi database");
      setDeleteDialog({ open: false, course: null });
      if (detail?.courseId === deleteDialog.course.courseId) {
        setDrawerOpen(false);
        setDetail(null);
      }
      fetchData();
    }
    catch (e) { toast.error(e.message); setDeleteDialog({ open: false, course: null }); }
  };

  const loadDetail = async (id) => {
    try {
      const d = await getCourse(id);
      setDetail(d); setDrawerOpen(true);
    } catch (e) { toast.error(e.message); }
  };

  const handleImportSubmit = async () => {
    if (!importFile) { toast.error("Vui lòng chọn file"); return; }
    setImportLoading(true);
    try {
      const r = await importCourses(importFile);
      setImportResult(r);
      if (r?.failCount > 0) { toast.error(`Import: ${r.successCount} thành công, ${r.failCount} lỗi`); }
      else { toast.success("Import thành công"); setImportOpen(false); setImportFile(null); setImportResult(null); fetchData(); }
    } catch (e) {
      if (e.status === 409 && e.payload?.error === "DUPLICATE_FOUND") {
        setImportResult({ duplicateError: true, message: e.payload.message, duplicates: e.payload.duplicates || [] });
      } else if (e.payload?.errors) {
        setImportResult({ failCount: e.payload.errors.length, successCount: 0, errors: e.payload.errors });
      }
      toast.error(e.message);
    } finally { setImportLoading(false); }
  };

  return (
    <Stack spacing={2}>
      {/* Toolbar */}
      <Paper className="p-4 rounded-lg border border-[#1E3A8A]/15" elevation={0}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
            <TextField fullWidth size="small" label="Tìm theo tên hoặc mã môn" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <Search className="mr-2" size={16} /> }} />
            <FormControl size="small" sx={{ minWidth: 140 }}><InputLabel>Loại</InputLabel>
              <Select value={courseType} label="Loại" onChange={(e) => setCourseType(e.target.value)}>
                <MenuItem value="">Tất cả</MenuItem>
                {COURSE_TYPES.map((type) => <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" variant="outlined" startIcon={<FileUp size={14} />} onClick={() => { setImportOpen(true); setImportFile(null); setImportResult(null); }}>Import Excel</Button>
            <Button size="small" variant="contained" sx={btnSx} startIcon={<Plus size={14} />} onClick={openCreate}>Thêm môn học</Button>
          </Stack>
          <Typography variant="body2" color="text.secondary">{pageData.totalElements} môn học</Typography>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper className="rounded-lg border border-[#1E3A8A]/15 overflow-hidden" elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã môn</TableCell><TableCell>Tên môn</TableCell><TableCell>Số TC</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton height={48} /></TableCell></TableRow>) :
              rows.map((c) => (
                <TableRow key={c.courseId} hover>
                  <TableCell>{c.courseCode}</TableCell>
                  <TableCell><Typography variant="body2" fontWeight={600} sx={{ cursor: "pointer", "&:hover": { color: "#1E3A8A" } }} onClick={() => loadDetail(c.courseId)}>{c.courseName}</Typography></TableCell>
                  <TableCell>{c.credits}</TableCell>
                  <TableCell><Chip size="small" label={courseTypeLabels[c.courseType] || c.courseType} color={courseTypeColors[c.courseType] || "default"} /></TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                      <Tooltip title="Chi tiết"><IconButton size="small" onClick={() => loadDetail(c.courseId)}><Eye size={16} /></IconButton></Tooltip>
                      <Tooltip title="Sửa"><IconButton size="small" onClick={() => openEdit(c)}><Pencil size={16} /></IconButton></Tooltip>
                      <Tooltip title="Xóa"><IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, course: c })}><Trash2 size={16} /></IconButton></Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination component="div" count={pageData.totalElements} page={pageData.page} rowsPerPage={size} rowsPerPageOptions={[10, 20, 50]} onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={(e) => { setSize(Number(e.target.value)); setPage(0); }} />
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onClose={() => !formLoading && setFormOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{formMode === "create" ? "Thêm môn học" : "Sửa môn học"}</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: "16px !important" }}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField label="Mã môn học" size="small" value={formData.courseCode} disabled={formMode === "edit"} onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })} />
          <TextField label="Tên môn học" size="small" value={formData.courseName} onChange={(e) => setFormData({ ...formData, courseName: e.target.value })} />
          <TextField label="Số tín chỉ" size="small" type="number" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })} inputProps={{ min: 1 }} />
          <FormControl size="small"><InputLabel>Loại môn</InputLabel>
            <Select value={formData.courseType} label="Loại môn" onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}>
              {COURSE_TYPES.map((type) => <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Mô tả" size="small" multiline rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)} disabled={formLoading}>Hủy</Button>
          <Button variant="contained" sx={btnSx} onClick={handleFormSubmit} disabled={formLoading}>{formMode === "create" ? "Tạo" : "Lưu"}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, course: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            <Alert severity="warning">Thao tác này sẽ xóa môn học khỏi database và không thể hoàn tác.</Alert>
            <Typography>Bạn có chắc muốn xóa môn <strong>{deleteDialog.course?.courseCode}</strong> - <strong>{deleteDialog.course?.courseName}</strong>?</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, course: null })}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>Xóa khỏi database</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: { xs: "100%", sm: 480 } } }}>
        {detail && (
          <Box p={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">{detail.courseCode} — {detail.courseName}</Typography>
              <IconButton onClick={() => setDrawerOpen(false)}><X size={20} /></IconButton>
            </Stack>
            <Stack spacing={1.5} mb={3}>
              <Typography variant="body2"><strong>Số tín chỉ:</strong> {detail.credits}</Typography>
              <Typography variant="body2"><strong>Loại:</strong> {courseTypeLabels[detail.courseType] || detail.courseType}</Typography>
              {detail.description && <Typography variant="body2"><strong>Mô tả:</strong> {detail.description}</Typography>}
            </Stack>
          </Box>
        )}
      </Drawer>

      {/* Import Dialog */}
      <Dialog open={importOpen} onClose={importLoading ? undefined : () => { setImportOpen(false); setImportFile(null); setImportResult(null); }} fullWidth maxWidth="md" disableEscapeKeyDown={importLoading}>
        <DialogTitle>Import môn học từ Excel</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: "16px !important" }}>
          <Typography variant="body2" color="text.secondary">Upload file .xlsx theo mẫu. Nếu phát hiện mã môn trùng, hệ thống sẽ không thêm bất kỳ môn nào.</Typography>
          <Button variant="contained" sx={btnSx} component="label" startIcon={<FileUp size={16} />} disabled={importLoading}>
            Chọn file<input type="file" hidden accept=".xlsx" onChange={(e) => { setImportFile(e.target.files?.[0] || null); setImportResult(null); }} />
          </Button>
          {importFile && <Alert severity="info">File: {importFile.name}</Alert>}
          {importResult && (
            <Stack spacing={1}>
              {importResult.duplicateError ? (
                <Alert severity="error">
                  {importResult.message}<br />
                  Mã trùng: {(importResult.duplicates || []).join(", ")}
                </Alert>
              ) : (
                <Alert severity={importResult.failCount > 0 ? "warning" : "success"}>Thành công: {importResult.successCount}, Lỗi: {importResult.failCount}</Alert>
              )}
              {importResult.failCount > 0 && (importResult.errors || []).slice(0, 20).map((err, i) => (
                <Alert key={i} severity="error" variant="outlined">Dòng {err.row}: [{err.field}] {err.message}</Alert>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setImportOpen(false); setImportFile(null); setImportResult(null); }} disabled={importLoading}>Đóng</Button>
          <Button variant="contained" sx={btnSx} onClick={handleImportSubmit} disabled={importLoading}>Import</Button>
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
    </Stack>
  );
}
