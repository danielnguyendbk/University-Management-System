import { Link } from 'react-router-dom';

// MUI
import {
  Container,
  Card,
  CardContent,
  Typography,
  Stack,
  Button
} from '@mui/material';

const Home = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Student Management System
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Manage students efficiently with CRUD operations
          </Typography>

          <Stack spacing={2}>
            <Button
              component={Link}
              to="/students"
              variant="contained"
              size="large"
            >
              View All Students
            </Button>

            <Button
              component={Link}
              to="/students/new"
              variant="outlined"
              size="large"
            >
              Add New Student
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Home;
