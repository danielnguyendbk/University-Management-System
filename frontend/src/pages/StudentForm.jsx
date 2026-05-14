import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createStudent, getStudentById, updateStudent } from '../services/studentService';

// MUI
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      const fetchStudent = async () => {
        try {
          const response = await getStudentById(id);
          setForm({
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email
          });
        } catch (err) {
          setError('Failed to fetch student');
        }
      };
      fetchStudent();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        await updateStudent(id, form);
      } else {
        await createStudent(form);
      }
      navigate('/students');
    } catch (err) {
      setError('Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {isEdit ? 'Edit Student' : 'Add New Student'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                fullWidth
              />

              <TextField
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                fullWidth
              />

              <TextField
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                fullWidth
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/students')}
                  disabled={loading}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default StudentForm;
