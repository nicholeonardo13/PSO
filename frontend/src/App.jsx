import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import ParentsPage from './pages/parents/ParentList';
import ParentDetailPage from './pages/parents/ParentDetail';
import TeachersPage from './pages/teachers/TeacherList';
import CoursesPage from './pages/courses/CourseList';
import SessionRatesPage from './pages/session-rates/SessionRateList';
import SessionsPage from './pages/sessions/SessionList';
import RecordSessionPage from './pages/sessions/RecordSession';
import PaymentsPage from './pages/payments/PaymentList';
import RecordPaymentPage from './pages/payments/RecordPayment';
import MonthlyInvoicePage from './pages/invoices/MonthlyInvoice';
import YearlySummaryPage from './pages/invoices/YearlySummary';
import GenerateInvoicePage from './pages/invoices/GenerateInvoice';
import SalaryPage from './pages/salary/SalaryPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="parents" element={<ParentsPage />} />
        <Route path="parents/:id" element={<ParentDetailPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="session-rates" element={<SessionRatesPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="sessions/new" element={<RecordSessionPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="payments/new" element={<RecordPaymentPage />} />
        <Route path="invoices/generate" element={<GenerateInvoicePage />} />
        <Route path="invoices/:parentId/:year/:month" element={<MonthlyInvoicePage />} />
        <Route path="invoices/:parentId/:year" element={<YearlySummaryPage />} />
        <Route path="salary" element={<SalaryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
