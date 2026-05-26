import { useEffect, useState } from "react";
import {
  Alert, Backdrop, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Stack, Table,
  TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography,
} from "@mui/material";
import { toast } from "sonner";
import { FileUp, Plus, Pencil, Trash2 } from "lucide-react";
import {
  listProgramCourses, listAvailableCourses, assignCourseToProgram,
  updateProgramCourse, removeProgramCourse, listPrograms, listDepartments,
  importProgramCourses,
} from "../../../../services/adminApi";

const btnSx = { backgroundColor: "#1E3A8A", borderRadius: "10px", textTransform: "none", fontWeight: 600, "&:hover": { backgroundColor: "#1A3378" } };
const courseTypeLabels = {
  "bắt buộc chung": "Bắt buộc chung",
  "bắt buộc chung nhóm ngành": "Bắt buộc chung nhóm ngành",
  "cơ sở ngành": "Cơ sở ngành",
  "chuyên ngành": "Chuyên ngành",
  "thực tập": "Thực tập",
  "luận văn tốt nghiệp": "Luận văn tốt nghiệp",
};

const tableCellSx = {
  borderBottomColor: "#bfdbfe",
  color: "#4b5563",
  fontSize: 15,
  py: 1.35,
};

const headerCellSx = {
  ...tableCellSx,
  color: "#374151",
  fontWeight: 800,
  bgcolor: "#fff",
};

