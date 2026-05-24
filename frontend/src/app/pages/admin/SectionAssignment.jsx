import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Divider,
  InputAdornment
} from "@mui/material";
import {
  Search,
  UserCheck,
  UserX,
  RefreshCw,
  Calendar,
  AlertCircle,
  HelpCircle,
  FileText
} from "lucide-react";
import { adminCourseSectionAssignmentApi } from "../../../api/adminCourseSectionAssignmentApi";
import { registrationApi } from "../../../api/registrationApi";

export function SectionAssignment() {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lecturersLoading, setLecturersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  // Filters and Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, UNASSIGNED, ASSIGNED
  const [classFilter, setClassFilter] = useState("ALL");

  // Assignment Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedLecturerId, setSelectedLecturerId] = useState("");
  const [applyToSessions, setApplyToSessions] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // 1. Get semesters
      const semesterRes = await registrationApi.admin.getSemesters();
      if (semesterRes.data.success) {
        const semesterList = semesterRes.data.data;
        setSemesters(semesterList);
        
        // Find active/newest semester
        if (semesterList.length > 0) {
          const newest = semesterList[0].semesterId;
          setSelectedSemesterId(newest);
          fetchAssignments(newest);
        }
      }
      
      // 2. Get lecturers dropdown options
      setLecturersLoading(true);
      const lecturerRes = await adminCourseSectionAssignmentApi.getLecturers();
      if (lecturerRes.data.success) {
        setLecturers(lecturerRes.data.data);
      }
    } catch (err) {
      console.error(err);
      setError("Không thể khởi tạo dữ liệu trang.");
    } finally {
      setLoading(false);
      setLecturersLoading(false);
    }
  };

  const fetchAssignments = async (semesterId) => {
    if (!semesterId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await adminCourseSectionAssignmentApi.getAssignments(semesterId);
      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Không thể tải danh sách phân công lớp học phần.";
      setError(msg);
      setNotification({ open: true, message: msg, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterChange = (e) => {
    const semId = e.target.value;
    setSelectedSemesterId(semId);
    fetchAssignments(semId);
  };

  const handleOpenAssignDialog = (section) => {
    setSelectedSection(section);
    setSelectedLecturerId(section.lecturerId || "");
    setApplyToSessions(true);
    setOpenDialog(true);
  };

  const handleSaveAssignment = async () => {
    if (!selectedLecturerId) {
      setNotification({ open: true, message: "Vui lòng chọn giảng viên.", severity: "warning" });
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        lecturerId: Number(selectedLecturerId),
        applyToGeneratedSessions: applyToSessions
      };
      
      const res = await adminCourseSectionAssignmentApi.assignLecturer(selectedSection.sectionId, payload);
      if (res.data.success) {
        setNotification({
          open: true,
          message: res.data.message || "Phân công giảng viên thành công.",
          severity: "success"
        });
        setOpenDialog(false);
        fetchAssignments(selectedSemesterId);
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Gán giảng viên thất bại.";
      setNotification({ open: true, message: errorMsg, severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnassignLecturer = async (section) => {
    const confirmMsg = `Bạn có chắc chắn muốn gỡ giảng viên khỏi lớp học phần ${section.sectionCode} (${section.courseName})?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      const res = await adminCourseSectionAssignmentApi.unassignLecturer(section.sectionId);
      if (res.data.success) {
        setNotification({
          open: true,
          message: res.data.message || "Đã gỡ giảng viên thành công.",
          severity: "success"
        });
        fetchAssignments(selectedSemesterId);
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Gỡ giảng viên thất bại.";
      setNotification({ open: true, message: errorMsg, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Extract unique administrative class codes for the filter dropdown
  const uniqueClassCodes = Array.from(
    new Set(assignments.map((a) => a.classCode).filter(Boolean))
  ).sort();

  // Filter assignments locally based on search term, status and class filters
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.sectionCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.lecturerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.lecturerCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ASSIGNED" && a.assignmentStatus === "ASSIGNED") ||
      (statusFilter === "UNASSIGNED" && a.assignmentStatus === "UNASSIGNED");

    const matchesClass = classFilter === "ALL" || a.classCode === classFilter;

    return matchesSearch && matchesStatus && matchesClass;
  });

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header section */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: "#1E3A8A" }}>
            Phân công Giảng viên
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gán và điều chỉnh giảng viên giảng dạy chính cho từng lớp học phần theo học kỳ
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshCw size={18} />}
          onClick={() => fetchAssignments(selectedSemesterId)}
          disabled={loading || !selectedSemesterId}
          sx={{ borderRadius: 2 }}
        >
          Làm mới
        </Button>
      </Box>

      {/* Main card */}
      <Paper elevation={1} sx={{ p: 3, borderRadius: 4, border: "1px solid #E2E8F0" }}>
        
        {/* Filters Toolbar */}
        <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
          {/* Semester Selector */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="semester-select-label">Học kỳ</InputLabel>
              <Select
                labelId="semester-select-label"
                value={selectedSemesterId}
                label="Học kỳ"
                onChange={handleSemesterChange}
                disabled={loading}
              >
                {semesters.map((s) => (
                  <MenuItem key={s.semesterId} value={s.semesterId}>
                    {s.semesterName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Class Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="class-select-label">Lớp hành chính</InputLabel>
              <Select
                labelId="class-select-label"
                value={classFilter}
                label="Lớp hành chính"
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <MenuItem value="ALL">Tất cả lớp</MenuItem>
                {uniqueClassCodes.map((code) => (
                  <MenuItem key={code} value={code}>
                    {code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-select-label">Trạng thái phân công</InputLabel>
              <Select
                labelId="status-select-label"
                value={statusFilter}
                label="Trạng thái phân công"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                <MenuItem value="UNASSIGNED">Chưa phân công</MenuItem>
                <MenuItem value="ASSIGNED">Đã phân công</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Search Field */}
          <Grid size={{ xs: 12, sm: 6, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm theo lớp học phần, tên môn học, tên giảng viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color="#94A3B8" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Loading Spinner */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={45} />
          </Box>
        ) : error ? (
          <Alert severity="error" variant="outlined" sx={{ my: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        ) : filteredAssignments.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
            <HelpCircle size={48} strokeWidth={1.5} style={{ margin: "0 auto 16px auto", color: "#94A3B8" }} />
            <Typography variant="h6" fontWeight="medium">
              Không tìm thấy lớp học phần phù hợp
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Hãy thử thay đổi bộ lọc học kỳ hoặc từ khóa tìm kiếm.
            </Typography>
          </Box>
        ) : (
          /* Assignments Table */
          <TableContainer component={Box} sx={{ border: "1px solid #F1F5F9", borderRadius: 3 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#F8FAFC" }}>Mã Lớp Học Phần</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#F8FAFC" }}>Môn Học</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#F8FAFC" }}>Lớp Hành Chính</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#F8FAFC" }}>Giảng Viên Phụ Trách</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", backgroundColor: "#F8FAFC" }}>Sức Chứa</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", backgroundColor: "#F8FAFC" }}>Lịch Mẫu</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", backgroundColor: "#F8FAFC" }}>Buổi Học</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", backgroundColor: "#F8FAFC" }}>Trạng Thái</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", backgroundColor: "#F8FAFC" }}>Thao Tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAssignments.map((row) => (
                  <TableRow key={row.sectionId} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell fontWeight="medium" sx={{ color: "#0F172A", fontWeight: 600 }}>
                      {row.sectionCode}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium" color="#1E293B">
                          {row.courseName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Mã môn: {row.courseCode}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.classCode || "Tự do"}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: "bold",
                          color: row.classCode ? "#3B82F6" : "#64748B",
                          borderColor: row.classCode ? "#DBEAFE" : "#E2E8F0",
                          backgroundColor: row.classCode ? "#EFF6FF" : "#F8FAFC"
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {row.lecturerId ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#EFF6FF", color: "#1D4ED8", display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center", fontWeight: "bold", fontSize: 13 }}>
                            {row.lecturerName ? row.lecturerName.charAt(0) : "G"}
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight="semibold" color="#0F172A">
                              {row.lecturerName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Mã GV: {row.lecturerCode}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic" }}>
                          Chưa phân công
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="medium">
                        {row.maxCapacity}
                      </Typography>
                    </TableCell>
                    {/* Has Schedule */}
                    <TableCell align="center">
                      <Chip
                        label={row.hasSchedule ? "Có" : "Không"}
                        size="small"
                        sx={{
                          fontWeight: "bold",
                          fontSize: 11,
                          color: row.hasSchedule ? "#1E293B" : "#94A3B8",
                          backgroundColor: row.hasSchedule ? "#E0F2FE" : "#F1F5F9"
                        }}
                      />
                    </TableCell>
                    {/* Has Generated Sessions */}
                    <TableCell align="center">
                      <Chip
                        label={row.hasGeneratedSessions ? "Đã sinh" : "Chưa sinh"}
                        size="small"
                        sx={{
                          fontWeight: "bold",
                          fontSize: 11,
                          color: row.hasGeneratedSessions ? "#6B21A8" : "#64748B",
                          backgroundColor: row.hasGeneratedSessions ? "#F3E8FF" : "#F8FAFC"
                        }}
                      />
                    </TableCell>
                    {/* Status */}
                    <TableCell align="center">
                      <Chip
                        label={row.status === "open" ? "Mở" : row.status === "closed" ? "Đóng" : "Hủy"}
                        size="small"
                        color={row.status === "open" ? "success" : row.status === "closed" ? "default" : "error"}
                        sx={{ fontWeight: "bold", fontSize: 11, minWidth: 60 }}
                      />
                    </TableCell>
                    {/* Actions */}
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                        {row.lecturerId ? (
                          <>
                            <Button
                              variant="text"
                              size="small"
                              startIcon={<UserCheck size={14} />}
                              onClick={() => handleOpenAssignDialog(row)}
                              sx={{ fontWeight: "bold", color: "#2563EB" }}
                            >
                              Đổi
                            </Button>
                            <Button
                              variant="text"
                              size="small"
                              color="error"
                              startIcon={<UserX size={14} />}
                              onClick={() => handleUnassignLecturer(row)}
                              sx={{ fontWeight: "bold" }}
                            >
                              Gỡ
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleOpenAssignDialog(row)}
                            sx={{
                              fontWeight: "bold",
                              borderRadius: 2,
                              backgroundColor: "#1E3A8A",
                              "&:hover": { backgroundColor: "#172554" }
                            }}
                          >
                            Phân công
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Assign/Change Lecturer Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm" sx={{ borderRadius: 3 }}>
        <DialogTitle sx={{ fontWeight: "bold", pb: 1, color: "#1E3A8A" }}>
          {selectedSection?.lecturerId ? "Thay đổi Giảng viên" : "Phân công Giảng viên"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            <Box sx={{ p: 2, backgroundColor: "#F8FAFC", borderRadius: 3, border: "1px solid #E2E8F0" }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Lớp học phần tuyển chọn
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="#0F172A">
                {selectedSection?.sectionCode} - {selectedSection?.courseName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Lớp hành chính: {selectedSection?.classCode || "Tự do"} | Sĩ số tối đa: {selectedSection?.maxCapacity}
              </Typography>
            </Box>

            {/* Lecturer Dropdown Selector */}
            <FormControl fullWidth size="medium" required>
              <InputLabel id="dialog-lecturer-label">Chọn giảng viên giảng dạy chính</InputLabel>
              <Select
                labelId="dialog-lecturer-label"
                value={selectedLecturerId}
                label="Chọn giảng viên giảng dạy chính"
                onChange={(e) => setSelectedLecturerId(e.target.value)}
                disabled={lecturersLoading}
              >
                {lecturers.map((l) => (
                  <MenuItem key={l.lecturerId} value={l.lecturerId}>
                    {l.lecturerCode} - {l.fullName} ({l.departmentCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Apply To Generated Sessions Checkbox */}
            {selectedSection?.hasGeneratedSessions && (
              <Box sx={{ p: 2, border: "1px dashed #C084FC", borderRadius: 3, backgroundColor: "#FAF5FF" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={applyToSessions}
                      onChange={(e) => setApplyToSessions(e.target.checked)}
                      color="secondary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="bold" color="#6B21A8">
                        Áp dụng cho các buổi học đã sinh trong tương lai
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Đồng thời cập nhật thông tin giảng viên cho các buổi học thực tế chưa diễn ra (Trạng thái Scheduled, Makeup, Rescheduled).
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={actionLoading} sx={{ borderRadius: 2 }}>
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAssignment}
            disabled={actionLoading}
            sx={{
              borderRadius: 2,
              px: 3,
              backgroundColor: "#1E3A8A",
              "&:hover": { backgroundColor: "#172554" }
            }}
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : "Xác nhận & Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Toast */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={notification.severity}
          variant="filled"
          onClose={() => setNotification({ ...notification, open: false })}
          sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default SectionAssignment;