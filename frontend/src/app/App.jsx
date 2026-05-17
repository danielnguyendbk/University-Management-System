import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-right" />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
