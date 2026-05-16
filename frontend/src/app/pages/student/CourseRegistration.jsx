import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  BookOpen,
  Trash2,
  Info,
  RefreshCw,
  Clock,
  Users
} from 'lucide-react';
import { registrationApi } from '../../../api/registrationApi';

const unwrapApiResponse = (res) => {
  return res?.data?.success !== undefined ? res.data : res;
};

export function CourseRegistration() {
  console.log("registrationApi imported =", registrationApi);
  console.log("student api =", registrationApi.student);

  const [activeTab, setActiveTab] = useState(0);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [availableSections, setAvailableSections] = useState([]);
  const [mySections, setMySections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [semesterLoading, setSemesterLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (!selectedSemester) return;

    if (activeTab === 0) {
      fetchAvailableSections(selectedSemester);
    } else {
      fetchMySections(selectedSemester);
    }
  }, [selectedSemester, activeTab]);

  const fetchSemesters = async () => {
    try {
      setSemesterLoading(true);
      const res = await registrationApi.student.getSemesters();
      console.log("SEMESTERS FRONTEND RESPONSE =", res);

      const body = unwrapApiResponse(res);
      if (body?.success) {
        const rows = body.data || [];
        setSemesters(rows);

        const openSemester = rows.find(s => s.registrationStatus === 'OPEN');
        const defaultSemester = openSemester || rows[0];

        setSelectedSemester(defaultSemester ? Number(defaultSemester.semesterId) : null);
      }
    } catch (err) {
      console.error("Fetch semesters error:", err);
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Không thể tải danh sách học kỳ',
        severity: 'error',
      });
    } finally {
      setSemesterLoading(false);
    }
  };

  const fetchAvailableSections = async (semesterIdParam = selectedSemester) => {
    const semesterId = Number(semesterIdParam);
    if (!semesterId) {
      setAvailableSections([]);
      return;
    }

    try {
      setLoading(true);
      const res = await registrationApi.student.getAvailableSections(semesterId);
      const body = unwrapApiResponse(res);
      if (body?.success) {
        setAvailableSections(body.data || []);
      }
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Không thể tải danh sách lớp học phần',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMySections = async (semesterIdParam = selectedSemester) => {
    const semesterId = Number(semesterIdParam);
    if (!semesterId) {
      setMySections([]);
      return;
    }

    try {
      setLoading(true);
      const res = await registrationApi.student.getMySections(semesterId);
      const body = unwrapApiResponse(res);
      if (body?.success) {
        setMySections(body.data || []);
      }
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Không thể tải danh sách lớp đã đăng ký',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (sectionId) => {
    try {
      const res = await registrationApi.student.register(sectionId);
      if (res.data.success) {
        setNotification({ open: true, message: 'Đăng ký thành công!', severity: 'success' });
        fetchAvailableSections();
      }
    } catch (err) {
      setNotification({ open: true, message: err.response?.data?.message || 'Đăng ký thất bại', severity: 'error' });
    }
  };

  const handleDrop = async (enrollmentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đăng ký lớp này?')) return;
    try {
      const res = await registrationApi.student.drop(enrollmentId);
      if (res.data.success) {
        setNotification({ open: true, message: 'Hủy đăng ký thành công!', severity: 'success' });
        fetchMySections();
      }
    } catch (err) {
      setNotification({ open: true, message: err.response?.data?.message || 'Hủy đăng ký thất bại', severity: 'error' });
    }
  };

  const renderAvailableTable = () => (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
          <TableRow>
            <TableCell>Mã HP</TableCell>
            <TableCell>Tên môn học</TableCell>
            <TableCell align="center">Tín chỉ</TableCell>
            <TableCell>Giảng viên</TableCell>
            <TableCell>Lịch học</TableCell>
            <TableCell align="center">Sức chứa</TableCell>
            <TableCell align="center">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {availableSections.length === 0 ? (
            <TableRow><TableCell colSpan={7} align="center">Không có lớp học phần nào khả dụng</TableCell></TableRow>
          ) : (
            availableSections.map((row) => (
              <TableRow key={row.sectionId} hover>
                <TableCell sx={{ fontWeight: 'bold' }}>{row.courseCode}</TableCell>
                <TableCell>{row.courseName}</TableCell>
                <TableCell align="center">{row.credits}</TableCell>
                <TableCell>{row.lecturerName || 'Chưa phân công'}</TableCell>
                <TableCell sx={{ fontSize: '0.85rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Clock size={14} color="#666" />
                    {row.scheduleText}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={`Còn lại: ${row.remainingCapacity}`}>
                    <Box>
                      <Typography variant="body2">{row.currentCapacity}/{row.maxCapacity}</Typography>
                      <Box sx={{ width: '100%', bgcolor: '#eee', height: 4, borderRadius: 2, mt: 0.5 }}>
                        <Box sx={{ width: `${(row.currentCapacity / row.maxCapacity) * 100}%`, bgcolor: row.remainingCapacity < 5 ? 'error.main' : 'primary.main', height: '100%', borderRadius: 2 }} />
                      </Box>
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  {row.canRegister ? (
                    <Button
                      variant="contained"
                      startIcon={<BookOpen size={16} />}
                      size="small"
                      onClick={() => handleRegister(row.sectionId)}
                    >
                      Đăng ký
                    </Button>
                  ) : (
                    <Tooltip title={row.blockedReason || "Không thể đăng ký"}>
                      <Box>
                        <Button variant="outlined" disabled size="small">{row.alreadyRegistered ? 'Đã đăng ký' : 'Chặn'}</Button>
                      </Box>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMySectionsTable = () => (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
          <TableRow>
            <TableCell>Mã HP</TableCell>
            <TableCell>Tên môn học</TableCell>
            <TableCell align="center">Tín chỉ</TableCell>
            <TableCell>Lịch học</TableCell>
            <TableCell>Ngày đăng ký</TableCell>
            <TableCell align="center">Trạng thái</TableCell>
            <TableCell align="center">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mySections.length === 0 ? (
            <TableRow><TableCell colSpan={7} align="center">Bạn chưa đăng ký lớp nào trong học kỳ này</TableCell></TableRow>
          ) : (
            mySections.map((row) => (
              <TableRow key={row.enrollmentId} hover>
                <TableCell sx={{ fontWeight: 'bold' }}>{row.courseCode}</TableCell>
                <TableCell>{row.courseName}</TableCell>
                <TableCell align="center">{row.credits}</TableCell>
                <TableCell sx={{ fontSize: '0.85rem' }}>{row.scheduleText}</TableCell>
                <TableCell sx={{ fontSize: '0.85rem' }}>{new Date(row.registeredAt).toLocaleDateString()}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={row.enrollmentStatus === 'registered' ? 'Thành công' : row.enrollmentStatus}
                    color={row.enrollmentStatus === 'registered' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<Trash2 size={16} />}
                    disabled={!row.canDrop}
                    onClick={() => handleDrop(row.enrollmentId)}
                  >
                    Hủy
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const currentSemesterInfo = semesters.find(
    s => Number(s.semesterId) === Number(selectedSemester)
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Đăng ký môn học
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Học kỳ</InputLabel>
            <Select
              value={selectedSemester ?? ''}
              label="Học kỳ"
              onChange={(e) => {
                const value = e.target.value;
                setSelectedSemester(value ? Number(value) : null);
              }}
              disabled={semesterLoading}
            >
              {semesters.map(s => (
                <MenuItem key={s.semesterId} value={s.semesterId}>
                  {s.semesterName} {s.registrationStatus === 'OPEN' ? '(Đang mở)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton
            onClick={() => {
              if (!selectedSemester) {
                setNotification({
                  open: true,
                  message: 'Vui lòng chọn học kỳ trước',
                  severity: 'warning',
                });
                return;
              }

              activeTab === 0
                ? fetchAvailableSections(selectedSemester)
                : fetchMySections(selectedSemester);
            }}
            color="primary"
            disabled={!selectedSemester || loading}
          >
            <RefreshCw size={20} />
          </IconButton>
        </Box>
      </Box>

      {currentSemesterInfo && (
        <Alert icon={<Info size={20} />} severity={currentSemesterInfo.registrationStatus === 'OPEN' ? "info" : "warning"} sx={{ mb: 3 }}>
          Học kỳ: <strong>{currentSemesterInfo.semesterName}</strong> —
          Trạng thái: <strong>{currentSemesterInfo.registrationStatus}</strong> |
          Thời gian: {currentSemesterInfo.registrationOpen ? new Date(currentSemesterInfo.registrationOpen).toLocaleString() : 'N/A'} - {currentSemesterInfo.registrationClose ? new Date(currentSemesterInfo.registrationClose).toLocaleString() : 'N/A'}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Lớp học phần có sẵn" icon={<BookOpen size={18} />} iconPosition="start" />
          <Tab label="Lớp đã đăng ký" icon={<Users size={18} />} iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            activeTab === 0 ? renderAvailableTable() : renderMySectionsTable()
          )}
        </Box>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default CourseRegistration;
