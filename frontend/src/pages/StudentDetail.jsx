import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentById } from '../services/studentService';

// MUI
import {
  Container,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  CircularProgress
} from '@mui/material';

const StudentDetail = () => {
  const { id } = useParams();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await getStudentById(id);
        setStudent(response.data);
      } catch (err) {
        setError('Failed to fetch student');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!student) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <Typography>Student not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Student Details
          </Typography>

          <Typography><strong>ID:</strong> {student.id}</Typography>
          <Typography><strong>First Name:</strong> {student.firstName}</Typography>
          <Typography><strong>Last Name:</strong> {student.lastName}</Typography>
          <Typography><strong>Email:</strong> {student.email}</Typography>
          <Typography><strong>Created At:</strong> {student.createdAt}</Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              component={Link}
              to="/students"
              variant="outlined"
            >
              Back
            </Button>

            <Button
              component={Link}
              to={`/students/${student.id}/edit`}
              variant="contained"
            >
              Edit
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default StudentDetail;
