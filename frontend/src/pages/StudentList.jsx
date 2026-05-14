import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllStudents, deleteStudent } from '../services/studentService';

// MUI
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await getAllStudents();

      if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else {
        setError('Unexpected response format from server');
      }
    } catch (err) {
      setError(
        'Failed to fetch students: ' +
        (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      await deleteStudent(id);
      setStudents(students.filter(student => student.id !== id));
    } catch (err) {
      setError(
        'Failed to delete student: ' +
        (err.response?.data?.message || err.message)
      );
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 8 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4">Students</Typography>

        <Button
          component={Link}
          to="/students/new"
          variant="contained"
        >
          Add Student
        </Button>
      </Stack>

      {students.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>First Name</strong></TableCell>
                <TableCell><strong>Last Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {students.map(student => (
                <TableRow key={student.id}>
                  <TableCell>{student.id}</TableCell>
                  <TableCell>{student.firstName}</TableCell>
                  <TableCell>{student.lastName}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        component={Link}
                        to={`/students/${student.id}`}
                        size="small"
                      >
                        View
                      </Button>

                      <Button
                        component={Link}
                        to={`/students/${student.id}/edit`}
                        size="small"
                      >
                        Edit
                      </Button>

                      <Button
                        color="error"
                        size="small"
                        onClick={() => handleDelete(student.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No students found</Typography>
      )}
    </Container>
  );
};

export default StudentList;
