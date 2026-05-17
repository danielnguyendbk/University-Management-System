import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
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
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "sonner";
import { PageHeader } from "../../components/common/PageHeader";
import { getStudent, listDepartments, listPrograms, updateStudent, updateStudentStatus } from "../../../services/adminApi";

const academicStatusOptions = ["STUDYING", "PAUSED", "DROPPED_OUT", "GRADUATED"];

export function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(null);

  const loadStudent = async () => {
    setLoading(true);
    try {
      const [studentPayload, departmentPayload] = await Promise.all([getStudent(id), listDepartments()]);
      setStudent(studentPayload);
      setDepartments(departmentPayload);
      setPrograms(await listPrograms(studentPayload?.departmentId));
      setForm({
        fullName: studentPayload.fullName || "",
        dateOfBirth: studentPayload.dateOfBirth || "",
        gender: studentPayload.gender || "",
        phone: studentPayload.phone || "",
        address: studentPayload.address || "",
        programId: studentPayload.programId || "",
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudent();
  }, [id]);

  const handleProgramChange = async (departmentId) => {
    setForm((current) => ({ ...current, programId: "" }));
    setPrograms(await listPrograms(departmentId));
  };

  const handleSave = async () => {
    try {
      await updateStudent(id, { ...form, programId: Number(form.programId) });
      toast.success("Đã cập nhật sinh viên");
      setEditOpen(false);
      await loadStudent();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleStatusChange = async (academicStatus) => {
    try {
      await updateStudentStatus(id, academicStatus);
      toast.success("Đã đổi trạng thái sinh viên");
      await loadStudent();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading || !student) {
    return <Skeleton height={420} />;
  }

  const statusLabel = student.academicStatus;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title={`Sinh viên ${student.fullName}`}
        subtitle="Thông tin chi tiết, lịch sử trạng thái và thao tác chỉnh sửa hồ sơ."
        actions={<Stack direction="row" spacing={1}><Button variant="outlined" onClick={() => navigate("/admin/students")}>Quay lại danh sách</Button><Button variant="contained" onClick={() => setEditOpen(true)}>Chỉnh sửa</Button></Stack>}
      />

      <Paper className="p-6 rounded-2xl border border-slate-200" elevation={0}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
            <div>
              <Typography variant="h5" fontWeight={700}>{student.fullName}</Typography>
              <Typography color="text.secondary">{student.studentCode} · {student.email}</Typography>
            </div>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={statusLabel} color="primary" />
              <Chip label={student.accountStatus} color={student.accountStatus === "active" ? "success" : "default"} />
            </Stack>
          </Stack>
          <Alert severity="info">Địa chỉ {student.address || "-"} · Ngành {student.programName || "-"} · Khoa {student.departmentName || "-"}</Alert>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {academicStatusOptions.map((item) => <Button key={item} variant={item === student.academicStatus?.toUpperCase() ? "contained" : "outlined"} onClick={() => handleStatusChange(item)}>{item}</Button>)}
          </Stack>
        </Stack>
      </Paper>

      <Paper className="p-6 rounded-2xl border border-slate-200" elevation={0}>
        <Typography variant="h6" fontWeight={700} gutterBottom>Hồ sơ</Typography>
        <Stack spacing={1}>
          <Typography>Mã SV: {student.studentCode}</Typography>
          <Typography>Họ tên: {student.fullName}</Typography>
          <Typography>Email: {student.email}</Typography>
          <Typography>Số điện thoại: {student.phone || "-"}</Typography>
          <Typography>Địa chỉ: {student.address || "-"}</Typography>
        </Stack>
      </Paper>

      <Paper className="p-6 rounded-2xl border border-slate-200" elevation={0}>
        <Typography variant="h6" fontWeight={700} gutterBottom>Lịch sử đổi trạng thái</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Thời gian</TableCell>
              <TableCell>Trạng thái cũ</TableCell>
              <TableCell>Trạng thái mới</TableCell>
              <TableCell>Ghi chú</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(student.statusHistory || []).map((item) => (
              <TableRow key={item.historyId}>
                <TableCell>{item.changedAt}</TableCell>
                <TableCell>{item.oldStatus || "-"}</TableCell>
                <TableCell>{item.newStatus}</TableCell>
                <TableCell>{item.note || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Chỉnh sửa sinh viên</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
          <TextField label="Họ tên" value={form?.fullName || ""} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          <TextField label="Ngày sinh" type="date" value={form?.dateOfBirth || ""} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} InputLabelProps={{ shrink: true }} />
          <FormControl>
            <InputLabel>Giới tính</InputLabel>
            <Select value={form?.gender || ""} label="Giới tính" onChange={(event) => setForm({ ...form, gender: event.target.value })}>
              <MenuItem value="male">male</MenuItem>
              <MenuItem value="female">female</MenuItem>
              <MenuItem value="other">other</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Số điện thoại" value={form?.phone || ""} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <TextField label="Địa chỉ" value={form?.address || ""} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          <FormControl>
            <InputLabel>Ngành</InputLabel>
            <Select value={form?.programId || ""} label="Ngành" onChange={(event) => setForm({ ...form, programId: event.target.value })}>
              {programs.map((program) => <MenuItem key={program.programId} value={program.programId}>{program.programName}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}