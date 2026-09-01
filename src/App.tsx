import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminLogin from './pages/auth/AdminLogin';

import StudentDashboard from './pages/student/Dashboard';
import StudentCourses from './pages/student/Courses';
import StudentAnnouncements from './pages/student/Announcements';
import StudentAdvisor from './pages/student/Advisor';

import AdvisorDashboard from './pages/advisor/Dashboard';
import AdvisorStudents from './pages/advisor/Students';

import AdminDashboard from './pages/admin/Dashboard';
import AdminReports from './pages/admin/Reports';
import AdminCurricula from './pages/admin/Curricula';

import AnnouncementsManager from './pages/shared/AnnouncementsManager';
import Settings from './pages/shared/Settings';

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { useAuthListener } from './hooks/useAuthListener';

function App() {
  useAuthListener();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Staff-only login — not linked from the public landing page */}
        <Route path="/admin" element={<AdminLogin />} />
        
        <Route element={<Layout />}>
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/courses" element={<ProtectedRoute allowedRoles={['student']}><StudentCourses /></ProtectedRoute>} />
          <Route path="/student/announcements" element={<ProtectedRoute allowedRoles={['student']}><StudentAnnouncements /></ProtectedRoute>} />
          <Route path="/student/advisor" element={<ProtectedRoute allowedRoles={['student']}><StudentAdvisor /></ProtectedRoute>} />
          <Route path="/student/settings" element={<ProtectedRoute allowedRoles={['student']}><Settings /></ProtectedRoute>} />
          
          {/* Advisor Routes */}
          <Route path="/advisor/dashboard" element={<ProtectedRoute allowedRoles={['advisor']}><AdvisorDashboard /></ProtectedRoute>} />
          <Route path="/advisor/students" element={<ProtectedRoute allowedRoles={['advisor']}><AdvisorStudents /></ProtectedRoute>} />
          <Route path="/advisor/announcements" element={<ProtectedRoute allowedRoles={['advisor']}><AnnouncementsManager /></ProtectedRoute>} />
          <Route path="/advisor/settings" element={<ProtectedRoute allowedRoles={['advisor']}><Settings /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/curricula" element={<ProtectedRoute allowedRoles={['admin']}><AdminCurricula /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['admin']}><AnnouncementsManager /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
