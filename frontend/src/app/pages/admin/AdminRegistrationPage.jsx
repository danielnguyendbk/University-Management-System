import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  Stack,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  Settings, 
  Play, 
  Square, 
  Lock, 
  RefreshCw, 
  Calendar, 
  Bell 
} from 'lucide-react';
import { registrationApi } from '../../../api/registrationApi';

export function AdminRegistrationPage() {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [regForm, setRegForm] = useState({
    registrationOpen: '',
    registrationClose: '',
    sendNotification: false
  });

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const res = await registrationApi.admin.getSemesters();
      if (res.data.success) {
        setSemesters(res.data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể tải danh sách học kỳ';
      setError(msg);
      setNotification({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (semester) => {
    setSelectedSemester(semester);
    setRegForm({
      registrationOpen: semester.registrationOpen ? semester.registrationOpen.substring(0, 16) : '',
      registrationClose: semester.registrationClose ? semester.registrationClose.substring(0, 16) : '',
      sendNotification: false
    });
    setOpenDialog(true);
  };

  const handleSaveRegistration = async () => {
    try {
      const res = await registrationApi.admin.openRegistration(selectedSemester.semesterId, regForm);
      if (res.data.success) {
        setNotification({ open: true, message: 'Đã cập nhật thời gian đăng ký', severity: 'success' });
        setOpenDialog(false);
        fetchSemesters();
      }
    } catch (err) {
      setNotification({ open: true, message: err.response?.data?.message || 'Cập nhật thất bại', severity: 'error' });
    }
  };

  const handleAction = async (semesterId, action) => {
    try {
      let res;
      if (action === 'close') res = await registrationApi.admin.closeRegistration(semesterId);
      else if (action === 'lock') res = await registrationApi.admin.lockRegistration(semesterId);
      
      if (res && res.data.success) {
        setNotification({ open: true, message: 'Thao tác thành công', severity: 'success' });
        fetchSemesters();
      }
    } catch (err) {
      setNotification({ open: true, message: err.response?.data?.message || 'Thao tác thất bại', severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'success';
      case 'CLOSED': return 'default';
      case 'LOCKED': return 'error';
      default: return 'primary';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Quản lý Đăng ký môn học
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thiết lập thời gian đăng ký và quản lý trạng thái học kỳ
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<RefreshCw size={18} />} 
          onClick={fetchSemesters}
          disabled={loading}
        >
          Làm mới
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {semesters.map((s) => (
            <Grid item xs={12} md={6} lg={4} key={s.semesterId}>
              <Card elevation={2} sx={{ borderRadius: 3, position: 'relative', overflow: 'visible' }}>
                <Box sx={{ position: 'absolute', top: -10, right: 20, zIndex: 1 }}>
                  <Chip 
                    label={s.registrationStatus} 
                    color={getStatusColor(s.registrationStatus)}
                    sx={{ fontWeight: 'bold', px: 1 }}
                  />
                </Box>
                <CardContent sx={{ pt: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {s.semesterName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Mã học kỳ: {s.semesterCode} | Năm học: {s.academicYear}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Calendar size={16} color="#666" />
                      <Typography variant="body2">
                        Bắt đầu: {s.registrationOpen ? new Date(s.registrationOpen).toLocaleString() : 'Chưa thiết lập'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Calendar size={16} color="#666" />
                      <Typography variant="body2">
                        Kết thúc: {s.registrationClose ? new Date(s.registrationClose).toLocaleString() : 'Chưa thiết lập'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button 
                      variant="contained" 
                      size="small" 
                      startIcon={<Play size={16} />}
                      onClick={() => handleOpenDialog(s)}
                    >
                      Thiết lập
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="warning"
                      startIcon={<Square size={16} />}
                      disabled={s.registrationStatus === 'CLOSED'}
                      onClick={() => handleAction(s.semesterId, 'close')}
                    >
                      Đóng
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="error"
                      startIcon={<Lock size={16} />}
                      disabled={s.registrationStatus === 'LOCKED'}
                      onClick={() => handleAction(s.semesterId, 'lock')}
                    >
                      Khóa
                    </Button>
                    <Tooltip title="Quản lý lớp học phần">
                      <IconButton size="small" color="primary" sx={{ ml: 'auto' }}>
                         <Settings size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog thiết lập */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Thiết lập thời gian đăng ký - {selectedSemester?.semesterName}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Thời gian mở"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={regForm.registrationOpen}
              onChange={(e) => setRegForm({ ...regForm, registrationOpen: e.target.value })}
            />
            <TextField
              label="Thời gian đóng"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={regForm.registrationClose}
              onChange={(e) => setRegForm({ ...regForm, registrationClose: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveRegistration}>Lưu & Mở đăng ký</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={4000} 
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AdminRegistrationPage;
