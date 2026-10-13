import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import WardenDashboard from './pages/WardenDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token') || localStorage.getItem('hostelhive_token');
  const userStr = localStorage.getItem('hostelhive_user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3500,
            style: {
              background: '#12181F',
              color: '#F7F5F0',
              fontSize: '13px',
              borderRadius: '12px',
              padding: '12px 16px',
              border: '1px solid rgba(201, 161, 92, 0.2)',
              fontFamily: 'Inter, system-ui, sans-serif'
            },
            success: {
              iconTheme: { primary: '#5E7A6B', secondary: '#F7F5F0' }
            },
            error: {
              iconTheme: { primary: '#B5533C', secondary: '#F7F5F0' }
            }
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Warden Protected Portal */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin', 'warden']}>
                <WardenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warden/*"
            element={
              <ProtectedRoute allowedRoles={['admin', 'warden']}>
                <WardenDashboard />
              </ProtectedRoute>
            }
          />

          {/* Student Protected Portal */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
