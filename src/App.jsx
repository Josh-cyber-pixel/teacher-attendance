import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage        from './pages/LoginPage';
import TeacherPage      from './pages/TeacherPage';
import AdminPage        from './pages/AdminPage';
import AdminReports     from './pages/AdminReports';
import AdminSettings    from './pages/AdminSettings';

function Router() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <p style={{ color:'#64748b' }}>Loading…</p>
    </div>
  );

  if (!user) return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*"      element={<Navigate to="/login" replace />} />
    </Routes>
  );

  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  return (
    <Routes>
      <Route path="/teacher"         element={isAdmin ? <Navigate to="/admin" replace /> : <TeacherPage />} />
      <Route path="/admin"           element={isAdmin ? <AdminPage />     : <Navigate to="/teacher" replace />} />
      <Route path="/admin/reports"   element={isAdmin ? <AdminReports />  : <Navigate to="/teacher" replace />} />
      <Route path="/admin/settings"  element={isAdmin ? <AdminSettings /> : <Navigate to="/teacher" replace />} />
      <Route path="*" element={<Navigate to={isAdmin ? '/admin' : '/teacher'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}