export function ProgramCourseTab() {
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [programId, setProgramId] = useState("");
  const [programCourses, setProgramCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // assign modal
  const [assignOpen, setAssignOpen] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [assignData, setAssignData] = useState({ courseId: "", recommendedSemester: "" });
  const [assignError, setAssignError] = useState("");

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editData, setEditData] = useState({ courseId: "", recommendedSemester: "" });

  // delete confirm
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });

  // import modal
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => { listDepartments().then(setDepartments).catch(() => {}); }, []);
  useEffect(() => { listPrograms(departmentId || undefined).then(setPrograms).catch(() => {}); }, [departmentId]);

  const fetchProgramCourses = () => {
    if (!programId) { setProgramCourses([]); return; }
    setLoading(true);
    listProgramCourses(programId).then(setProgramCourses).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  };
  useEffect(fetchProgramCourses, [programId]);

  const selectedProgram = programs.find((p) => String(p.programId) === String(programId));
  const totalAssigned = programCourses.reduce((s, c) => s + (c.credits || 0), 0);

  // Group by semester
  const grouped = {};
  programCourses.forEach((pc) => {
    const key = pc.recommendedSemester ? `Học kỳ ${pc.recommendedSemester}` : "Chưa xác định";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(pc);
  });
  const semesterKeys = Object.keys(grouped).sort((a, b) => {
    if (a === "Chưa xác định") return 1;
    if (b === "Chưa xác định") return -1;
    return a.localeCompare(b, undefined, { numeric: true });
  });

  const openAssign = async () => {
    if (!programId) { toast.error("Vui lòng chọn ngành trước"); return; }
    try {
      const available = await listAvailableCourses(programId);
      setAvailableCourses(available);
      setAssignData({ courseId: "", recommendedSemester: "" });
      setAssignError("");
      setAssignOpen(true);
    } catch (e) { toast.error(e.message); }
  };

  const handleAssign = async () => {
    if (!assignData.courseId) { setAssignError("Vui lòng chọn môn học"); return; }
    try {
      await assignCourseToProgram(programId, {
        courseId: Number(assignData.courseId),
        recommendedSemester: assignData.recommendedSemester ? Number(assignData.recommendedSemester) : null,
        isRequired: true,
      });
      toast.success("Đã gán môn vào ngành"); setAssignOpen(false); fetchProgramCourses();
    } catch (e) { setAssignError(e.message); }
  };

  const openEditItem = (item) => {
    setEditItem(item);
    setEditData({ courseId: item.courseId, recommendedSemester: item.recommendedSemester || "" });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    try {
      await updateProgramCourse(programId, editItem.programCourseId, {
        courseId: editItem.courseId,
        recommendedSemester: editData.recommendedSemester ? Number(editData.recommendedSemester) : null,
        isRequired: editItem.isRequired,
      });
      toast.success("Đã cập nhật"); setEditOpen(false); fetchProgramCourses();
    } catch (e) { toast.error(e.message); }
  };

  const handleRemoveConfirm = async () => {
    try {
      await removeProgramCourse(programId, deleteDialog.item.courseId);
      toast.success("Đã gỡ môn khỏi ngành"); setDeleteDialog({ open: false, item: null }); fetchProgramCourses();
    } catch (e) { toast.error(e.message); setDeleteDialog({ open: false, item: null }); }
  };

  const openImport = () => {
    if (!programId) { toast.error("Vui lòng chọn ngành trước"); return; }
    setImportFile(null);
    setImportResult(null);
    setImportOpen(true);
  };

  const handleImportSubmit = async () => {
    if (!importFile) { toast.error("Vui lòng chọn file"); return; }
    setImportLoading(true);
    try {
      const result = await importProgramCourses(programId, importFile);
      const importErrors = result?.errors || [];
      setImportResult(result);
      if (importErrors.length === 0) {
        fetchProgramCourses();
        toast.success(`Đã thêm ${result.inserted} môn vào chương trình đào tạo (bỏ qua ${result.skipped} môn đã tồn tại).`);
        setImportOpen(false);
        setImportFile(null);
        setImportResult(null);
      } else {
        toast.error(`File có ${importErrors.length} dòng lỗi. Không có môn nào được thêm.`);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      {/* Toolbar */}
      <Paper className="p-4 rounded-lg border border-[#1E3A8A]/15" elevation={0}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>Khoa</InputLabel>
              <Select value={departmentId} label="Khoa" onChange={(e) => { setDepartmentId(e.target.value); setProgramId(""); }}>
                <MenuItem value="">Tất cả</MenuItem>
                {departments.map((d) => <MenuItem key={d.departmentId} value={d.departmentId}>{d.departmentName}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 240 }}><InputLabel>Chọn ngành *</InputLabel>
              <Select value={programId} label="Chọn ngành *" onChange={(e) => setProgramId(e.target.value)}>
                <MenuItem value="">-- Chọn ngành --</MenuItem>
                {programs.map((p) => <MenuItem key={p.programId} value={p.programId}>{p.programName} ({p.programCode})</MenuItem>)}
              </Select>
            </FormControl>
            <Box flex={1} />
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" sx={btnSx} startIcon={<Plus size={14} />} onClick={openAssign} disabled={!programId}>Gán môn vào ngành</Button>
              <Tooltip title={!programId ? "Vui lòng chọn ngành trước" : ""}>
                <span>
                  <Button size="small" variant="outlined" startIcon={<FileUp size={14} />} onClick={openImport} disabled={!programId}>Import từ Excel</Button>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
          {selectedProgram && (
            <Stack direction="row" spacing={3}>
              <Typography variant="body2"><strong>Ngành:</strong> {selectedProgram.programName}</Typography>
              <Typography variant="body2"><strong>Tổng tín chỉ:</strong> {totalAssigned}</Typography>
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Grouped Tables */}
      {!programId ? (
        <Paper className="p-8 rounded-lg border border-[#1E3A8A]/15 text-center" elevation={0}>
          <Typography color="text.secondary">Vui lòng chọn ngành để xem chương trình đào tạo</Typography>
        </Paper>
      ) : loading ? (
        <Paper className="p-8 rounded-lg border text-center" elevation={0}><Typography>Đang tải...</Typography></Paper>
      ) : semesterKeys.length === 0 ? (
        <Paper className="p-8 rounded-lg border text-center" elevation={0}><Typography color="text.secondary">Chưa có môn học nào trong ngành</Typography></Paper>
      ) : (
        <Paper className="rounded-lg border border-[#1E3A8A]/15 overflow-hidden" elevation={0}>
          <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
            <colgroup>
              <col style={{ width: "72px" }} />
              <col style={{ width: "150px" }} />
              <col />
              <col style={{ width: "110px" }} />
              <col style={{ width: "260px" }} />
              <col style={{ width: "110px" }} />
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={headerCellSx}>STT</TableCell>
                <TableCell sx={headerCellSx}>Mã môn</TableCell>
                <TableCell sx={headerCellSx}>Tên môn học</TableCell>
                <TableCell align="center" sx={headerCellSx}>Tín chỉ</TableCell>
                <TableCell sx={headerCellSx}>Loại</TableCell>
                <TableCell align="right" sx={headerCellSx}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {semesterKeys.flatMap((semKey) => {
                const semesterTotal = grouped[semKey].reduce((sum, pc) => sum + (pc.credits || 0), 0);
                const semesterHeader = (
                  <TableRow key={`${semKey}-summary`}>
                    <TableCell colSpan={3} sx={{
                      ...tableCellSx,
                      bgcolor: "#eef2f7",
                      color: "#374151",
                      fontWeight: 800,
                      borderTop: "2px solid #38a8f2",
                    }}>
                      {semKey}
                    </TableCell>
                    <TableCell align="center" sx={{
                      ...tableCellSx,
                      bgcolor: "#eef2f7",
                      color: "#1d9bf0",
                      fontWeight: 900,
                      borderTop: "2px solid #38a8f2",
                    }}>
                      {semesterTotal} tín chỉ
                    </TableCell>
                    <TableCell colSpan={2} sx={{
                      ...tableCellSx,
                      bgcolor: "#eef2f7",
                      borderTop: "2px solid #38a8f2",
                    }} />
                  </TableRow>
                );
                const courseRows = grouped[semKey].map((pc, index) => (
                  <TableRow key={pc.programCourseId} hover>
                    <TableCell align="center" sx={tableCellSx}>{index + 1}</TableCell>
                    <TableCell sx={{ ...tableCellSx, fontWeight: 700 }}>{pc.courseCode}</TableCell>
                    <TableCell sx={{ ...tableCellSx, overflowWrap: "anywhere" }}>{pc.courseName}</TableCell>
                    <TableCell align="center" sx={{ ...tableCellSx, fontWeight: 700 }}>{pc.credits}</TableCell>
                    <TableCell sx={tableCellSx}>
                      <Chip size="small" label={courseTypeLabels[pc.courseType] || pc.courseType || "-"} color="default" />
                    </TableCell>
                    <TableCell align="right" sx={tableCellSx}>
                      <Tooltip title="Sửa"><IconButton size="small" onClick={() => openEditItem(pc)}><Pencil size={14} /></IconButton></Tooltip>
                      <Tooltip title="Gỡ khỏi ngành"><IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, item: pc })}><Trash2 size={14} /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ));
                return [semesterHeader, ...courseRows];
              })}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Gán môn vào ngành</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: "16px !important" }}>
          {assignError && <Alert severity="error">{assignError}</Alert>}
          <FormControl size="small"><InputLabel>Môn học</InputLabel>
            <Select value={assignData.courseId} label="Môn học" onChange={(e) => setAssignData({ ...assignData, courseId: e.target.value })}>
              {availableCourses.map((c) => <MenuItem key={c.courseId} value={c.courseId}>{c.courseCode} — {c.courseName} ({c.credits} tín chỉ)</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Học kỳ gợi ý" size="small" type="number" value={assignData.recommendedSemester} onChange={(e) => setAssignData({ ...assignData, recommendedSemester: e.target.value })} inputProps={{ min: 1, max: 10 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Hủy</Button>
          <Button variant="contained" sx={btnSx} onClick={handleAssign}>Gán</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Sửa phân bổ</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: "16px !important" }}>
          <TextField label="Học kỳ gợi ý" size="small" type="number" value={editData.recommendedSemester} onChange={(e) => setEditData({ ...editData, recommendedSemester: e.target.value })} inputProps={{ min: 1, max: 10 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Hủy</Button>
          <Button variant="contained" sx={btnSx} onClick={handleEdit}>Lưu</Button>
        </DialogActions>
      </Dialog>

      {/* Remove Confirm */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null })} maxWidth="xs">
        <DialogTitle>Xác nhận gỡ</DialogTitle>
        <DialogContent><Typography>Gỡ môn <strong>{deleteDialog.item?.courseCode}</strong> khỏi ngành?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, item: null })}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleRemoveConfirm}>Gỡ</Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importOpen} onClose={importLoading ? undefined : () => { setImportOpen(false); setImportFile(null); setImportResult(null); }} fullWidth maxWidth="md" disableEscapeKeyDown={importLoading}>
        <DialogTitle>Import Excel vào chương trình đào tạo</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: "16px !important" }}>
          <Typography variant="body2" color="text.secondary">File .xlsx gồm 4 cột: Học kỳ, Mã môn, Tên học phần, Số tín chỉ. Hệ thống dùng Mã môn và Học kỳ để gán môn, đồng thời kiểm tra Số tín chỉ phải khớp với dữ liệu đang lưu.</Typography>
          <Button variant="contained" sx={btnSx} component="label" startIcon={<FileUp size={16} />} disabled={importLoading}>
            Chọn file<input type="file" hidden accept=".xlsx" onChange={(e) => { setImportFile(e.target.files?.[0] || null); setImportResult(null); }} />
          </Button>
          {importFile && <Alert severity="info">File: {importFile.name}</Alert>}
          {importResult && (
            <Stack spacing={2}>
              {(importResult.errors || []).length > 0 ? (
                <Alert severity="error">
                  File có {(importResult.errors || []).length} dòng lỗi. Không có môn nào được thêm vào chương trình đào tạo.
                  {importResult.skipped > 0 ? ` Có ${importResult.skipped} môn đã tồn tại được bỏ qua khi kiểm tra.` : ""}
                </Alert>
              ) : (
                <Alert severity="success">
                  Đã thêm {importResult.inserted} môn, bỏ qua {importResult.skipped} môn đã tồn tại.
                </Alert>
              )}
              {(importResult.errors || []).length > 0 && (
                <Table size="small">
                  <TableHead>
                    <TableRow><TableCell>Dòng</TableCell><TableCell>Mã môn</TableCell><TableCell>Lý do lỗi</TableCell></TableRow>
                  </TableHead>
                  <TableBody>
                    {importResult.errors.map((err, index) => (
                      <TableRow key={`${err.row}-${err.course_code || index}`}>
                        <TableCell>{err.row}</TableCell>
                        <TableCell>{err.course_code || "-"}</TableCell>
                        <TableCell>{err.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
