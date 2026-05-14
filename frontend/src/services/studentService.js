import axios from 'axios';

const API_BASE_URL = '/api/students'; 
// separate dev env and prod env can be handled in vite.config.js proxy
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
//create axios instance


// Add interceptor to log all responses
api.interceptors.response.use(
  response => {
    console.log('✅ API Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('❌ API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const getAllStudents = () => api.get('');
export const getStudentById = (id) => api.get(`/${id}`);
export const createStudent = (student) => api.post('', student);
export const updateStudent = (id, student) => api.put(`/${id}`, student);
export const deleteStudent = (id) => api.delete(`/${id}`);

export default api;