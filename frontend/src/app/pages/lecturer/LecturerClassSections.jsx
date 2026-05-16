import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  Grid,
  Divider,
  Stack
} from '@mui/material';
import {
  Users,
  BookOpen,
  RefreshCw,
  Download
} from 'lucide-react';
import { registrationApi } from '../../../api/registrationApi';

export function LecturerClassSections() {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [semesterLoading, setSemesterLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

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
      const res = await registrationApi.admin.getSemesters();
      if (res.data.success) {
        setSemesters(res.data.data);
        if (res.data.data.length > 0) setSelectedSemester(res.data.data[0].semesterId);
      }
    } catch (err) {
      setNotification({ open: true, message: 'Không thể tải danh sách học kỳ', severity: 'error' });
    } finally {
      setSemesterLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await registrationApi.lecturer.getSections(selectedSemester);
      if (res.data.success) {
        setSections(res.data.data);
      }
    } catch (err) {
      setNotification({ open: true, message: 'Không thể tải danh sách lớp học phần', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudents = async (section) => {
    setSelectedSection(section);
    setOpenDialog(true);
    setStudents([]);
    try {
      const res = await registrationApi.lecturer.getSectionStudents(section.sectionId);
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      setNotification({ open: true, message: 'Không thể tải danh sách sinh viên', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary">Lớp học phần</Typography>
          <Typography variant="body1" color="text.secondary">Danh sách các lớp bạn đang phụ trách</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Học kỳ</InputLabel>
            <Select
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
          <IconButton onClick={fetchSections} color="primary">
            <RefreshCw size={20} />
          </IconButton>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {sections.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
                <Typography color="text.secondary">Không tìm thấy lớp học phần nào trong học kỳ này</Typography>
              </Paper>
            </Grid>
          ) : (
            sections.map((section) => (
              <Grid item xs={12} md={6} lg={4} key={section.sectionId}>
                <Card elevation={2} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Chip label={section.sectionCode} color="primary" size="small" variant="outlined" />
                      <Chip label={section.status} size="small" variant="contained" color={section.status === 'open' ? 'success' : 'default'} />
                    </Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>{section.courseName}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Mã HP: {section.courseCode} | {section.credits} Tín chỉ</Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Stack direction="row" spacing={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Sinh viên</Typography>
                        <Typography variant="h6" fontWeight="bold">{section.currentCapacity}/{section.maxCapacity}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Tỉ lệ lấp đầy</Typography>
                        <Typography variant="h6" fontWeight="bold">{Math.round((section.currentCapacity/section.maxCapacity)*100)}%</Typography>
                      </Box>
                    </Stack>

                    <Button 
                      fullWidth 
                      variant="contained" 
                      startIcon={<Users size={18} />} 
                      sx={{ mt: 3, borderRadius: 2 }}
                      onClick={() => handleViewStudents(section)}
                    >
                      Danh sách sinh viên
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Dialog danh sách sinh viên */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           Danh sách sinh viên - {selectedSection?.sectionCode}
           <Button startIcon={<Download size={18} />} size="small">Xuất Excel</Button>
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Mã SV</TableCell>
                  <TableCell>Họ và tên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày đăng ký</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center">Đang tải hoặc không có sinh viên</TableCell></TableRow>
                ) : (
                  students.map((s) => (
                    <TableRow key={s.enrollmentId}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{s.studentCode}</TableCell>
                      <TableCell>{s.fullName}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>
                         <Chip 
                           label={s.enrollmentStatus} 
                           size="small" 
                           color={s.enrollmentStatus === 'registered' ? 'success' : 'warning'} 
                         />
                      </TableCell>
                      <TableCell>{new Date(s.registeredAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} variant="contained">Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default LecturerClassSections;