import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
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
import { getLecturer, listDepartments, updateLecturer, updateLecturerStatus } from "../../../services/adminApi";

export function LecturerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lecturer, setLecturer] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(null);

  const loadLecturer = async () => {
    setLoading(true);
    try {
      const [lecturerPayload, departmentPayload] = await Promise.all([getLecturer(id), listDepartments()]);
      setLecturer(lecturerPayload);
      setDepartments(departmentPayload);
      setForm({
        fullName: lecturerPayload.fullName || "",
        phone: lecturerPayload.phone || "",
        academicTitle: lecturerPayload.academicTitle || "",
        departmentId: lecturerPayload.departmentId || "",
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLecturer();
  }, [id]);

  const handleSave = async () => {
    try {
      await updateLecturer(id, { ...form, departmentId: Number(form.departmentId) });
      toast.success("Đã cập nhật giảng viên");
      setEditOpen(false);
      await loadLecturer();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleStatus = async (status) => {
    try {
      await updateLecturerStatus(id, status);
      toast.success("Đã cập nhật trạng thái tài khoản");
      await loadLecturer();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading || !lecturer) {
    return <Skeleton height={420} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title={`Giảng viên ${lecturer.fullName}`}
        subtitle="Thông tin cá nhân, lớp phụ trách và quản lý tài khoản."
        actions={<Stack direction="row" spacing={1}><Button variant="outlined" onClick={() => navigate("/admin/lecturers")}>Quay lại danh sách</Button><Button variant="contained" onClick={() => setEditOpen(true)}>Chỉnh sửa</Button></Stack>}
      />

      <Paper className="p-6 rounded-2xl border border-slate-200" elevation={0}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
            <div>
              <Typography variant="h5" fontWeight={700}>{lecturer.fullName}</Typography>
              <Typography color="text.secondary">{lecturer.lecturerCode} · {lecturer.email}</Typography>
            </div>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => handleStatus(lecturer.accountStatus === "locked" ? "active" : "locked")}>{lecturer.accountStatus === "locked" ? "Mở khóa" : "Khóa"}</Button>
            </Stack>
          </Stack>
          <Typography>Chức danh: {lecturer.academicTitle || "-"}</Typography>
          <Typography>Khoa: {lecturer.departmentName || "-"}</Typography>
          <Typography>Email công tác: {lecturer.email}</Typography>
          <Typography>Trạng thái: {lecturer.accountStatus}</Typography>
        </Stack>
      </Paper>

      <Paper className="p-6 rounded-2xl border border-slate-200" elevation={0}>
        <Typography variant="h6" fontWeight={700} gutterBottom>Danh sách lớp học phần</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã lớp</TableCell>
              <TableCell>Môn học</TableCell>
              <TableCell>Học kỳ</TableCell>
              <TableCell>Năm học</TableCell>
              <TableCell>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(lecturer.sections || []).map((section) => (
              <TableRow key={section.sectionId}>
                <TableCell>{section.sectionCode}</TableCell>
                <TableCell>{section.courseCode} - {section.courseName}</TableCell>
                <TableCell>{section.semesterName}</TableCell>
                <TableCell>{section.academicYear}</TableCell>
                <TableCell>{section.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Chỉnh sửa giảng viên</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
          <TextField label="Họ và tên" value={form?.fullName || ""} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          <TextField label="Số điện thoại" value={form?.phone || ""} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <TextField label="Chức danh" value={form?.academicTitle || ""} onChange={(event) => setForm({ ...form, academicTitle: event.target.value })} />
          <FormControl>
            <InputLabel>Khoa</InputLabel>
            <Select value={form?.departmentId || ""} label="Khoa" onChange={(event) => setForm({ ...form, departmentId: event.target.value })}>
              {departments.map((department) => <MenuItem key={department.departmentId} value={department.departmentId}>{department.departmentName}</MenuItem>)}
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