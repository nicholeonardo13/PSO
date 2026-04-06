import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pso_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pso_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Dashboard
export const getDashboard = () => api.get('/dashboard');

// Parents
export const getParents = (params) => api.get('/parents', { params });
export const getParent = (id) => api.get(`/parents/${id}`);
export const getParentOutstanding = (id) => api.get(`/parents/${id}/outstanding`);
export const createParent = (data) => api.post('/parents', data);
export const updateParent = (id, data) => api.put(`/parents/${id}`, data);
export const deleteParent = (id) => api.delete(`/parents/${id}`);

// Students
export const getStudents = (params) => api.get('/students', { params });
export const getAllStudents = () => api.get('/students', { params: { withParent: true } });
export const createStudent = (data) => api.post('/students', data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

// Teachers
export const getTeachers = (params) => api.get('/teachers', { params });
export const getTeacher = (id) => api.get(`/teachers/${id}`);
export const getTeacherSalary = (id) => api.get(`/teachers/${id}/salary`);
export const createTeacher = (data) => api.post('/teachers', data);
export const updateTeacher = (id, data) => api.put(`/teachers/${id}`, data);
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`);

// Courses
export const getCourses = (params) => api.get('/courses', { params });
export const createCourse = (data) => api.post('/courses', data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

// Session Rates
export const getSessionRates = (params) => api.get('/session-rates', { params });
export const lookupSessionRate = (params) => api.get('/session-rates/lookup', { params });
export const createSessionRate = (data) => api.post('/session-rates', data);
export const updateSessionRate = (id, data) => api.put(`/session-rates/${id}`, data);
export const deleteSessionRate = (id) => api.delete(`/session-rates/${id}`);

// Sessions
export const getSessions = (params) => api.get('/sessions', { params });
export const createSession = (data) => api.post('/sessions', data);
export const updateSession = (id, data) => api.put(`/sessions/${id}`, data);
export const deleteSession = (id) => api.delete(`/sessions/${id}`);

// Payments
export const getPayments = (params) => api.get('/payments', { params });
export const createPayment = (data) => api.post('/payments', data);

// Invoices
export const getInvoices = (params) => api.get('/invoices', { params });
export const getMonthlyInvoice = (parentId, year, month) =>
  api.get(`/invoices/${parentId}/${year}/${month}`);
export const getYearlySummary = (parentId, year) =>
  api.get(`/invoices/${parentId}/${year}`);

// Salary
export const getSalaries = (params) => api.get('/salary', { params });
export const getSalaryPreview = (year, month) => api.get(`/salary/preview/${year}/${month}`);
export const getSalaryDetail = (year, month) => api.get(`/salary/detail/${year}/${month}`);
export const generateSalary = (year, month) => api.post(`/salary/generate/${year}/${month}`);
