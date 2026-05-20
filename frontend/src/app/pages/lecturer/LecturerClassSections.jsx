import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
  Tooltip
} from '@mui/material';
import {
  Users,
  Calendar,
  Search,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { lecturerCourseSectionApi } from '../../../api/lecturerCourseSectionApi';

export function LecturerClassSections() {
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [sections, setSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [semesterLoading, setSemesterLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      fetchSections();
    }
  }, [selectedSemester]);

  const fetchSemesters = async () => {
    try {
      setSemesterLoading(true);
      const res = await lecturerCourseSectionApi.getSemesters();
      if (res.data.success) {
        setSemesters(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedSemester(res.data.data[0].semesterId);
        }
      }
    } catch (err) {
      setNotification({
        open: true,
        message: 'Không thể tải danh sách học kỳ',
        severity: 'error'
      });
    } finally {
      setSemesterLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await lecturerCourseSectionApi.getMyCourseSections(selectedSemester);
      if (res.data.success) {
        setSections(res.data.data || []);
      }
    } catch (err) {
      setNotification({
        open: true,
        message: 'Không thể tải danh sách lớp học phần',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudents = async (section) => {
    setSelectedSection(section);
    setOpenDialog(true);
    setStudents([]);
    try {
      const res = await lecturerCourseSectionApi.getSectionStudents(section.sectionId);
      if (res.data.success) {
        setStudents(res.data.data || []);
      }
    } catch (err) {
      setNotification({
        open: true,
        message: 'Không thể tải danh sách sinh viên',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Filter sections by code or name
  const filteredSections = sections.filter(sec => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    return (
      (sec.sectionCode && sec.sectionCode.toLowerCase().includes(search)) ||
      (sec.courseName && sec.courseName.toLowerCase().includes(search)) ||
      (sec.courseCode && sec.courseCode.toLowerCase().includes(search)) ||
      (sec.classCode && sec.classCode.toLowerCase().includes(search))
    );
  });

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header section with modern glass/elevated feel */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="800" color="primary.main" gutterBottom sx={{ letterSpacing: '-0.5px' }}>
              Lớp Học Phần Giảng Dạy
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Xem và quản lý các lớp học phần được phân công giảng dạy theo từng học kỳ.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Tìm mã lớp, tên môn học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color="#666" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: { xs: '100%', sm: 260 }, bgcolor: '#fff', borderRadius: 1 }}
            />

            {/* Semester Dropdown */}
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 }, bgcolor: '#fff', borderRadius: 1 }}>
              <InputLabel id="semester-select-label">Học kỳ</InputLabel>
              <Select
                labelId="semester-select-label"
                value={selectedSemester}
                label="Học kỳ"
                onChange={(e) => setSelectedSemester(e.target.value)}
                disabled={semesterLoading}
              >
                {semesters.map(s => (
                  <MenuItem key={s.semesterId} value={s.semesterId}>{s.semesterName}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <IconButton onClick={fetchSections} color="primary" disabled={loading} sx={{ alignSelf: 'center', border: '1px solid #e0e0e0', p: 1, bgcolor: '#fff' }}>
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      {/* Main Table Content */}
      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3, border: '1px solid #eee', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 12, gap: 2 }}>
            <CircularProgress size={45} />
            <Typography variant="body2" color="text.secondary">Đang tải danh sách lớp học phần...</Typography>
          </Box>
        ) : (
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Mã Lớp Học Phần</TableCell>
                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Môn Học</TableCell>
                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Lớp Hành Chính</TableCell>
                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Học Kỳ</TableCell>
                <TableCell sx={{ fontWeight: '700', color: '#475569' }} align="center">Sĩ Số</TableCell>
                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Trạng Thái</TableCell>
                <TableCell sx={{ fontWeight: '700', color: '#475569' }} align="center">Có Lịch Mẫu?</TableCell>
                <TableCell sx={{ fontWeight: '700', color: '#475569' }} align="center">Đã Sinh Buổi Học?</TableCell>
                <TableCell sx={{ fontWeight: '700', color: '#475569' }} align="center">Hành Động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 10 }}>
                    <Typography color="text.secondary" variant="subtitle1" fontWeight="500">
                      {searchTerm 
                        ? "Không tìm thấy lớp học phần nào khớp với từ khóa tìm kiếm." 
                        : "Bạn chưa được phân công lớp học phần nào trong học kỳ này."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSections.map((sec) => {
                  const capacityPercent = sec.maxCapacity ? Math.round((sec.currentCapacity / sec.maxCapacity) * 100) : 0;
                  
                  return (
                    <TableRow key={sec.sectionId} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {/* Section Code Badge */}
                      <TableCell>
                        <Chip
                          label={sec.sectionCode}
                          color="primary"
                          variant="outlined"
                          size="small"
                          sx={{ fontWeight: 'bold', px: 1, height: 26, fontSize: '0.8rem' }}
                        />
                      </TableCell>

                      {/* Course Details */}
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight="600" sx={{ color: '#1e293b' }}>
                            {sec.courseName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Mã HP: <strong>{sec.courseCode}</strong> | {sec.credits} Tín chỉ
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Administrative Class */}
                      <TableCell>
                        {sec.classCode ? (
                          <Chip 
                            label={sec.classCode} 
                            variant="filled" 
                            size="small" 
                            sx={{ bgcolor: '#e2e8f0', color: '#334155', fontWeight: '500' }} 
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">Lớp tự do</Typography>
                        )}
                      </TableCell>

                      {/* Semester */}
                      <TableCell>
                        <Typography variant="body2" fontWeight="500" color="text.primary">
                          {sec.semesterName}
                        </Typography>
                      </TableCell>

                      {/* Capacity Indicator */}
                      <TableCell align="center">
                        <Tooltip title={`Tỉ lệ đăng ký: ${capacityPercent}%`}>
                          <Box>
                            <Typography variant="body2" fontWeight="700" sx={{ color: '#0f172a' }}>
                              {sec.currentCapacity} / {sec.maxCapacity}
                            </Typography>
                            {/* Color coding helper for capacity indicator bar */}
                            <Box sx={{ width: '100%', mt: 0.8, height: 4, bgcolor: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                              <Box 
                                sx={{ 
                                  width: `${capacityPercent}%`, 
                                  height: '100%', 
                                  bgcolor: capacityPercent >= 90 ? '#ef4444' : capacityPercent >= 50 ? '#3b82f6' : '#10b981' 
                                }} 
                              />
                            </Box>
                          </Box>
                        </Tooltip>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={sec.status === 'open' ? 'Hoạt động' : sec.status === 'closed' ? 'Đã khóa' : sec.status === 'cancelled' ? 'Hủy lớp' : sec.status}
                          size="small"
                          color={sec.status === 'open' ? 'success' : sec.status === 'cancelled' ? 'error' : 'default'}
                          sx={{ textTransform: 'capitalize', fontWeight: '600', height: 22 }}
                        />
                      </TableCell>

                      {/* Has Schedule? */}
                      <TableCell align="center">
                        {sec.hasSchedule ? (
                          <Tooltip title="Đã có lịch mẫu được thiết lập">
                            <Box sx={{ display: 'flex', justifyContent: 'center', color: '#10b981' }}>
                              <CheckCircle size={20} fill="#ecfdf5" />
                            </Box>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Chưa thiết lập lịch mẫu">
                            <Box sx={{ display: 'flex', justifyContent: 'center', color: '#94a3b8' }}>
                              <XCircle size={20} />
                            </Box>
                          </Tooltip>
                        )}
                      </TableCell>

                      {/* Has Generated Sessions? */}
                      <TableCell align="center">
                        {sec.hasGeneratedSessions ? (
                          <Tooltip title="Đã sinh chi tiết lịch dạy theo tuần">
                            <Box sx={{ display: 'flex', justifyContent: 'center', color: '#3b82f6' }}>
                              <CheckCircle size={20} fill="#eff6ff" />
                            </Box>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Chưa sinh các buổi học chi tiết">
                            <Box sx={{ display: 'flex', justifyContent: 'center', color: '#94a3b8' }}>
                              <XCircle size={20} />
                            </Box>
                          </Tooltip>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Users size={14} />}
                            onClick={() => handleViewStudents(sec)}
                            sx={{ borderRadius: 2, textTransform: 'none', px: 1.5 }}
                          >
                            Xem SV
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            color="secondary"
                            startIcon={<Calendar size={14} />}
                            onClick={() => navigate('/portal/lecturer/schedule')}
                            sx={{ borderRadius: 2, textTransform: 'none', px: 1.5 }}
                          >
                            Lịch dạy
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Dialog Danh sách sinh viên */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', pb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Danh Sách Sinh Viên Đăng Ký
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Lớp học phần: <strong>{selectedSection?.sectionCode}</strong> - {selectedSection?.courseName}
            </Typography>
          </Box>
          <Button startIcon={<FileSpreadsheet size={16} />} size="small" variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
            Xuất Excel
          </Button>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 0 }}>
          <TableContainer sx={{ maxHeight: 450 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', color: '#475569' }}>Mã SV</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', color: '#475569' }}>Họ và tên</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', color: '#475569' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', color: '#475569' }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', color: '#475569' }}>Ngày đăng ký</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Đang tải hoặc chưa có sinh viên đăng ký lớp này.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((s) => (
                    <TableRow key={s.enrollmentId} hover>
                      <TableCell sx={{ fontWeight: 'bold', color: '#0f172a' }}>{s.studentCode}</TableCell>
                      <TableCell sx={{ fontWeight: '500' }}>{s.fullName}</TableCell>
                      <TableCell>{s.email || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={s.enrollmentStatus === 'registered' ? 'Đã Đăng Ký' : s.enrollmentStatus === 'dropped' ? 'Đã Hủy' : s.enrollmentStatus} 
                          size="small" 
                          color={s.enrollmentStatus === 'registered' ? 'success' : 'warning'} 
                          variant="filled"
                          sx={{ fontWeight: '600', height: 20, fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell color="text.secondary">
                        {s.registeredAt ? new Date(s.registeredAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, pl: 1 }}>
            Tổng số: <strong>{students.length}</strong> sinh viên
          </Typography>
          <Button onClick={() => setOpenDialog(false)} variant="contained" sx={{ borderRadius: 2, px: 3, textTransform: 'none' }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modern Snackbar Notification */}
      <Snackbar open={notification.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={notification.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default LecturerClassSections;